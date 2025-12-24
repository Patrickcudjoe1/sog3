import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Verify payment status for an order
 * Used to check payment status after redirect from payment gateway
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId")
    const reference = searchParams.get("reference")

    if (!orderId && !reference) {
      return NextResponse.json(
        { error: "Order ID or Paystack reference is required" },
        { status: 400 }
      )
    }

    let order

    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          shippingAddress: true,
        },
      })
    } else if (reference) {
      order = await prisma.order.findFirst({
        where: { paystackReference: reference },
        include: {
          items: true,
          shippingAddress: true,
        },
      })
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      totalAmount: order.totalAmount,
      paid: order.paymentStatus === "COMPLETED",
    })
  } catch (error: any) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    )
  }
}
