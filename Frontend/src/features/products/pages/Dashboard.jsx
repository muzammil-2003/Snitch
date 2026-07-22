import React, { useEffect, useState } from 'react';
import { useProduct } from '../hooks/useProduct.js';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { setUser } from '../../auth/state/auth.slice.js';
import { setSellerProducts } from '../state/product.slice.js';

const Dashboard = () => {
    const { handleGetSellerProduct } = useProduct();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Selectors
    const sellerProducts = useSelector(state => state.product.sellerProduct || []);
    const user = useSelector(state => state.auth?.user);

    // Local UI states
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest"); // newest, oldest, price-asc, price-desc, name-asc, name-desc
    const [viewMode, setViewMode] = useState("grid"); // grid, list
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState({}); // mapping: productID -> activeImageIndex
    const [modalActiveImageIndex, setModalActiveImageIndex] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                await handleGetSellerProduct();
            } catch (err) {
                console.error("Failed to load products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Handlers
    const handleLogout = () => {
        dispatch(setUser(null));
        navigate("/login");
    };

    // Calculate dynamic statistics
    const totalProducts = sellerProducts.length;
    
    // Group prices by currency
    const totalValueByCurrency = sellerProducts.reduce((acc, prod) => {
        const currency = prod.price?.currency || 'PKR';
        const amount = prod.price?.amount || 0;
        acc[currency] = (acc[currency] || 0) + amount;
        return acc;
    }, {});

    const totalImagesCount = sellerProducts.reduce((acc, prod) => {
        return acc + (prod.images?.length || 0);
    }, 0);

    const latestListingDate = sellerProducts.length > 0 
        ? new Date(Math.max(...sellerProducts.map(p => new Date(p.createdAt))))
        : null;

    // Filter & Sort Products
    const filteredProducts = sellerProducts.filter(prod => {
        const query = searchQuery.toLowerCase();
        const matchesTitle = prod.title?.toLowerCase().includes(query);
        const matchesDesc = prod.description?.toLowerCase().includes(query);
        return matchesTitle || matchesDesc;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortBy === 'price-asc') {
            return (a.price?.amount || 0) - (b.price?.amount || 0);
        } else if (sortBy === 'price-desc') {
            return (b.price?.amount || 0) - (a.price?.amount || 0);
        } else if (sortBy === 'name-asc') {
            return (a.title || '').localeCompare(b.title || '');
        } else if (sortBy === 'name-desc') {
            return (b.title || '').localeCompare(a.title || '');
        }
        return 0;
    });

    // Helper to format currency
    const formatPrice = (amount, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'PKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    // Format date beautifully
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Card hover photo switcher helper
    const handleThumbnailHover = (productId, imageIndex) => {
        setActiveImageIndex(prev => ({
            ...prev,
            [productId]: imageIndex
        }));
    };

    const getActiveImage = (product) => {
        const activeIdx = activeImageIndex[product._id] ?? 0;
        if (product.images && product.images.length > 0) {
            return product.images[activeIdx]?.url || product.images[0]?.url;
        }
        return "https://placehold.co/600x400/201f22/ffd700?text=No+Image";
    };

    return (
        <div className="min-h-screen bg-background text-on-surface font-body-md flex flex-col overflow-x-hidden custom-scrollbar">
            
            {/* Header / Top Navbar */}
            <header className="w-full sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-surface-container-highest">
                <div className="w-full max-w-360 mx-auto px-container-padding-mobile md:px-container-padding-desktop h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary-container text-3xl font-semibold filter drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]">
                                monitoring
                            </span>
                            <span className="font-headline-lg text-headline-lg font-bold tracking-tight bg-linear-to-r from-primary to-primary-container bg-clip-text text-transparent">
                                SNITCH
                            </span>
                            <span className="bg-surface-container-high text-primary-container text-[11px] font-label-md px-2 py-0.5 rounded-full border border-primary-container/20">
                                SELLER
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="hidden md:flex flex-col text-right">
                                <span className="text-sm font-semibold text-on-surface">
                                    {user.fullName || "Seller"}
                                </span>
                                <span className="text-xs text-on-surface-variant/70 font-label-sm">
                                    {user.email}
                                </span>
                            </div>
                        )}
                        
                        <button
                            onClick={handleLogout}
                            title="Log Out"
                            className="p-2 rounded-full hover:bg-surface-container-high hover:text-error transition-colors active:scale-95 duration-150 text-on-surface-variant cursor-pointer"
                        >
                            <span className="material-symbols-outlined block">logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Canvas */}
            <main className="grow w-full max-w-360 mx-auto px-container-padding-mobile md:px-container-padding-desktop py-8 md:py-10 space-y-8">
                
                {/* Greeting & Quick Action */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                            Welcome back, {user?.fullName?.split(" ")[0] || "Seller"}!
                        </h2>
                        <p className="font-body-md text-on-surface-variant mt-1">
                            Manage your products, view performance metrics, and add new inventory.
                        </p>
                    </div>
                    
                    <button
                        onClick={() => navigate("/seller/create-product")}
                        className="bg-primary-container text-on-primary hover:opacity-90 active:scale-[0.98] transition-all duration-150 font-label-md text-label-md py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.15)] w-full md:w-auto"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Create Product
                    </button>
                </div>

                {/* Dashboard Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat card 1: Total Products */}
                    <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-variant hover:border-primary-container/20 transition-all duration-300 group">
                        <div className="flex justify-between items-start">
                            <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-xs">Total Products</span>
                            <span className="material-symbols-outlined text-primary-container p-2 rounded-xl bg-primary-container/10 group-hover:scale-110 transition-transform">
                                inventory_2
                            </span>
                        </div>
                        <div className="mt-4">
                            {loading ? (
                                <div className="h-9 w-24 bg-surface-container-high rounded animate-pulse"></div>
                            ) : (
                                <h3 className="text-3xl font-bold font-headline-lg text-on-surface">{totalProducts}</h3>
                            )}
                            <p className="text-xs text-on-surface-variant/65 mt-2">Active listings in catalog</p>
                        </div>
                    </div>

                    {/* Stat card 2: Estimated Value */}
                    <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-variant hover:border-primary-container/20 transition-all duration-300 group">
                        <div className="flex justify-between items-start">
                            <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-xs">Estimated Value</span>
                            <span className="material-symbols-outlined text-primary-container p-2 rounded-xl bg-primary-container/10 group-hover:scale-110 transition-transform">
                                payments
                            </span>
                        </div>
                        <div className="mt-4">
                            {loading ? (
                                <div className="h-9 w-32 bg-surface-container-high rounded animate-pulse"></div>
                            ) : (
                                <h3 className="text-2xl font-bold font-headline-lg text-on-surface truncate">
                                    {Object.keys(totalValueByCurrency).length > 0 ? (
                                        Object.entries(totalValueByCurrency).map(([curr, amt]) => formatPrice(amt, curr)).join(' | ')
                                    ) : (
                                        "PKR 0"
                                    )}
                                </h3>
                            )}
                            <p className="text-xs text-on-surface-variant/65 mt-2">Cumulative value of products</p>
                        </div>
                    </div>

                    {/* Stat card 3: Total Media */}
                    <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-variant hover:border-primary-container/20 transition-all duration-300 group">
                        <div className="flex justify-between items-start">
                            <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-xs">Media Assets</span>
                            <span className="material-symbols-outlined text-primary-container p-2 rounded-xl bg-primary-container/10 group-hover:scale-110 transition-transform">
                                photo_library
                            </span>
                        </div>
                        <div className="mt-4">
                            {loading ? (
                                <div className="h-9 w-24 bg-surface-container-high rounded animate-pulse"></div>
                            ) : (
                                <h3 className="text-3xl font-bold font-headline-lg text-on-surface">{totalImagesCount}</h3>
                            )}
                            <p className="text-xs text-on-surface-variant/65 mt-2">Images uploaded to server</p>
                        </div>
                    </div>

                    {/* Stat card 4: Latest Listing */}
                    <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-variant hover:border-primary-container/20 transition-all duration-300 group">
                        <div className="flex justify-between items-start">
                            <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-xs">Latest Update</span>
                            <span className="material-symbols-outlined text-primary-container p-2 rounded-xl bg-primary-container/10 group-hover:scale-110 transition-transform">
                                calendar_today
                            </span>
                        </div>
                        <div className="mt-4">
                            {loading ? (
                                <div className="h-9 w-32 bg-surface-container-high rounded animate-pulse"></div>
                            ) : (
                                <h3 className="text-lg font-bold font-headline-md text-on-surface truncate">
                                    {latestListingDate ? formatDate(latestListingDate) : "No Listings"}
                                </h3>
                            )}
                            <p className="text-xs text-on-surface-variant/65 mt-2">Most recent upload date</p>
                        </div>
                    </div>
                </div>

                {/* Toolbar: Search, Sort, View Mode Toggle */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-surface-variant flex flex-col md:flex-row gap-4 items-center justify-between">
                    
                    {/* Search */}
                    <div className="relative flex items-center w-full md:max-w-md group">
                        <span className="material-symbols-outlined absolute left-4 text-on-surface-variant group-focus-within:text-primary-container transition-colors">
                            search
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search in product catalog..."
                            className="w-full bg-surface-container border border-surface-variant rounded-xl pl-12 pr-4 py-2.5 text-on-surface placeholder:text-on-surface-variant/40 font-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 transition-all duration-200"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 text-on-surface-variant hover:text-on-surface cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        )}
                    </div>

                    {/* Sorting & Views */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <span className="text-on-surface-variant font-label-sm text-xs hidden sm:inline uppercase tracking-wider">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-surface-container border border-surface-variant rounded-xl px-4 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary-container cursor-pointer transition-all duration-200"
                            >
                                <option value="newest">Newest Listed</option>
                                <option value="oldest">Oldest Listed</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Alphabetical: A-Z</option>
                                <option value="name-desc">Alphabetical: Z-A</option>
                            </select>
                        </div>

                        {/* View Mode */}
                        <div className="bg-surface-container p-1 rounded-xl border border-surface-variant flex items-center">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === "grid" ? "bg-primary-container text-on-primary font-bold" : "text-on-surface-variant hover:text-on-surface"}`}
                                title="Grid View"
                            >
                                <span className="material-symbols-outlined block text-xl">grid_view</span>
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === "list" ? "bg-primary-container text-on-primary font-bold" : "text-on-surface-variant hover:text-on-surface"}`}
                                title="List View"
                            >
                                <span className="material-symbols-outlined block text-xl">list</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product Catalog Display Area */}
                {loading ? (
                    /* Loading Skeleton */
                    <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-4"}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            viewMode === "grid" ? (
                                <div key={i} className="bg-surface-container-low border border-surface-variant rounded-2xl overflow-hidden p-4 space-y-4 animate-pulse">
                                    <div className="aspect-square bg-surface-container-high rounded-xl"></div>
                                    <div className="h-5 bg-surface-container-high rounded w-3/4"></div>
                                    <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
                                    <div className="h-10 bg-surface-container-high rounded-xl"></div>
                                </div>
                            ) : (
                                <div key={i} className="bg-surface-container-low border border-surface-variant rounded-xl p-4 flex gap-4 animate-pulse">
                                    <div className="w-16 h-16 bg-surface-container-high rounded-lg shrink-0"></div>
                                    <div className="grow space-y-2">
                                        <div className="h-5 bg-surface-container-high rounded w-1/3"></div>
                                        <div className="h-4 bg-surface-container-high rounded w-2/3"></div>
                                    </div>
                                    <div className="w-24 h-8 bg-surface-container-high rounded self-center"></div>
                                </div>
                            )
                        ))}
                    </div>
                ) : sortedProducts.length === 0 ? (
                    /* Empty State */
                    <div className="bg-surface-container-low border border-surface-variant rounded-2xl p-12 text-center max-w-lg mx-auto py-16 animate-in fade-in zoom-in-95 duration-300">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-container-high border border-surface-variant mb-6 shadow-inner">
                            <span className="material-symbols-outlined text-primary-container text-4xl">
                                inventory
                            </span>
                        </div>
                        <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">
                            {searchQuery ? "No matching products" : "No products listed yet"}
                        </h3>
                        <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mb-8">
                            {searchQuery 
                                ? `We couldn't find anything matching "${searchQuery}" in your catalog. Try refining your keyword.`
                                : "Get started by adding your first product to our inventory system and start trading immediately."
                            }
                        </p>
                        {searchQuery ? (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="bg-surface-container-high border border-surface-variant text-on-surface hover:bg-surface-container-highest transition-all duration-150 font-label-md py-3 px-6 rounded-xl cursor-pointer"
                            >
                                Clear Search Query
                            </button>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button
                                    onClick={() => navigate("/seller/create-product")}
                                    className="bg-primary-container text-on-primary hover:opacity-90 active:scale-[0.98] transition-all duration-150 font-label-md py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.15)]"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                    Add Your First Product
                                </button>
                            </div>
                        )}
                    </div>
                ) : viewMode === "grid" ? (
                    /* Grid View Layout */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {sortedProducts.map((product) => {
                            const images = product.images || [];
                            return (
                                <div
                                    key={product._id}
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setModalActiveImageIndex(0);
                                        navigate(`/seller/product/${product._id}`);
                                    }}
                                    className="bg-surface-container-low border border-surface-variant rounded-2xl overflow-hidden hover:border-primary-container/30 hover:shadow-[0_0_25px_rgba(255,215,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                                >
                                    {/* Product Image Area */}
                                    <div className="relative aspect-4/3 bg-surface-container overflow-hidden">
                                        <img
                                            src={getActiveImage(product)}
                                            alt={product.title}
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                        />
                                        
                                        {/* Total Images Count Overlay Badge */}
                                        {images.length > 1 && (
                                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-primary font-label-sm text-[11px] px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1 shadow-md">
                                                <span className="material-symbols-outlined text-xs">photo_library</span>
                                                {images.length}
                                            </div>
                                        )}

                                        {/* Hover Thumbnail Row Quick Changer */}
                                        {images.length > 1 && (
                                            <div className="absolute bottom-2 left-0 right-0 justify-center gap-1 flex opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-2 bg-linear-to-t from-black/80 to-transparent py-2">
                                                {images.slice(0, 5).map((img, idx) => (
                                                    <div
                                                        key={img._id}
                                                        onMouseEnter={(e) => {
                                                            e.stopPropagation();
                                                            handleThumbnailHover(product._id, idx);
                                                        }}
                                                        className={`w-7 h-7 rounded border bg-surface-container-low overflow-hidden cursor-crosshair transition-all ${
                                                            (activeImageIndex[product._id] ?? 0) === idx
                                                                ? "border-primary-container scale-110 shadow-[0_0_6px_rgba(255,215,0,0.5)]" 
                                                                : "border-white/20 opacity-70 hover:opacity-100"
                                                        }`}
                                                    >
                                                        <img src={img.url} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                ))}
                                                {images.length > 5 && (
                                                    <div className="w-7 h-7 rounded border border-white/20 bg-black/80 flex items-center justify-center text-[9px] text-white font-bold font-label-sm">
                                                        +{images.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Details Area */}
                                    <div className="p-5 flex flex-col grow justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-headline-md font-semibold text-on-surface line-clamp-1 group-hover:text-primary-container transition-colors">
                                                    {product.title}
                                                </h4>
                                            </div>
                                            <p className="font-body-md text-on-surface-variant/80 text-sm line-clamp-2">
                                                {product.description || "No description provided."}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-surface-variant/40">
                                            <span className="font-headline-md font-bold text-primary-container text-base">
                                                {formatPrice(product.price?.amount, product.price?.currency)}
                                            </span>
                                            
                                            <span className="font-label-sm text-[11px] text-on-surface-variant/60">
                                                {formatDate(product.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* List View Layout */
                    <div className="bg-surface-container-low border border-surface-variant rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-surface-variant bg-surface-container/30">
                                        <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Product</th>
                                        <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Description</th>
                                        <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Price</th>
                                        <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Date Added</th>
                                        <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedProducts.map((product) => (
                                        <tr
                                            key={product._id}
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                setModalActiveImageIndex(0);
                                                navigate(`/seller/product/${product._id}`);
                                            }}
                                            className="border-b border-surface-variant/50 hover:bg-surface-container/20 transition-colors cursor-pointer group"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden border border-surface-variant shrink-0">
                                                        <img
                                                            src={product.images?.[0]?.url || "https://placehold.co/600x400/201f22/ffd700?text=No+Image"}
                                                            className="w-full h-full object-cover"
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-on-surface group-hover:text-primary-container transition-colors block">
                                                            {product.title}
                                                        </span>
                                                        <span className="text-xs text-on-surface-variant/60 font-label-sm sm:hidden">
                                                            {formatDate(product.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-xs hidden md:table-cell">
                                                <p className="text-sm text-on-surface-variant/80 line-clamp-1">
                                                    {product.description || "No description provided."}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-bold text-primary-container font-headline-md">
                                                    {formatPrice(product.price?.amount, product.price?.currency)}
                                                </span>
                                            </td>
                                            <td className="p-4 hidden sm:table-cell text-sm text-on-surface-variant/70">
                                                {formatDate(product.createdAt)}
                                            </td>
                                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setModalActiveImageIndex(0);
                                                    }}
                                                    className="bg-surface-container border border-surface-variant text-on-surface hover:border-primary-container/50 transition-colors px-3.5 py-1.5 rounded-lg text-xs font-label-md cursor-pointer"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Premium Details Preview Modal Overlay */}
            {selectedProduct && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
                    onClick={() => setSelectedProduct(null)}
                >
                    <div 
                        className="bg-surface-container-low border border-surface-variant/80 w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col md:flex-row relative shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
                        >
                            <span className="material-symbols-outlined block text-xl">close</span>
                        </button>

                        {/* Modal Image Section */}
                        <div className="md:w-1/2 bg-black flex flex-col relative aspect-4/3 md:aspect-auto md:min-h-115">
                            {/* Large Image Frame */}
                            <div className="grow relative flex items-center justify-center overflow-hidden p-2">
                                <img
                                    src={selectedProduct.images?.[modalActiveImageIndex]?.url || "https://placehold.co/600x400/201f22/ffd700?text=No+Image"}
                                    alt=""
                                    className="max-h-87.5 md:max-h-105 w-full object-contain"
                                />

                                {/* Carousel Navigation Arrows */}
                                {(selectedProduct.images?.length || 0) > 1 && (
                                    <>
                                        <button
                                            onClick={() => setModalActiveImageIndex(prev => (prev === 0 ? selectedProduct.images.length - 1 : prev - 1))}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/55 border border-white/15 text-white hover:bg-black/75 cursor-pointer shadow-lg transition-transform hover:scale-105"
                                        >
                                            <span className="material-symbols-outlined block">chevron_left</span>
                                        </button>
                                        <button
                                            onClick={() => setModalActiveImageIndex(prev => (prev === selectedProduct.images.length - 1 ? 0 : prev + 1))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/55 border border-white/15 text-white hover:bg-black/75 cursor-pointer shadow-lg transition-transform hover:scale-105"
                                        >
                                            <span className="material-symbols-outlined block">chevron_right</span>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Carousel Thumbnails Bar */}
                            {(selectedProduct.images?.length || 0) > 1 && (
                                <div className="p-3 bg-surface-container-lowest/80 border-t border-surface-variant/35 flex gap-2 overflow-x-auto justify-center custom-scrollbar">
                                    {selectedProduct.images.map((img, idx) => (
                                        <button
                                            key={img._id}
                                            onClick={() => setModalActiveImageIndex(idx)}
                                            className={`w-11 h-11 rounded-lg overflow-hidden border shrink-0 transition-all ${
                                                modalActiveImageIndex === idx 
                                                    ? "border-primary-container scale-105 shadow-[0_0_8px_rgba(255,215,0,0.4)]" 
                                                    : "border-white/10 opacity-60 hover:opacity-100"
                                            }`}
                                        >
                                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Info Section */}
                        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between gap-6 bg-surface-container-low max-h-115 overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <span className="bg-primary-container/10 text-primary-container border border-primary-container/20 text-[10px] font-label-sm tracking-widest px-2.5 py-1 rounded-full inline-block uppercase">
                                        Active Listing
                                    </span>
                                    <h3 className="text-2xl font-bold font-headline-lg text-on-surface mt-2">
                                        {selectedProduct.title}
                                    </h3>
                                </div>

                                <div className="text-2xl font-extrabold font-headline-lg text-primary-container">
                                    {formatPrice(selectedProduct.price?.amount, selectedProduct.price?.currency)}
                                </div>

                                <div className="space-y-1.5">
                                    <h5 className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Description</h5>
                                    <p className="text-sm font-body-md text-on-surface/90 leading-relaxed whitespace-pre-line bg-surface-container/20 p-4 rounded-xl border border-surface-variant/30">
                                        {selectedProduct.description || "No description provided for this product."}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-surface-variant/50 flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="text-on-surface-variant/70 font-label-sm block">DATE CREATED</span>
                                        <span className="font-semibold text-on-surface">{formatDate(selectedProduct.createdAt)}</span>
                                    </div>
                                    <div>
                                        <span className="text-on-surface-variant/70 font-label-sm block">PRODUCT ID</span>
                                        <span className="font-semibold text-on-surface font-label-sm truncate block" title={selectedProduct._id}>
                                            {selectedProduct._id}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="w-full bg-surface-container-high hover:bg-surface-container-highest border border-surface-variant/80 text-on-surface font-label-md text-sm py-3 rounded-xl transition-all duration-150 cursor-pointer"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;