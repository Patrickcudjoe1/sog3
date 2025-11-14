"use client"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="w-full bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* Left: Large Product Image */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gray-100 flex items-center justify-center overflow-hidden"
        >
          <img
            src="/SOG14.jpg"
            alt="Featured product"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Right: Shop The Look */}
        <div className="flex flex-col items-center justify-center px-8 md:px-12 py-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl tracking-widest uppercase font-light mb-12 text-center"
          >
           
          </motion.h2>

          <div className="space-y-12 w-full max-w-sm">
            {[1, 2].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: item * 0.1 }}
                viewport={{ once: true }}
                className="text-center cursor-pointer group"
              >
                <div className="bg-gray-50 aspect-square mb-6 flex items-center justify-center overflow-hidden">
                  <img
                    src={`/SOG102.jpg`}
                    alt={`Product`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-xs tracking-widest uppercase font-light">Product Name {item}</p>
                <p className="text-xs text-gray-600 mt-2"></p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
