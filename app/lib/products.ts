export interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description: string
  sizes?: string[]
  colors?: string[]
  isNewArrival?: boolean
  slug?: string
  images?: string[] // Additional product images for gallery
}

/**
 * Generate a URL-friendly slug from product name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Generate slug for a product if it doesn't exist
 */
export function getProductSlug(product: Product): string {
  if (product.slug) return product.slug
  return generateSlug(product.name)
}

/**
 * Find product by ID
 */
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

/**
 * Find product by slug
 */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => getProductSlug(p) === slug)
}

/**
 * Get all product slugs for static generation
 */
export function getAllProductSlugs(): string[] {
  return products.map((p) => getProductSlug(p))
}

export const products: Product[] = [
  {
    id: "1",
    name: "Band Collar Short Sleeve Shirt",
    price: 185,
    image: "/SOG1.jpg",
    category: "Essentials",
    description: "Premium band collar shirt crafted from fine cotton blend",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Gray"],
    isNewArrival: true,
  },
  {
    id: "2",
    name: "Croc Embossed Slide",
    price: 145,
    image: "/SOG2.jpg",
    category: "Essentials",
    description: "Minimalist slide with embossed croc texture",
    sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
    colors: ["Black"],
    isNewArrival: true,
  },
  {
    id: "3",
    name: "Oversized Wool Coat",
    price: 595,
    image: "/SOG3.jpg",
    category: "Athletics",
    description: "Luxurious oversized wool coat for elevated style",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    isNewArrival: false,
  },
  {
    id: "4",
    name: "Essential Tee",
    price: 95,
    image: "/SOG4.jpg",
    category: "Essentials",
    description: "Premium cotton essential t-shirt",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["White"],
    isNewArrival: true,
  },
  {
    id: "5",
    name: "Tailored Trousers",
    price: 325,
    image: "/SOG5.jpg",
    category: "Essentials",
    description: "Perfectly tailored trousers in premium fabric",
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["Black"],
    isNewArrival: false,
  },
  {
    id: "6",
    name: "Leather Crossbody Bag",
    price: 425,
    image: "/SOG6.jpg",
    category: "Essentials",
    description: "Minimalist leather crossbody bag",
    sizes: ["One Size"],
    colors: ["Black"],
    isNewArrival: false,
  },
  {
    id: "7",
    name: "Classic Denim Jacket",
    price: 275,
    image: "/SOG7.jpg",
    category: "Essentials",
    description: "Timeless denim jacket with modern fit",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Blue"],
    isNewArrival: true,
  },
  {
    id: "8",
    name: "Wool Blazer",
    price: 485,
    image: "/SOG8.jpg",
    category: "Essentials",
    description: "Sophisticated wool blazer for formal occasions",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Navy"],
    isNewArrival: true,
  },
  {
    id: "9",
    name: "Cotton Sweatshirt",
    price: 135,
    image: "/SOG9.jpg",
    category: "Essentials",
    description: "Comfortable premium cotton sweatshirt",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Gray"],
    isNewArrival: false,
  },
  {
    id: "10",
    name: "Leather Boots",
    price: 525,
    image: "/SOG10.jpg",
    category: "Essentials",
    description: "Handcrafted leather boots with premium finish",
    sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
    colors: ["Brown"],
    isNewArrival: true,
  },
  // Caps
  {
    id: "cap-1",
    name: "Classic Logo Cap",
    price: 150,
    image: "/caps/cap-a.png",
    category: "Caps",
    description: "Premium cotton cap with embroidered logo",
    sizes: ["One Size"],
    colors: ["Black"],
  },
  {
    id: "cap-2",
    name: "Minimalist Snapback",
    price: 150,
    image: "/caps/cap-bl.png",
    category: "Caps",
    description: "Clean design snapback cap",
    sizes: ["One Size"],
    colors: ["Black"],
  },
  {
    id: "cap-3",
    name: "Heritage Baseball Cap",
    price: 150,
    image: "/caps/cap-g.png",
    category: "Caps",
    description: "Classic baseball cap with premium materials",
    sizes: ["One Size"],
    colors: ["Black"],
  },
  {
    id: "cap-4",
    name: "Structured Cap",
    price: 150,
    image: "/caps/cap-p.png",
    category: "Caps",
    description: "Structured cap with modern silhouette",
    sizes: ["One Size"],
    colors: ["Black"],
  },
  {
    id: "cap-5",
    name: "Five-Panel Cap",
    price: 150,
    image: "/caps/cap-r.png",
    category: "Caps",
    description: "Five-panel design with subtle branding",
    sizes: ["One Size"],
    colors: ["Black"],
  },
  {
    id: "cap-6",
    name: "Premium Wool Cap",
    price: 150,
    image: "/caps/cap-m.png",
    category: "Caps",
    description: "Luxury wool cap for elevated style",
    sizes: ["One Size"],
    colors: ["Black"],
  },
  // Tote Bags
  {
    id: "tote-1",
    name: "Canvas Tote Bag",
    price: 95,
    image: "/tote/SOG_16.jpg",
    category: "Tote Bags",
    description: "Durable canvas tote with leather handles",
    sizes: ["One Size"],
    colors: ["Cream"],
  },
  {
    id: "tote-2",
    name: "Minimalist Tote",
    price: 120,
    image: "/tote/SOG_17.jpg",
    category: "Tote Bags",
    description: "Clean design tote bag for everyday use",
    sizes: ["One Size"],
    colors: ["Black"],
  },
  {
    id: "tote-3",
    name: "Leather Tote Bag",
    price: 285,
    image: "/tote/SOG_18.jpg",
    category: "Tote Bags",
    description: "Premium leather tote with structured design",
    sizes: ["One Size"],
    colors: ["Black"],
  },
  {
    id: "tote-4",
    name: "Oversized Tote",
    price: 135,
    image: "/tote/SOG_19.jpg",
    category: "Tote Bags",
    description: "Spacious tote bag for all your essentials",
    sizes: ["One Size"],
    colors: ["Black"],
  },
  {
    id: "tote-5",
    name: "Reversible Tote",
    price: 145,
    image: "/tote/SOG_20.jpg",
    category: "Tote Bags",
    description: "Versatile reversible tote bag",
    sizes: ["One Size"],
    colors: ["Black"],
  },
  {
    id: "tote-6",
    name: "Premium Canvas Tote",
    price: 110,
    image: "/tote/SOG_16.jpg",
    category: "Tote Bags",
    description: "High-quality canvas tote with reinforced handles",
    sizes: ["One Size"],
    colors: ["Cream"],
  },
  // Presence
  {
    id: "presence-1",
    name: "Presence Essential Tee",
    price: 350,
    image: "/presence/shirt-black.png",
    category: "Presence",
    description: "Core essential tee from the Presence collection",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "presence-2",
    name: "Presence Hoodie",
    price: 350,
    image: "/presence/shirt-pink.png",
    category: "Presence",
    description: "Premium hoodie with Presence branding",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Pink"],
  },
  {
    id: "presence-3",
    name: "Presence Sweatpants",
    price: 350,
    image: "/presence/ddd.jpg",
    category: "Presence",
    description: "Comfortable sweatpants from Presence line",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "presence-4",
    name: "Presence Long Sleeve",
    price: 350,
    image: "/presence/fff.jpg",
    category: "Presence",
    description: "Long sleeve shirt with minimal design",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["White"],
  },
  {
    id: "presence-5",
    name: "Presence Shorts",
    price: 350,
    image: "/presence/shirt-white.png",
    category: "Presence",
    description: "Athletic shorts from Presence collection",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["White"],
  },
  {
    id: "presence-6",
    name: "Presence Crewneck",
    price: 350,
    image: "/presence/SOG_30.jpg",
    category: "Presence",
    description: "Classic crewneck sweater",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  // Trinity
  {
    id: "trinity-1",
    name: "Trinity Logo Tee",
    price: 350,
    image: "/trinity/trinity-1.png",
    category: "Trinity",
    description: "Signature Trinity collection t-shirt",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "trinity-2",
    name: "Trinity Track Jacket",
    price: 350,
    image: "/trinity/trinity-2.png",
    category: "Trinity",
    description: "Athletic track jacket from Trinity line",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Orange"],
  },
  {
    id: "trinity-3",
    name: "Trinity Joggers",
    price: 350,
    image: "/trinity/trinity-3.png",
    category: "Trinity",
    description: "Premium joggers with Trinity branding",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Brown"],
  },
  {
    id: "trinity-4",
    name: "Trinity Pullover",
    price: 350,
    image: "/trinity/trinity-4.png",
    category: "Trinity",
    description: "Comfortable pullover from Trinity collection",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["White"],
  },
  {
    id: "trinity-5",
    name: "Trinity Windbreaker",
    price: 350,
    image: "/trinity/trinity-5.png",
    category: "Trinity",
    description: "Lightweight windbreaker jacket",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "trinity-6",
    name: "Trinity Sweatshirt",
    price: 350,
    image: "/trinity/trinity-6.png",
    category: "Trinity",
    description: "Classic sweatshirt with Trinity design",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Brown"],
  },
  // Hoodies
  {
    id: "hoodie-1",
    name: "Classic Pullover Hoodie",
    price: 155,
    image: "/hoodies/hoodie-1.jpg",
    category: "Hoodies",
    description: "Essential pullover hoodie with premium cotton",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "hoodie-2",
    name: "Zip-Up Hoodie",
    price: 175,
    image: "/hoodies/hoodie-2.jpg",
    category: "Hoodies",
    description: "Versatile zip-up hoodie for everyday wear",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "hoodie-3",
    name: "Oversized Hoodie",
    price: 165,
    image: "/hoodies/hoodie-3.jpg",
    category: "Hoodies",
    description: "Comfortable oversized fit hoodie",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "hoodie-4",
    name: "Crop Hoodie",
    price: 145,
    image: "/hoodies/hoodie-4.jpg",
    category: "Hoodies",
    description: "Modern crop-length hoodie",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black"],
  },
  {
    id: "hoodie-5",
    name: "Fleece Lined Hoodie",
    price: 195,
    image: "/hoodies/hoodie-5.jpg",
    category: "Hoodies",
    description: "Warm fleece-lined hoodie for cooler weather",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "hoodie-6",
    name: "Minimalist Hoodie",
    price: 160,
    image: "/hoodies/hoodie-6.jpg",
    category: "Hoodies",
    description: "Clean design hoodie with minimal branding",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  // Jerseys
  {
    id: "jersey-1",
    name: "Classic Basketball Jersey",
    price: 300,
    image: "/jerseys/jersey-1.jpg",
    category: "Jerseys",
    description: "Authentic basketball jersey design",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Gold"],
  },
  {
    id: "jersey-2",
    name: "Mesh Training Jersey",
    price: 300,
    image: "/jerseys/jersey-2.jpg",
    category: "Jerseys",
    description: "Breathable mesh training jersey",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Gold"],
  },
  {
    id: "jersey-3",
    name: "Vintage Style Jersey",
    price: 300,
    image: "/jerseys/jersey-3.jpg",
    category: "Jerseys",
    description: "Retro-inspired vintage jersey",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Green"],
  },
  {
    id: "jersey-4",
    name: "Performance Jersey",
    price: 300,
    image: "/jerseys/jersey-4.jpg",
    category: "Jerseys",
    description: "High-performance athletic jersey",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Red"],
  },
  {
    id: "jersey-5",
    name: "Long Sleeve Jersey",
    price: 300,
    image: "/jerseys/jersey-5.jpg",
    category: "Jerseys",
    description: "Long sleeve jersey for cooler conditions",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Gold"],
  },
  {
    id: "jersey-6",
    name: "Limited Edition Jersey",
    price: 300,
    image: "/jerseys/jersey-6.jpg",
    category: "Jerseys",
    description: "Exclusive limited edition jersey",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Gold"],
  },
]
