import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useProduct } from '../hooks/useProduct.js'
import { useAuth } from '../../auth/hook/useAuth.js'
import { useNavigate } from 'react-router'
import { setUser } from '../../auth/state/auth.slice.js'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

const Home = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { handleGetAllProducts } = useProduct()
  const { handleGetMe } = useAuth()

  // Selectors
  const products = useSelector(state => state.product.products || [])
  const user = useSelector(state => state.auth.user)

  // Local UI States
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("newest") // newest, price-asc, price-desc
  const [activeImageIndex, setActiveImageIndex] = useState({}) // mapping: productID -> activeImageIndex

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        await handleGetAllProducts()
        if (!user) {
          await handleGetMe()
        }
      } catch (err) {
        console.error("Initialization failed:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Handle hash scrolling on page load/navigation
  useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.substring(1))
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' })
        }, 150)
      }
    }
  }, [loading])

  const handleLogout = () => {
    dispatch(setUser(null))
    navigate("/login")
  }

  // Format price helper
  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Card hover photo switcher helper
  const handleThumbnailHover = (productId, imageIndex) => {
    setActiveImageIndex(prev => ({
      ...prev,
      [productId]: imageIndex
    }))
  }

  const getActiveImage = (product) => {
    const activeIdx = activeImageIndex[product._id] ?? 0
    if (product.images && product.images.length > 0) {
      return product.images[activeIdx]?.url || product.images[0]?.url
    }
    return "https://placehold.co/600x800/201f22/ffd700?text=No+Image"
  }

  // Mock categories based on titles/descriptions
  const categories = ["All", "New Arrivals", "Essentials", "Premium"]

  // Filter & Sort Products
  const filteredProducts = products.filter(prod => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = prod.title?.toLowerCase().includes(query) || prod.description?.toLowerCase().includes(query)
    
    if (!matchesSearch) return false
    
    // Category mapping logic based on mock tags or titles
    if (selectedCategory === "New Arrivals") {
      // Just filter products created recently (mocked logic)
      return new Date(prod.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
    if (selectedCategory === "Essentials") {
      return prod.description?.toLowerCase().includes("essential") || prod.title?.toLowerCase().includes("receipt") || prod.price?.amount < 2000
    }
    if (selectedCategory === "Premium") {
      return prod.price?.amount >= 2000 || prod.title?.toLowerCase().includes("logo") || prod.title?.toLowerCase().includes("emblem")
    }
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt)
    } else if (sortBy === 'price-asc') {
      return (a.price?.amount || 0) - (b.price?.amount || 0)
    } else if (sortBy === 'price-desc') {
      return (b.price?.amount || 0) - (a.price?.amount || 0)
    }
    return 0
  })

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md flex flex-col overflow-x-hidden custom-scrollbar">
      
      {/* Shared Navbar */}
      <Navbar />

      {/* Editorial High-Fashion Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center bg-black overflow-hidden">
        {/* Dark Editorial Image Background Placeholder */}
        <div className="absolute inset-0 bg-cover bg-center opacity-65 scale-105 transition-all duration-[2s] hover:scale-100" 
             style={{ backgroundImage: `url('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=80')` }}>
        </div>
        {/* Soft elegant gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-black/50"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Hero Copy */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 space-y-6">
          <span className="text-primary-container text-xs font-label-sm tracking-[0.3em] uppercase block">
            STREETWEAR ARCHIVE
          </span>
          <h1 className="text-5xl md:text-8xl font-black font-display tracking-tight text-white uppercase leading-none">
            REDEFINE <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-container via-primary-fixed to-white">
              YOUR STYLE
            </span>
          </h1>
          <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto font-light tracking-wide leading-relaxed">
            Minimal aesthetics, heavy-weight fabrics, and premium drops designed to last. Explore the collection crafted for self-expression.
          </p>
          <div className="pt-6">
            <button
              onClick={() => {
                const el = document.getElementById("catalog-section");
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-black hover:bg-primary-container hover:text-on-primary transition-all duration-300 font-label-md text-xs uppercase tracking-widest py-4 px-10 rounded-none inline-flex items-center gap-3 cursor-pointer shadow-lg"
            >
              Explore Drops
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Brand Values / Trust Section */}
      <section id="values-section" className="py-12 bg-surface-container-lowest border-y border-surface-container-high/40">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <span className="material-symbols-outlined text-primary-container text-3xl">workspace_premium</span>
            <h3 className="font-display font-bold uppercase tracking-wider text-sm">Heavyweight Fabrics</h3>
            <p className="text-xs text-on-surface-variant font-light">Custom knit materials from 240GSM to 450GSM for ultimate drape and comfort.</p>
          </div>
          <div className="space-y-2">
            <span className="material-symbols-outlined text-primary-container text-3xl">local_shipping</span>
            <h3 className="font-display font-bold uppercase tracking-wider text-sm">Express Shipping</h3>
            <p className="text-xs text-on-surface-variant font-light">Dispatched within 24 hours with reliable, real-time tracking straight to your door.</p>
          </div>
          <div className="space-y-2">
            <span className="material-symbols-outlined text-primary-container text-3xl">published_with_changes</span>
            <h3 className="font-display font-bold uppercase tracking-wider text-sm">Easy Exchanges</h3>
            <p className="text-xs text-on-surface-variant font-light">Wrong size? No problem. Hassle-free 7-day courier exchange pick-up.</p>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section id="catalog-section" className="grow w-full max-w-7xl mx-auto px-6 py-20 space-y-12">
        
        {/* Editorial Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-surface-container-highest/55 pb-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black font-display tracking-wider uppercase">LATEST DROPS</h2>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest font-light">Shop the curated apparel from the database catalog</p>
          </div>

          {/* Minimal Search Field */}
          <div className="relative flex items-center w-full md:max-w-xs group">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant/70 group-focus-within:text-primary-container transition-colors text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drops..."
              className="w-full bg-transparent border-b border-surface-container-high focus:border-primary-container pl-9 pr-6 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Minimal Categories & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs uppercase tracking-widest py-2.5 px-6 font-semibold transition-all duration-200 cursor-pointer rounded-none border ${
                  selectedCategory === cat
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-on-surface-variant border-surface-container-high hover:border-on-surface-variant"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-on-surface-variant/60 font-label-sm text-[11px] uppercase tracking-wider">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-surface-container-high text-on-surface text-xs uppercase tracking-wider px-4 py-2 focus:outline-none focus:border-primary-container cursor-pointer transition-colors duration-200"
            >
              <option value="newest" className="bg-background">Newest</option>
              <option value="price-asc" className="bg-background">Price: Low-High</option>
              <option value="price-desc" className="bg-background">Price: High-Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid Area */}
        {loading ? (
          /* Premium Shimmer Skeletons (Portrait Ratio) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-3/4 bg-surface-container rounded-none"></div>
                <div className="h-4 bg-surface-container rounded w-3/4"></div>
                <div className="h-4 bg-surface-container rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          /* Empty Catalog State */
          <div className="py-20 text-center space-y-6 max-w-md mx-auto">
            <span className="material-symbols-outlined text-primary-container text-4xl block">info</span>
            <h3 className="font-display font-black uppercase tracking-wider text-lg">No Items Found</h3>
            <p className="text-sm text-on-surface-variant font-light">
              We couldn't find any drops matching your criteria. Try altering your filters or search query.
            </p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All")
                setSortBy("newest")
              }}
              className="border border-white hover:bg-white hover:text-black text-xs uppercase tracking-widest py-3 px-8 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Premium Fashion Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {sortedProducts.map((product) => {
              const images = product.images || []
              return (
                <div
                  key={product._id}
                  className="group flex flex-col h-full space-y-4"
                  onClick={()=> navigate(`/product/${product._id}`)}
                >
                  {/* Portrait Product Image Frame */}
                  <div className="relative aspect-3/4 bg-surface-container overflow-hidden cursor-pointer">
                    <img
                      src={getActiveImage(product)}
                      alt={product.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Media Assets Camera Count Badge */}
                    {images.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black/75 text-primary-container font-label-sm text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-none flex items-center gap-1 shadow-md">
                        <span className="material-symbols-outlined text-xs">photo_camera</span>
                        {images.length}
                      </div>
                    )}

                    {/* Image Quick Switcher Bar on Hover */}
                    {images.length > 1 && (
                      <div className="absolute bottom-0 left-0 right-0 justify-center gap-1.5 flex opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 bg-linear-to-t from-black/85 to-transparent py-4">
                        {images.slice(0, 5).map((img, idx) => (
                          <div
                            key={img._id}
                            onMouseEnter={(e) => {
                              e.stopPropagation()
                              handleThumbnailHover(product._id, idx)
                            }}
                            className={`w-8 h-8 rounded-none border overflow-hidden cursor-crosshair transition-all ${
                              (activeImageIndex[product._id] ?? 0) === idx
                                ? "border-primary-container scale-105 shadow-md" 
                                : "border-white/20 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Info Details */}
                  <div className="space-y-1 flex flex-col justify-between grow">
                    <div className="space-y-1">
                      <h4 className="font-display font-bold uppercase tracking-wider text-sm line-clamp-1 group-hover:text-primary-container transition-colors">
                        {product.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant font-light line-clamp-2 leading-relaxed">
                        {product.description || "Premium heavyweight cotton garment."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="font-bold text-primary-container text-sm font-display tracking-wider">
                        {formatPrice(product.price?.amount, product.price?.currency)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          alert(`Direct bag addition for "${product.title}" coming soon! Connect checkout API.`)
                        }}
                        className="text-[11px] font-bold uppercase tracking-widest border-b border-white hover:border-primary-container hover:text-primary-container pb-0.5 transition-colors cursor-pointer"
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Elegant Newsletter Signup */}
      <section className="py-20 bg-surface-container-low/40 border-t border-surface-container-high/30">
        <div className="max-w-xl mx-auto px-6 text-center space-y-6">
          <h3 className="text-2xl font-black font-display tracking-widest uppercase">JOIN THE CLUB</h3>
          <p className="text-xs text-on-surface-variant font-light leading-relaxed tracking-wide">
            Subscribe to receive private drops, early access collections, and editorial lookbooks directly to your inbox.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); alert("Subscription mockup complete!"); }} 
                className="flex items-center border-b border-white py-1">
            <input
              type="email"
              placeholder="Your email address"
              className="appearance-none bg-transparent border-none w-full text-sm text-on-surface mr-3 py-1 px-2 leading-tight focus:outline-none placeholder:text-on-surface-variant/30"
              required
            />
            <button
              type="submit"
              className="shrink-0 bg-transparent text-xs font-bold uppercase tracking-widest text-primary-container hover:text-white transition-colors py-1 px-2 cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Shared Footer */}
      <Footer />
    </div>
  )
}

export default Home