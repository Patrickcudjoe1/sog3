"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Product } from "@/app/lib/products"
import { useCart } from './CartContext'
import { formatCurrency } from "@/app/lib/currency"
import { toast } from "sonner"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ProductDetailClientProps {
  product: Product
}

// Accordion component for expandable sections
function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-xs tracking-widest uppercase font-light">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-sm font-light leading-relaxed text-gray-700 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter()
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || "")
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [sizeError, setSizeError] = useState("")
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const { addToCart } = useCart()

  // Create image array (main image + any additional images if available)
  // Remove duplicates and ensure we have at least the main image
  const productImages = [
    product.image,
    ...(product.images || []).filter(img => img !== product.image)
  ].filter(Boolean) as string[]

  // Handle swipe for mobile
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && selectedImageIndex < productImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
    if (isRightSwipe && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
  }

  // Reset size error when size is selected
  useEffect(() => {
    if (selectedSize) {
      setSizeError("")
    }
  }, [selectedSize])

  const handleAddToCart = () => {
    // Validate size selection
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError("Please select a size")
      toast.error("Please select a size")
      return
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      quantity: quantity,
      productId: product.id,
    })

    toast.success("Item added to cart!", {
      description: `${product.name}${selectedSize ? ` (${selectedSize})` : ""}${selectedColor ? ` - ${selectedColor}` : ""}`,
    })
  }

  const handleBuyNow = () => {
    // Validate size selection
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError("Please select a size")
      toast.error("Please select a size")
      return
    }

    // Add to cart first
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      quantity: quantity,
      productId: product.id,
    })

    // Navigate to checkout
    router.push("/checkout")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
      {/* Product Image Gallery */}
      <div className="space-y-4">
        {/* Main Image - Swipeable on mobile */}
        <div
          className="relative w-full aspect-square bg-gray-50 overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Image
            src={productImages[selectedImageIndex] || product.image || "/SOG1.jpg"}
            alt={product.name}
            fill
            className="object-cover"
            priority={selectedImageIndex === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          
          {/* Image indicator dots for mobile */}
          {productImages.length > 1 && (
            <div className="md:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    selectedImageIndex === index ? "bg-black" : "bg-white/50"
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Gallery - Desktop */}
        {productImages.length > 1 && (
          <div className="hidden md:grid grid-cols-4 gap-4">
            {productImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative aspect-square bg-gray-50 overflow-hidden border-2 transition-all ${
                  selectedImageIndex === index
                    ? "border-black"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 12.5vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col justify-start space-y-6 md:space-y-8">
        {/* Product Header */}
        <div>
          <p className="text-xs tracking-widest uppercase font-light text-gray-600 mb-2">
            {product.category}
          </p>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide mb-3">
            {product.name}
          </h1>
          <p className="text-xl md:text-2xl font-light">{formatCurrency(product.price)}</p>
        </div>

        {/* Short Description */}
        <p className="text-sm md:text-base font-light leading-relaxed text-gray-700">
          {product.description}
        </p>

        {/* Color Selection */}
        {product.colors && product.colors.length > 0 && (
          <div>
            <p className="text-xs tracking-widest uppercase font-light mb-3">
              Color: <span className="font-normal">{selectedColor}</span>
            </p>
            {product.colors.length > 1 && (
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 md:w-12 md:h-12 border-2 transition-all rounded-sm ${
                      selectedColor === color
                        ? "border-black scale-110"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                    title={color}
                    aria-label={`Select color ${color}`}
                    style={{
                      backgroundColor:
                        color.toLowerCase() === "black"
                          ? "#000000"
                          : color.toLowerCase() === "white"
                            ? "#ffffff"
                            : color.toLowerCase() === "gray"
                              ? "#d1d5db"
                              : color.toLowerCase() === "cream"
                                ? "#fef3c7"
                                : color.toLowerCase() === "charcoal"
                                  ? "#36454f"
                                  : color.toLowerCase() === "pink"
                                    ? "#ec4899"
                                    : color.toLowerCase() === "orange"
                                      ? "#f97316"
                                      : color.toLowerCase() === "brown"
                                        ? "#92400e"
                                        : color.toLowerCase() === "gold"
                                          ? "#fbbf24"
                                          : color.toLowerCase() === "green"
                                            ? "#10b981"
                                            : color.toLowerCase() === "red"
                                              ? "#ef4444"
                                              : color.toLowerCase() === "navy"
                                                ? "#1e3a8a"
                                                : color.toLowerCase() === "blue"
                                                  ? "#3b82f6"
                                                  : "#f5f5f5",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Size Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs tracking-widest uppercase font-light">
                Size: <span className="font-normal">{selectedSize || "Select Size"}</span>
              </p>
              {sizeError && (
                <span className="text-xs text-red-600 animate-in fade-in">{sizeError}</span>
              )}
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size)
                    setSizeError("")
                  }}
                  className={`py-3 border text-xs tracking-widest uppercase font-light transition-all ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div>
          <p className="text-xs tracking-widest uppercase font-light mb-3">Quantity</p>
          <div className="flex items-center gap-4 border border-gray-300 w-fit">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 hover:bg-gray-100 transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="px-4 py-2 text-sm font-light min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2 hover:bg-gray-100 transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={handleAddToCart}
            className="btn-outline flex-1 py-4 text-sm tracking-widest uppercase font-light"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="bg-black text-white px-8 py-4 text-sm tracking-widest uppercase font-light hover:bg-gray-900 transition-colors flex-1"
          >
            Buy Now
          </button>
        </div>

        {/* Expandable Product Details */}
        <div className="border-t border-gray-200 pt-6 space-y-0">
          <Accordion title="Product Description" defaultOpen={false}>
            <p className="text-sm font-light leading-relaxed text-gray-700">
              {product.description}
            </p>
            <p className="mt-4 text-sm font-light leading-relaxed text-gray-700">
              Crafted with attention to detail, this piece from our {product.category} collection
              embodies quality and style. Perfect for everyday wear or special occasions.
            </p>
          </Accordion>

          <Accordion title="Materials & Care">
            <div className="space-y-3">
              <div>
                <p className="font-medium mb-1">Materials</p>
                <p className="text-sm text-gray-600">
                  Premium quality materials sourced responsibly. Each piece is carefully selected
                  for durability and comfort.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Care Instructions</p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Machine wash cold with like colors</li>
                  <li>Do not bleach</li>
                  <li>Tumble dry low or hang dry</li>
                  <li>Iron on low heat if needed</li>
                </ul>
              </div>
            </div>
          </Accordion>

          <Accordion title="Shipping & Returns">
            <div className="space-y-3">
              <div>
                <p className="font-medium mb-1">Shipping</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Free shipping on orders over ₵100</li>
                  <li>Standard delivery: 3-5 business days</li>
                  <li>Express delivery: 1-2 business days (additional fee)</li>
                  <li>International shipping available</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Returns</p>
                <p className="text-sm text-gray-600">
                  Easy returns within 30 days of purchase. Items must be unworn, unwashed, and in
                  original packaging with tags attached.
                </p>
              </div>
            </div>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
