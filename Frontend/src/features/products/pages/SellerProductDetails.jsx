import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useProduct } from '../hooks/useProduct.js'
import { useAuth } from '../../auth/hook/useAuth.js'
import { useSelector } from 'react-redux'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

const SellerProductDetails = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { 
    handleGetProductById, 
    handleCreateVariant, 
    handleUpdateVariant, 
    handleDeleteVariant,
    handleUpdateProduct,
    handleDeleteProduct
  } = useProduct()
  const { handleGetMe } = useAuth()
  const user = useSelector(state => state.auth.user)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Variant creation form state
  const [priceAmount, setPriceAmount] = useState('')
  const [priceCurrency, setPriceCurrency] = useState('PKR')
  const [initialStock, setInitialStock] = useState('')
  const [attributesList, setAttributesList] = useState([{ key: '', value: '' }])
  const [variantImages, setVariantImages] = useState([])
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Edit Product Modal state
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [editProductTitle, setEditProductTitle] = useState('')
  const [editProductDescription, setEditProductDescription] = useState('')
  const [editProductPriceAmount, setEditProductPriceAmount] = useState('')
  const [editProductPriceCurrency, setEditProductPriceCurrency] = useState('PKR')
  const [editProductImages, setEditProductImages] = useState([]) // urls to keep
  const [newEditProductImages, setNewEditProductImages] = useState([]) // new files to upload
  const [productUpdating, setProductUpdating] = useState(false)

  // Edit Variant Modal state
  const [isEditVariantOpen, setIsEditVariantOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [editVariantPriceAmount, setEditVariantPriceAmount] = useState('')
  const [editVariantPriceCurrency, setEditVariantPriceCurrency] = useState('PKR')
  const [editVariantStock, setEditVariantStock] = useState('')
  const [editVariantAttributes, setEditVariantAttributes] = useState([])
  const [editVariantImages, setEditVariantImages] = useState([]) // urls to keep
  const [newEditVariantImages, setNewEditVariantImages] = useState([]) // new files to upload
  const [variantUpdating, setVariantUpdating] = useState(false)

  // Track which variant stock is currently updating in the background
  const [updatingStockMap, setUpdatingStockMap] = useState({})

  async function fetchProductDetails() {
    setLoading(true)
    try {
      const data = await handleGetProductById(productId)
      setProduct(data)
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

  const handleAddAttribute = () => {
    setAttributesList([...attributesList, { key: '', value: '' }])
  }

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributesList]
    updated[index][field] = value
    setAttributesList(updated)
  }

  const handleRemoveAttribute = (index) => {
    setAttributesList(attributesList.filter((_, idx) => idx !== index))
  }

  const handleImageChange = (e) => {
    if (e.target.files) {
      setVariantImages(Array.from(e.target.files))
    }
  }

  // Stock quick adjust
  const handleStockAdjust = async (variantId, currentStock, change) => {
    const newStock = Math.max(0, currentStock + change)
    if (newStock === currentStock) return

    setUpdatingStockMap(prev => ({ ...prev, [variantId]: true }))
    try {
      const updatedProduct = await handleUpdateVariant(productId, variantId, { stock: newStock })
      setProduct(updatedProduct)
    } catch (err) {
      console.error("Failed to update variant stock:", err)
      alert("Failed to adjust stock. Please try again.")
    } finally {
      setUpdatingStockMap(prev => ({ ...prev, [variantId]: false }))
    }
  }

  // Delete Variant
  const handleDeleteVariantAction = async (variantId) => {
    if (!window.confirm("Are you sure you want to delete this variant?")) return

    try {
      const updatedProduct = await handleDeleteVariant(productId, variantId)
      setProduct(updatedProduct)
    } catch (err) {
      console.error("Failed to delete variant:", err)
      alert("Failed to delete variant.")
    }
  }

  // Submit new variant
  const handleSubmitVariant = async (e) => {
    e.preventDefault()
    if (!initialStock) {
      alert("Please fill in stock.")
      return
    }

    const variantPriceAmount = priceAmount?.trim() ? priceAmount : product?.price?.amount

    if (variantPriceAmount === undefined || variantPriceAmount === null || variantPriceAmount === '') {
      alert("Please provide a variant price or ensure the product has a base price.")
      return
    }

    setFormSubmitting(true)

    // Build attributes object
    const attributes = {}
    attributesList.forEach(attr => {
      if (attr.key.trim() && attr.value.trim()) {
        attributes[attr.key.trim()] = attr.value.trim()
      }
    })

    const formData = new FormData()
    formData.append('priceAmount', variantPriceAmount)
    formData.append('priceCurrency', priceCurrency)
    formData.append('stock', initialStock)
    formData.append('attributes', JSON.stringify(attributes))

    variantImages.forEach(file => {
      formData.append('images', file)
    })

    try {
      const updatedProduct = await handleCreateVariant(productId, formData)
      setProduct(updatedProduct)
      // Reset form states
      setPriceAmount('')
      setPriceCurrency('PKR')
      setInitialStock('')
      setAttributesList([{ key: '', value: '' }])
      setVariantImages([])
      alert("Variant created successfully!")
    } catch (err) {
      console.error("Failed to create variant:", err)
      alert("Failed to create variant.")
    } finally {
      setFormSubmitting(false)
    }
  }

  // Open Edit Product Modal
  const openEditProduct = () => {
    setEditProductTitle(product.title)
    setEditProductDescription(product.description || '')
    setEditProductPriceAmount(product.price?.amount || '')
    setEditProductPriceCurrency(product.price?.currency || 'PKR')
    setEditProductImages((product.images || []).map(img => img.url))
    setNewEditProductImages([])
    setIsEditProductOpen(true)
  }

  // Submit Product Updates
  const handleSaveProduct = async (e) => {
    e.preventDefault()
    setProductUpdating(true)

    const formData = new FormData()
    formData.append('title', editProductTitle)
    formData.append('description', editProductDescription)
    formData.append('priceAmount', editProductPriceAmount)
    formData.append('priceCurrency', editProductPriceCurrency)
    formData.append('keepImages', JSON.stringify(editProductImages))
    newEditProductImages.forEach(file => {
      formData.append('images', file)
    })

    try {
      const updated = await handleUpdateProduct(productId, formData)
      setProduct(updated)
      setIsEditProductOpen(false)
      alert("Product details updated successfully!")
    } catch (err) {
      console.error("Failed to update product details:", err)
      alert("Failed to update product details.")
    } finally {
      setProductUpdating(false)
    }
  }

  // Open Edit Variant Modal
  const openEditVariant = (variant) => {
    setSelectedVariant(variant)
    setEditVariantPriceAmount(variant.price?.amount || '')
    setEditVariantPriceCurrency(variant.price?.currency || 'PKR')
    setEditVariantStock(variant.stock || 0)
    setEditVariantImages((variant.images || []).map(img => img.url))
    setNewEditVariantImages([])
    
    // Map attributes map/object to array
    const mappedAttrs = Object.entries(variant.attributes || {}).map(([key, value]) => ({ key, value }))
    setEditVariantAttributes(mappedAttrs.length > 0 ? mappedAttrs : [{ key: '', value: '' }])
    setIsEditVariantOpen(true)
  }

  const handleAddEditVariantAttr = () => {
    setEditVariantAttributes([...editVariantAttributes, { key: '', value: '' }])
  }

  const handleEditVariantAttrChange = (index, field, value) => {
    const updated = [...editVariantAttributes]
    updated[index][field] = value
    setEditVariantAttributes(updated)
  }

  const handleRemoveEditVariantAttr = (index) => {
    setEditVariantAttributes(editVariantAttributes.filter((_, idx) => idx !== index))
  }

  // Submit Variant Updates
  const handleSaveVariant = async (e) => {
    e.preventDefault()
    setVariantUpdating(true)

    const attributes = {}
    editVariantAttributes.forEach(attr => {
      if (attr.key.trim() && attr.value.trim()) {
        attributes[attr.key.trim()] = attr.value.trim()
      }
    })

    const formData = new FormData()
    formData.append('priceAmount', editVariantPriceAmount)
    formData.append('priceCurrency', editVariantPriceCurrency)
    formData.append('stock', editVariantStock)
    formData.append('attributes', JSON.stringify(attributes))
    formData.append('keepImages', JSON.stringify(editVariantImages))
    newEditVariantImages.forEach(file => {
      formData.append('images', file)
    })

    try {
      const updatedProduct = await handleUpdateVariant(productId, selectedVariant._id, formData)
      setProduct(updatedProduct)
      setIsEditVariantOpen(false)
      alert("Variant updated successfully!")
    } catch (err) {
      console.error("Failed to update variant:", err)
      alert("Failed to update variant.")
    } finally {
      setVariantUpdating(false)
    }
  }

  // Delete Product completely or soft-delete (keep variants)
  const handleDeleteProductAction = async (keepVariants) => {
    const msg = keepVariants 
      ? "Are you sure you want to delete this product catalog base info but preserve the variants?"
      : "Are you sure you want to completely delete this product and all of its variants? This cannot be undone."
    
    if (!window.confirm(msg)) return

    try {
      await handleDeleteProduct(productId, keepVariants)
      alert(keepVariants ? "Product deleted, variants archived." : "Product completely deleted.")
      navigate("/seller/dashboard")
    } catch (err) {
      console.error("Failed to delete product:", err)
      alert("Failed to delete product.")
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex flex-col justify-between">
        <Navbar />
        <div className="grow flex items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Loading Details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex flex-col justify-between">
        <Navbar />
        <div className="grow flex flex-col items-center justify-center p-6 space-y-6 text-center">
          <span className="material-symbols-outlined text-primary-container text-5xl">warning</span>
          <h2 className="text-2xl font-black tracking-widest uppercase">Product Not Found</h2>
          <p className="text-sm text-on-surface-variant max-w-md">This product might have been removed, or you don't have access to it.</p>
          <button onClick={() => navigate("/seller/dashboard")} className="bg-primary-container text-black font-semibold text-xs uppercase tracking-widest py-3 px-8 transition-all hover:bg-white">
            Return to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const images = product.images || []
  const activeImage = images[activeImageIndex]?.url || "https://placehold.co/600x800/201f22/ffd700?text=No+Image"

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex flex-col justify-between overflow-x-hidden relative">
      <Navbar />

      <header className="w-full bg-[#131315] border-b border-[#27272a] flex justify-between items-center px-6 md:px-16 h-16">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/seller/dashboard")} 
            className="cursor-pointer active:opacity-80 hover:bg-surface-container-high transition-colors p-2 rounded-full text-primary-container"
          >
            <span className="material-symbols-outlined block">arrow_back</span>
          </button>
          <h1 className="font-semibold text-lg text-primary-container">Manage Product & Variants</h1>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span onClick={() => navigate("/seller/dashboard")} className="text-sm text-on-surface-variant cursor-pointer hover:text-primary-container transition-colors">Dashboard</span>
          <span className="text-sm text-primary-container font-bold cursor-pointer">Inventory</span>
        </div>
      </header>

      <main className="grow max-w-360 mx-auto w-full px-6 md:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Product Overview */}
          <section className="lg:col-span-7 space-y-8">
            {/* Gallery Frame */}
            <div className="bg-surface-container-low rounded-xl border border-[#27272a] overflow-hidden">
              <div className="w-full max-w-lg mx-auto relative bg-surface-container flex items-center justify-center p-4">
                <img 
                  src={activeImage} 
                  alt={product.title} 
                  className="w-full h-full max-h-128 object-contain" 
                />
              </div>
              {images.length > 1 && (
                <div className="p-4 flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={img._id || idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`shrink-0 w-20 h-20 rounded border overflow-hidden transition-all ${
                        activeImageIndex === idx ? 'border-primary-container scale-105' : 'border-[#27272a] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info details */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-[#353437] text-on-surface-variant text-xs px-3 py-1 rounded-full border border-[#27272a]">
                    Product ID: {product._id}
                  </span>
                  <span className="bg-[#353437] text-on-surface-variant text-xs px-3 py-1 rounded-full border border-[#27272a]">
                    Base Price: {formatPrice(product.price?.amount, product.price?.currency)}
                  </span>
                </div>

                <button 
                  onClick={openEditProduct}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-container hover:underline"
                >
                  <span className="material-symbols-outlined text-sm block">edit</span>
                  Edit Details
                </button>
              </div>

              <h2 className="text-3xl font-bold uppercase tracking-wider text-white">{product.title}</h2>
              <p className="text-on-surface-variant leading-relaxed whitespace-pre-line bg-surface-container-low p-6 rounded-lg border border-[#27272a]/60">
                {product.description || "No description provided."}
              </p>

              {/* Danger Zone */}
              <div className="border border-red-500/20 bg-red-950/10 p-6 rounded-lg space-y-4">
                <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest">Danger Zone</h4>
                <p className="text-xs text-on-surface-variant">Manage product status and catalog lifecycles.</p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    onClick={() => handleDeleteProductAction(true)}
                    className="px-4 py-2 border border-red-500/40 hover:bg-red-500/10 text-red-400 hover:text-white rounded text-xs uppercase tracking-wider font-semibold transition-all"
                  >
                    Delete Product, Keep Variants
                  </button>
                  <button 
                    onClick={() => handleDeleteProductAction(false)}
                    className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded text-xs uppercase tracking-wider font-bold transition-all"
                  >
                    Delete Product & Variants
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Variants & New Variant Form */}
          <aside className="lg:col-span-5 space-y-12">
            
            {/* Existing Variants Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Existing Variants</h3>
                <span className="text-xs text-on-surface-variant">{(product.variants || []).length} active</span>
              </div>

              <div className="space-y-4">
                {(!product.variants || product.variants.length === 0) ? (
                  <div className="bg-surface-container-low border border-dashed border-[#27272a] p-8 text-center text-sm text-on-surface-variant rounded-lg">
                    No variants created yet. Use the form below to add your first variant.
                  </div>
                ) : (
                  product.variants.map((variant) => {
                    const varImage = variant.images?.[0]?.url || (images[0]?.url || "https://placehold.co/150x150/201f22/ffd700?text=No+Img");
                    const isUpdating = updatingStockMap[variant._id];
                    return (
                      <div 
                        key={variant._id}
                        className="bg-surface-container-low border border-[#27272a] p-4 rounded-lg flex items-center gap-4 transition-all hover:bg-surface-container"
                      >
                        <div className="w-16 h-16 rounded bg-[#353437] shrink-0 overflow-hidden border border-[#27272a]">
                          <img src={varImage} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="grow">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(variant.attributes || {}).map(([key, val]) => (
                                  <span key={key} className="text-[10px] bg-[#353437] px-2 py-0.5 rounded text-white font-medium">
                                    {key}: {val}
                                  </span>
                                ))}
                              </div>
                              <p className="text-base font-bold text-primary-container">{formatPrice(variant.price?.amount, variant.price?.currency)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => openEditVariant(variant)}
                                className="p-2 text-on-surface-variant hover:text-primary-container transition-colors"
                                title="Edit Variant"
                              >
                                <span className="material-symbols-outlined text-[20px] block">edit</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteVariantAction(variant._id)}
                                className="p-2 text-on-surface-variant hover:text-red-500 transition-colors"
                                title="Delete Variant"
                              >
                                <span className="material-symbols-outlined text-[20px] block">delete</span>
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-[#27272a]/60 pt-3">
                            <span className="text-xs text-on-surface-variant">{variant.stock} in stock</span>
                            <div className="flex items-center bg-[#353437] rounded border border-[#27272a] overflow-hidden">
                              <button 
                                onClick={() => handleStockAdjust(variant._id, variant.stock, -1)}
                                disabled={isUpdating || variant.stock <= 0}
                                className="px-3 py-1 hover:bg-surface-container-high text-primary-container transition-colors disabled:opacity-30 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px] block">remove</span>
                              </button>
                              <span className="px-2 text-xs font-semibold min-w-8 text-center text-white">
                                {isUpdating ? '...' : variant.stock}
                              </span>
                              <button 
                                onClick={() => handleStockAdjust(variant._id, variant.stock, 1)}
                                disabled={isUpdating}
                                className="px-3 py-1 hover:bg-surface-container-high text-primary-container transition-colors disabled:opacity-30 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px] block">add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </section>

            {/* Add New Variant Form */}
            <section className="bg-surface-container-low border border-[#27272a] p-6 rounded-xl space-y-6">
              <h3 className="text-lg font-bold text-primary-container uppercase tracking-wider">Add New Variant</h3>
              <form onSubmit={handleSubmitVariant} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Price Amount</label>
                    <input 
                      type="number"
                      value={priceAmount}
                      onChange={(e) => setPriceAmount(e.target.value)}
                      placeholder="Leave blank for base price"
                      className="w-full bg-[#353437] border border-[#27272a] rounded focus:border-primary-container focus:ring-1 focus:ring-primary-container/20 text-on-surface px-4 py-2.5 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Currency</label>
                    <select
                      value={priceCurrency}
                      onChange={(e) => setPriceCurrency(e.target.value)}
                      className="w-full bg-[#353437] border border-[#27272a] rounded focus:border-primary-container text-on-surface px-4 py-2.5 outline-none transition-all text-sm cursor-pointer"
                    >
                      {['USD', 'EUR', 'GBP', 'PKR', 'INR', 'JPY'].map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Initial Stock</label>
                  <input 
                    type="number"
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    placeholder="Quantity"
                    className="w-full bg-[#353437] border border-[#27272a] rounded focus:border-primary-container focus:ring-1 focus:ring-primary-container/20 text-on-surface px-4 py-2.5 outline-none transition-all text-sm"
                    required
                  />
                </div>

                {/* Attributes inputs */}
                <div className="space-y-3">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold block">Attributes</label>
                  
                  {attributesList.map((attr, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text"
                        placeholder="Key (e.g. Size)"
                        value={attr.key}
                        onChange={(e) => handleAttributeChange(idx, 'key', e.target.value)}
                        className="flex-1 bg-[#353437] border border-[#27272a] rounded text-on-surface px-3 py-2 text-sm outline-none focus:border-primary-container"
                      />
                      <input 
                        type="text"
                        placeholder="Value (e.g. XL)"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(idx, 'value', e.target.value)}
                        className="flex-1 bg-[#353437] border border-[#27272a] rounded text-on-surface px-3 py-2 text-sm outline-none focus:border-primary-container"
                      />
                      {attributesList.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => handleRemoveAttribute(idx)}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg block">delete</span>
                        </button>
                      )}
                    </div>
                  ))}

                  <button 
                    type="button" 
                    onClick={handleAddAttribute}
                    className="flex items-center gap-1 text-primary-container text-xs font-semibold hover:underline active:opacity-70 transition-all mt-2"
                  >
                    <span className="material-symbols-outlined text-[16px] block">add_circle</span>
                    Add Attribute Row
                  </button>
                </div>

                {/* Images Upload */}
                <div className="space-y-2">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold block">Variant Images</label>
                  <div className="relative border-2 border-dashed border-[#27272a] rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-primary-container transition-colors cursor-pointer group">
                    <input 
                      type="file"
                      multiple
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                    />
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary-container transition-colors">cloud_upload</span>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-white">
                        {variantImages.length > 0 ? `${variantImages.length} images selected` : 'Drop or Browse Images'}
                      </p>
                      <p className="text-[10px] text-on-surface-variant mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-3 bg-primary-container text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {formSubmitting ? 'Creating...' : 'Create Variant'}
                </button>
              </form>
            </section>

          </aside>
        </div>
      </main>

      {/* Edit Product Modal */}
      {isEditProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-container-low border border-[#27272a] w-full max-w-lg rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-[#27272a] pb-4">
              <h3 className="text-lg font-bold text-primary-container uppercase tracking-wider">Edit Product Details</h3>
              <button 
                onClick={() => setIsEditProductOpen(false)}
                className="text-on-surface-variant hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined block">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Title</label>
                <input 
                  type="text"
                  value={editProductTitle}
                  onChange={(e) => setEditProductTitle(e.target.value)}
                  className="w-full bg-[#353437] border border-[#27272a] rounded text-on-surface px-4 py-2.5 outline-none focus:border-primary-container text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Description</label>
                <textarea 
                  rows="4"
                  value={editProductDescription}
                  onChange={(e) => setEditProductDescription(e.target.value)}
                  className="w-full bg-[#353437] border border-[#27272a] rounded text-on-surface px-4 py-2.5 outline-none focus:border-primary-container text-sm resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Base Price Amount</label>
                  <input 
                    type="number"
                    value={editProductPriceAmount}
                    onChange={(e) => setEditProductPriceAmount(e.target.value)}
                    className="w-full bg-[#353437] border border-[#27272a] rounded text-on-surface px-4 py-2.5 outline-none focus:border-primary-container text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Currency</label>
                  <select
                    value={editProductPriceCurrency}
                    onChange={(e) => setEditProductPriceCurrency(e.target.value)}
                    className="w-full bg-[#353437] border border-[#27272a] rounded text-on-surface px-4 py-2.5 outline-none focus:border-primary-container text-sm cursor-pointer"
                  >
                    {['USD', 'EUR', 'GBP', 'PKR', 'INR', 'JPY'].map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Edit Product Images Management */}
              <div className="space-y-3">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold block">Manage Product Images</label>
                
                {/* Existing Images */}
                {editProductImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {editProductImages.map((url, idx) => (
                      <div key={url} className="relative aspect-square border border-[#27272a] rounded overflow-hidden group">
                        <img src={url} className="w-full h-full object-cover" alt="" />
                        <button
                          type="button"
                          onClick={() => setEditProductImages(editProductImages.filter(u => u !== url))}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 hover:text-red-500 transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload New Images */}
                <div className="relative border-2 border-dashed border-[#27272a] rounded p-4 flex flex-col items-center justify-center gap-1.5 hover:border-primary-container transition-colors cursor-pointer group">
                  <input 
                    type="file"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setNewEditProductImages([...newEditProductImages, ...Array.from(e.target.files)])
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                  <span className="material-symbols-outlined text-xl text-on-surface-variant group-hover:text-primary-container transition-colors">cloud_upload</span>
                  <p className="text-[10px] font-semibold text-white">
                    {newEditProductImages.length > 0 ? `${newEditProductImages.length} new files ready` : 'Add new images'}
                  </p>
                </div>
                {newEditProductImages.length > 0 && (
                  <div className="text-[10px] text-on-surface-variant flex flex-wrap gap-1">
                    {newEditProductImages.map((f, idx) => (
                      <span key={idx} className="bg-[#353437] px-2 py-0.5 rounded text-white flex items-center gap-1">
                        {f.name}
                        <button 
                          type="button" 
                          onClick={() => setNewEditProductImages(newEditProductImages.filter((_, i) => i !== idx))}
                          className="text-red-400 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#27272a]">
                <button 
                  type="button"
                  onClick={() => setIsEditProductOpen(false)}
                  className="flex-1 py-3 bg-[#353437] hover:bg-surface-container-high text-white font-semibold rounded-lg text-xs uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={productUpdating}
                  className="flex-1 py-3 bg-primary-container text-black font-bold rounded-lg text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {productUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Variant Modal */}
      {isEditVariantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-container-low border border-[#27272a] w-full max-w-lg rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-[#27272a] pb-4">
              <h3 className="text-lg font-bold text-primary-container uppercase tracking-wider">Edit Variant</h3>
              <button 
                onClick={() => setIsEditVariantOpen(false)}
                className="text-on-surface-variant hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined block">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveVariant} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Price Amount</label>
                  <input 
                    type="number"
                    value={editVariantPriceAmount}
                    onChange={(e) => setEditVariantPriceAmount(e.target.value)}
                    className="w-full bg-[#353437] border border-[#27272a] rounded text-on-surface px-4 py-2.5 outline-none focus:border-primary-container text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Currency</label>
                  <select
                    value={editVariantPriceCurrency}
                    onChange={(e) => setEditVariantPriceCurrency(e.target.value)}
                    className="w-full bg-[#353437] border border-[#27272a] rounded text-on-surface px-4 py-2.5 outline-none focus:border-primary-container text-sm cursor-pointer"
                  >
                    {['USD', 'EUR', 'GBP', 'PKR', 'INR', 'JPY'].map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Stock Quantity</label>
                <input 
                  type="number"
                  value={editVariantStock}
                  onChange={(e) => setEditVariantStock(e.target.value)}
                  className="w-full bg-[#353437] border border-[#27272a] rounded text-on-surface px-4 py-2.5 outline-none focus:border-primary-container text-sm"
                  required
                />
              </div>

              {/* Attributes inputs */}
              <div className="space-y-3">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold block">Attributes</label>
                
                {editVariantAttributes.map((attr, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input 
                      type="text"
                      placeholder="Key (e.g. Size)"
                      value={attr.key}
                      onChange={(e) => handleEditVariantAttrChange(idx, 'key', e.target.value)}
                      className="flex-1 bg-[#353437] border border-[#27272a] rounded text-on-surface px-3 py-2 text-sm outline-none focus:border-primary-container"
                    />
                    <input 
                      type="text"
                      placeholder="Value (e.g. XL)"
                      value={attr.value}
                      onChange={(e) => handleEditVariantAttrChange(idx, 'value', e.target.value)}
                      className="flex-1 bg-[#353437] border border-[#27272a] rounded text-on-surface px-3 py-2 text-sm outline-none focus:border-primary-container"
                    />
                    {editVariantAttributes.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveEditVariantAttr(idx)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg block">delete</span>
                      </button>
                    )}
                  </div>
                ))}

                <button 
                  type="button" 
                  onClick={handleAddEditVariantAttr}
                  className="flex items-center gap-1 text-primary-container text-xs font-semibold hover:underline active:opacity-70 transition-all mt-2"
                >
                  <span className="material-symbols-outlined text-[16px] block">add_circle</span>
                  Add Attribute Row
                </button>
              </div>

              {/* Edit Variant Images Management */}
              <div className="space-y-3">
                <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold block">Manage Variant Images</label>
                
                {/* Existing Images */}
                {editVariantImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {editVariantImages.map((url, idx) => (
                      <div key={url} className="relative aspect-square border border-[#27272a] rounded overflow-hidden group">
                        <img src={url} className="w-full h-full object-cover" alt="" />
                        <button
                          type="button"
                          onClick={() => setEditVariantImages(editVariantImages.filter(u => u !== url))}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 hover:text-red-500 transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload New Images */}
                <div className="relative border-2 border-dashed border-[#27272a] rounded p-4 flex flex-col items-center justify-center gap-1.5 hover:border-primary-container transition-colors cursor-pointer group">
                  <input 
                    type="file"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setNewEditVariantImages([...newEditVariantImages, ...Array.from(e.target.files)])
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                  <span className="material-symbols-outlined text-xl text-on-surface-variant group-hover:text-primary-container transition-colors">cloud_upload</span>
                  <p className="text-[10px] font-semibold text-white">
                    {newEditVariantImages.length > 0 ? `${newEditVariantImages.length} new files ready` : 'Add new images'}
                  </p>
                </div>
                {newEditVariantImages.length > 0 && (
                  <div className="text-[10px] text-on-surface-variant flex flex-wrap gap-1">
                    {newEditVariantImages.map((f, idx) => (
                      <span key={idx} className="bg-[#353437] px-2 py-0.5 rounded text-white flex items-center gap-1">
                        {f.name}
                        <button 
                          type="button" 
                          onClick={() => setNewEditVariantImages(newEditVariantImages.filter((_, i) => i !== idx))}
                          className="text-red-400 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#27272a]">
                <button 
                  type="button"
                  onClick={() => setIsEditVariantOpen(false)}
                  className="flex-1 py-3 bg-[#353437] hover:bg-surface-container-high text-white font-semibold rounded-lg text-xs uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={variantUpdating}
                  className="flex-1 py-3 bg-primary-container text-black font-bold rounded-lg text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {variantUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default SellerProductDetails