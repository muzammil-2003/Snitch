import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useProduct } from '../hooks/useProduct'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '../../auth/hook/useAuth'
import { setUser } from '../../auth/state/auth.slice'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

const ProductDetail = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const { handleGetProductById } = useProduct()
  const { handleGetMe } = useAuth()
  const user = useSelector(state => state.auth.user)

  async function fetchProductDetails() {
    setLoading(true)
    try {
      const data = await handleGetProductById(productId)
      setProduct(data)
      // Check auth status if not already loaded
      if (!user) {
        await handleGetMe()
      }
    } catch (err) {
      console.error("Failed to fetch product details:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductDetails()
  }, [productId])

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

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between">
        <header className="w-full h-20 border-b border-surface-container-highest/40 flex items-center justify-between px-6">
          <span className="font-display text-2xl font-black tracking-[0.2em] text-white">SNITCH</span>
        </header>
        <div className="grow flex items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Loading Product Details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between">
        <header className="w-full h-20 border-b border-surface-container-highest/40 flex items-center justify-between px-6">
          <span className="font-display text-2xl font-black tracking-[0.2em] text-white">SNITCH</span>
          <button onClick={() => navigate("/")} className="text-xs font-bold uppercase tracking-wider text-primary hover:underline">Back to shop</button>
        </header>
        <div className="grow flex flex-col items-center justify-center p-6 space-y-6 text-center">
          <span className="material-symbols-outlined text-primary-container text-5xl">warning</span>
          <h2 className="text-2xl font-black font-display tracking-widest uppercase">Product Not Found</h2>
          <p className="text-sm text-on-surface-variant max-w-md">This product might have been removed, or the link is invalid.</p>
          <button onClick={() => navigate("/")} className="bg-white text-black font-label-md text-xs uppercase tracking-widest py-3 px-8 transition-all">
            Return to shop
          </button>
        </div>
      </div>
    )
  }

  const images = product.images || []
  const activeImage = images[activeImageIndex]?.url || "https://placehold.co/600x800/201f22/ffd700?text=No+Image"

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md flex flex-col overflow-x-hidden custom-scrollbar">

      {/* Shared Navbar */}
      <Navbar />

      {/* Main product details canvas */}
      <main className="grow w-full max-w-7xl mx-auto px-6 py-12 md:py-16">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-on-surface-variant/60 mb-8">
          <button onClick={() => navigate("/")} className="hover:text-primary-container transition-colors cursor-pointer">Shop</button>
          <span>/</span>
          <span className="text-on-surface-variant/80 truncate max-w-50">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Left Column: Image Gallery (lg:span-7) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">

            {/* Active Large Image Display Frame */}
            <div className="grow relative aspect-4/5 bg-surface-container overflow-hidden group">
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-transform duration-[0.6s] ease-out group-hover:scale-105"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/95 text-white cursor-pointer shadow-lg transition-transform hover:scale-105"
                  >
                    <span className="material-symbols-outlined block text-sm">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/95 text-white cursor-pointer shadow-lg transition-transform hover:scale-105"
                  >
                    <span className="material-symbols-outlined block text-sm">chevron_right</span>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation Bar */}
            {images.length > 1 && (
              <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-150 justify-start md:justify-start py-2 md:py-0 shrink-0 custom-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={img._id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 md:w-20 md:h-24 rounded-none overflow-hidden border shrink-0 transition-all ${activeImageIndex === idx
                      ? "border-primary-container scale-105 shadow-md"
                      : "border-white/10 opacity-60 hover:opacity-100"
                      }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Info & Buy Panel (lg:span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-evenly space-y-8">
            <div className="space-y-6">

              {/* Curation Tag */}
              <span className="bg-primary-container/10 text-primary-container border border-primary-container/20 text-[10px] font-label-sm tracking-widest px-3 py-1 uppercase inline-block">
                In Stock &bull; Heavyweight Fit
              </span>

              {/* Title & Price */}
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-black font-display tracking-wider uppercase leading-tight">
                  {product.title}
                </h1>
                <div className="text-2xl font-black font-display tracking-widest text-primary-container">
                  {formatPrice(product.price?.amount, product.price?.currency)}
                </div>
              </div>

              {/* Product details description */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-on-surface-variant">Description</h3>
                <p className="text-sm font-light leading-relaxed text-on-surface/90 whitespace-pre-line bg-surface-container-low/40 p-4 border border-surface-container-high/40">
                  {product.description || "No description provided for this premium item."}
                </p>
              </div>

              {/* Technical features list */}
              <div className="space-y-3 pt-2 text-xs text-on-surface-variant font-light">
                {/* <div className="flex justify-between border-b border-surface-container-highest/20 pb-2">
                  <span>Composition</span>
                  <span className="font-semibold text-on-surface">100% Organic Heavyweight Cotton</span>
                </div> */}
                {/* <div className="flex justify-between border-b border-surface-container-highest/20 pb-2">
                  <span>Weight</span>
                  <span className="font-semibold text-on-surface">320 GSM French Terry</span>
                </div> */}
                <div className="flex justify-between border-b border-surface-container-highest/20 pb-2">
                  <span>Sold By</span>
                  <span className="font-semibold text-on-surface truncate max-w-50" title={product.seller}>{product.seller}</span>
                </div>
                <div className="flex justify-between border-b border-surface-container-highest/20 pb-2">
                  <span>Release Date</span>
                  <span className="font-semibold text-on-surface">{formatDate(product.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Buttons Panel */}
            <div className="space-y-4 pt-6 border-t border-surface-container-highest/20">
              <div className="flex flex-col sm:flex-row gap-4">

                {/* Add to Cart Button */}
                <button
                  onClick={() => alert(`Direct checkout mock: "${product.title}" added to shopping cart!`)}
                  className="flex-1 bg-transparent hover:bg-white/5 border border-white hover:border-primary-container text-on-surface hover:text-primary-container transition-all duration-300 font-label-md text-xs uppercase tracking-widest py-4 px-6 inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">shopping_bag</span>
                  Add to Cart
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={() => alert(`Direct checkout mock: Redirecting to instant checkout for "${product.title}"!`)}
                  className="flex-1 bg-primary-container hover:bg-white text-on-primary hover:text-black transition-all duration-300 font-label-md text-xs uppercase tracking-widest py-4 px-6 inline-flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.1)]"
                >
                  <span className="material-symbols-outlined text-base">bolt</span>
                  Buy Now
                </button>

              </div>
              <p className="text-[10px] text-center text-on-surface-variant/50 font-light tracking-wide uppercase">
                Secure checkout guaranteed &bull; Visa, MasterCard, PayPal, Cash on Delivery
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  )
}

export default ProductDetail