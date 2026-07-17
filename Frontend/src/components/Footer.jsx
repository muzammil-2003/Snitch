import React from 'react'
import { useNavigate } from 'react-router'

const Footer = () => {
  const navigate = useNavigate()

  return (
    <footer className="w-full bg-black border-t border-surface-container-high/20 py-16 text-on-surface-variant/80 text-xs tracking-wide">
      <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-surface-container-high/20 pb-12">
        
        <div className="space-y-4">
          <span className="font-display text-2xl font-black tracking-[0.2em] text-white">
            SNITCH
          </span>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            Premium apparel curated and designed for bold self-expression. High-quality construction. Slow fashion.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-display font-bold uppercase tracking-widest text-white text-xs">Shop</h4>
          <ul className="space-y-2 text-gray-400 font-light">
            <li><button onClick={() => navigate("/")} className="hover:text-white transition-colors cursor-pointer text-left">All Products</button></li>
            <li><button onClick={() => navigate("/")} className="hover:text-white transition-colors cursor-pointer text-left">New Arrivals</button></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-display font-bold uppercase tracking-widest text-white text-xs">Help</h4>
          <ul className="space-y-2 text-gray-400 font-light">
            <li><a href="#" className="hover:text-white transition-colors">Order Tracking</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-display font-bold uppercase tracking-widest text-white text-xs">Legal</h4>
          <ul className="space-y-2 text-gray-400 font-light">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-[10px] font-label-sm uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} SNITCH Clothing Co. All rights reserved.</p>
        <p>Designed for Cohort 2.0</p>
      </div>
    </footer>
  )
}

export default Footer
