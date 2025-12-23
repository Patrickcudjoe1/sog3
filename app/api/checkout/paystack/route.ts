import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/app/lib/supabase/server"
import { PrismaClient, OrderStatus, PaymentStatus } from "@prisma/client"
import { 
  validateCartItems 
} from "@/app/lib/cart-validation"
import { 
  generateIdempotencyKey, 
  sanitizeAmount, 
  validateEmail,
  validateGhanaPhone,
  formatGhanaPhone 
} from "@/app/lib/payment-utils"

const prisma = new PrismaClient()
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `SOG-${timestamp}-${random}`
}

/**
 * Paystack Payment Initialization
 * Creates order and initializes Paystack payment
 */
export async function POST(req: NextRequest) {
  try {
    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: "Paystack is not configured" },
        { status: 500 }
      )
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const body = await req.json()

    const {
      items,
      shipping,
      deliveryMethod,
      subtotal,
      shippingCost,
      discount,
      total,
      promoCode,
      paymentMethod,
      mobileMoneyPhone,
      mobileMoneyProvider,
    } = body

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    if (!shipping || !shipping.email || !shipping.fullName) {
      return NextResponse.json({ error: "Shipping information is required" }, { status: 400 })
    }

    if (!validateEmail(shipping.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Mobile money validation (only required for mobile money payments)
    if (paymentMethod === "mobile_money") {
      if (!mobileMoneyPhone || !mobileMoneyProvider) {
        return NextResponse.json({ error: "Mobile money information is required" }, { status: 400 })
      }

      if (!validateGhanaPhone(mobileMoneyPhone)) {
        return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
      }
    }

    // Server-side cart validation
    const validationResult = await validateCartItems(items)

    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          error: "Cart validation failed", 
          details: validationResult.errors 
        },
        { status: 400 }
      )
    }

    const validatedItems = validationResult.validatedItems || items
    const validatedSubtotal = validationResult.correctedSubtotal || subtotal

    // Generate idempotency key
    const idempotencyKey = generateIdempotencyKey()

    // Check for duplicate order
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey },
    })

    if (existingOrder) {
      return NextResponse.json(
        { 
          error: "Duplicate payment detected",
          orderId: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
        },
        { status: 409 }
      )
    }

    // Sanitize amounts
    const sanitizedSubtotal = sanitizeAmount(validatedSubtotal)
    const sanitizedShippingCost = sanitizeAmount(shippingCost)
    const sanitizedDiscount = sanitizeAmount(discount)
    const sanitizedTotal = sanitizeAmount(sanitizedSubtotal + sanitizedShippingCost - sanitizedDiscount)

    // Create shipping address first
    const shippingAddress = await prisma.address.create({
      data: {
        userId: session?.user?.id || null,
        fullName: shipping.fullName,
        email: shipping.email,
        phone: shipping.phone || null,
        addressLine1: shipping.addressLine1,
        addressLine2: shipping.addressLine2 || null,
        city: shipping.city,
        region: shipping.region || null,
        postalCode: shipping.postalCode,
        country: shipping.country || "Ghana",
        isDefault: false,
      },
    })

    // Create order in database
    const orderNumber = generateOrderNumber()
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id || null,
        email: shipping.email,
        phone: shipping.phone || null,
        status: OrderStatus.PENDING,
        subtotal: sanitizedSubtotal,
        shippingCost: sanitizedShippingCost,
        discountAmount: sanitizedDiscount,
        totalAmount: sanitizedTotal,
        promoCode: promoCode || null,
        paymentMethod: paymentMethod || "card",
        paymentStatus: PaymentStatus.PENDING,
        mobileMoneyProvider: paymentMethod === "mobile_money" ? mobileMoneyProvider : null,
        mobileMoneyPhone: paymentMethod === "mobile_money" ? formatGhanaPhone(mobileMoneyPhone) : null,
        deliveryMethod: deliveryMethod || null,
        idempotencyKey,
        shippingAddressId: shippingAddress.id,
        items: {
          create: validatedItems.map((item: any) => ({
            productId: item.productId,
            productName: item.name,
            productImage: item.image,
            price: item.price,
            quantity: item.quantity,
            size: item.size || null,
            color: item.color || null,
          })),
        },
      },
      include: {
        items: true,
        shippingAddress: true,
      },
    })

    // Initialize Paystack payment
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: shipping.email,
        amount: Math.round(sanitizedTotal * 100), // Convert to pesewas
        reference: orderNumber, // Use order number as reference
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/success?orderId=${order.id}`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          idempotencyKey,
          paymentMethod: paymentMethod || "card",
          custom_fields: paymentMethod === "mobile_money" ? [
            {
              display_name: "Mobile Money Provider",
              variable_name: "mobile_money_provider",
              value: mobileMoneyProvider,
            },
            {
              display_name: "Mobile Money Phone",
              variable_name: "mobile_money_phone",
              value: formatGhanaPhone(mobileMoneyPhone),
            },
          ] : [],
        },
      }),
    })

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json()
      // Rollback order creation
      await prisma.order.delete({ where: { id: order.id } })
      return NextResponse.json(
        { error: errorData.message || "Failed to initialize payment" },
        { status: 500 }
      )
    }

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      // Rollback order creation
      await prisma.order.delete({ where: { id: order.id } })
      return NextResponse.json(
        { error: paystackData.message || "Failed to initialize payment" },
        { status: 500 }
      )
    }

    // Update order with Paystack reference
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paystackReference: paystackData.data.reference,
      },
    })

    // Increment promo code usage if applicable
    if (promoCode) {
      await prisma.promoCode.update({
        where: { code: promoCode.toUpperCase() },
        data: { usedCount: { increment: 1 } },
      }).catch(() => {
        // Ignore if promo code doesn't exist
      })
    }

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackData.data.authorization_url,
      accessCode: paystackData.data.access_code,
      reference: paystackData.data.reference,
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  } catch (error: any) {
    console.error("Paystack checkout error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to initialize payment" },
      { status: 500 }
    )
  }
}

