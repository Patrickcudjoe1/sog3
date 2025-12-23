import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/app/components/navbar"
import Footer from "@/app/components/footer"
import ProductDetailClient from "@/app/components/product-detail-client"
import { products, getProductBySlug, getAllProductSlugs, getProductSlug } from "@/app/lib/products"
import { formatCurrency } from "@/app/lib/currency"

// Static Site Generation - Generate all product pages at build time
export async function generateStaticParams() {
  const slugs = getAllProductSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

// SEO Metadata generation
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = getProductBySlug(params.slug)

  if (!product) {
    return {
      title: "Product Not Found | Son of God",
      description: "The product you're looking for doesn't exist.",
    }
  }

  const title = `${product.name} | Son of God`
  const description = product.description || `${product.name} from Son of God. ${product.category} collection.`
  const imageUrl = product.image.startsWith("/")
    ? `${process.env.NEXT_PUBLIC_BASE_URL || "https://sonofgod.com"}${product.image}`
    : product.image

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/products/${params.slug}`,
    },
  }
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

interface ProductPageProps {
  params: { slug: string }
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  // Get related products from the same category
  const relatedProducts = products
    .filter((p) => {
      const pSlug = getProductSlug(p)
      return p.category === product.category && pSlug !== params.slug
    })
    .slice(0, 3)

  return (
    <main className="w-full">
      <Navbar />

      {/* Breadcrumb */}
      <section className="w-full border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex items-center gap-2 text-xs font-light tracking-wide">
            <Link href="/shop" className="hover:opacity-60 transition-opacity">
              SHOP
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href={`/${product.category.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-gray-600 hover:opacity-60 transition-opacity"
            >
              {product.category}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{product.name}</span>
          </div>
        </div>
      </section>

      {/* Product Detail */}
      <section className="w-full py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <ProductDetailClient product={product} />
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="w-full border-t border-gray-200 py-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-light tracking-wide mb-12">YOU MAY ALSO LIKE</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
              {relatedProducts.map((relatedProduct) => {
                const relatedSlug = getProductSlug(relatedProduct)
                return (
                  <Link key={relatedProduct.id} href={`/products/${relatedSlug}`} className="group">
                    <div className="relative w-full aspect-square bg-gray-100 overflow-hidden mb-4">
                      <Image
                        src={relatedProduct.image || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <p className="text-xs tracking-widest uppercase font-light text-gray-600 mb-2">
                      {relatedProduct.category}
                    </p>
                    <h3 className="text-sm tracking-wide font-light mb-2">{relatedProduct.name}</h3>
                    <p className="text-sm font-light">{formatCurrency(relatedProduct.price)}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}

