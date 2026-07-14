import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct.js';

const CreateProduct = () => {
    const { handleCreateProduct } = useProduct();
    const navigate = useNavigate();

    // Form inputs state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priceAmount: "",
        priceCurrency: "PKR",
    });

    // Image upload states
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // UI state feedback
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const addFiles = (files) => {
        const validFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length + validFiles.length > 7) {
            setError("You can only upload up to 7 images.");
            return;
        }

        setError("");
        const newPreviews = validFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
            name: file.name
        }));

        setImageFiles(prev => [...prev, ...validFiles]);
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        addFiles(files);
    };

    const handleRemoveImage = (index) => {
        const previewToRemove = imagePreviews[index];
        if (previewToRemove) {
            URL.revokeObjectURL(previewToRemove.url);
        }

        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        addFiles(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.title.trim()) {
            setError("Product Name is required.");
            return;
        }
        if (!formData.priceAmount || parseFloat(formData.priceAmount) <= 0) {
            setError("Price must be a positive number.");
            return;
        }
        if (imageFiles.length === 0) {
            setError("Please upload at least one image.");
            return;
        }

        setSubmitting(true);

        try {
            const dataToSend = new FormData();
            dataToSend.append("title", formData.title);
            dataToSend.append("description", formData.description);
            dataToSend.append("priceAmount", formData.priceAmount);
            dataToSend.append("priceCurrency", formData.priceCurrency);

            imageFiles.forEach((file) => {
                dataToSend.append("images", file);
            });

            await handleCreateProduct(dataToSend);
            setSuccess("Product created successfully!");

            // Clean up previews object URLs
            imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));

            setTimeout(() => {
                navigate("/"); // Redirect to home/dashboard
            }, 1500);
        } catch (err) {
            console.error("Error creating product:", err);
            setError(err.response?.data?.message || err.message || "Failed to create product. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-on-surface font-body-md flex flex-col overflow-x-hidden custom-scrollbar">
            {/* Header / TopAppBar */}
            <header className="w-full sticky top-0 z-50 bg-background border-b border-surface-container-highest flex items-center justify-between px-container-padding-mobile md:px-container-padding-desktop h-16 max-w-360 mx-auto">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors active:scale-95 duration-150 text-on-surface-variant cursor-pointer"
                        aria-label="Go back"
                    >
                        <span className="material-symbols-outlined block">arrow_back</span>
                    </button>
                    <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">Create Product</h1>
                </div>
                <div className="hidden md:flex items-center gap-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="font-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                        Discard
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="grow w-full max-w-360 mx-auto px-container-padding-mobile md:px-container-padding-desktop py-8 md:py-12">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Form Details */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Status Messages */}
                        {error && (
                            <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 font-body-md animate-in fade-in slide-in-from-top-1 duration-200">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-4 bg-surface-container-high text-primary-container rounded-xl border border-primary-container/20 font-body-md animate-in fade-in slide-in-from-top-1 duration-200">
                                {success}
                            </div>
                        )}

                        {/* Title & Description Card */}
                        <div className="bg-surface-container-low p-6 md:p-8 rounded-xl border border-surface-variant">
                            <div className="space-y-6">
                                {/* Title */}
                                <div className="space-y-2">
                                    <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                                        Product Name
                                    </label>
                                    <input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-surface-container border border-surface-variant rounded-xl px-4 py-3.5 text-on-surface placeholder:text-on-surface-variant/30 font-body-lg focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all duration-200"
                                        placeholder="Enter product name"
                                        type="text"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="6"
                                        className="w-full bg-surface-container border border-surface-variant rounded-xl px-4 py-3.5 text-on-surface placeholder:text-on-surface-variant/30 font-body-md focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all duration-200 resize-none"
                                        placeholder="Describe your product in detail..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Currency Card */}
                        <div className="bg-surface-container-low p-6 md:p-8 rounded-xl border border-surface-variant">
                            <h3 className="font-headline-md text-headline-md font-semibold mb-6 text-on-surface">Pricing &amp; Currency</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Price Amount */}
                                <div className="space-y-2">
                                    <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                                        Price
                                    </label>
                                    <div className="relative flex items-center">
                                        <input
                                            name="priceAmount"
                                            value={formData.priceAmount}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full bg-surface-container border border-surface-variant rounded-xl pl-4 pr-16 py-3.5 text-on-surface font-label-md focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all duration-200"
                                            placeholder="0.00"
                                            type="number"
                                        />
                                        <span className="absolute right-4 text-on-surface-variant/50 font-label-sm">
                                            {formData.priceCurrency}
                                        </span>
                                    </div>
                                </div>

                                {/* Currency Selector */}
                                <div className="space-y-2">
                                    <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                                        Currency
                                    </label>
                                    <select
                                        name="priceCurrency"
                                        value={formData.priceCurrency}
                                        onChange={handleChange}
                                        className="w-full bg-surface-container border border-surface-variant rounded-xl px-4 py-3.5 text-on-surface font-label-md focus:outline-none focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 transition-all duration-200 cursor-pointer"
                                    >
                                        <option value="PKR">PKR - Pakistani Rupee</option>
                                        <option value="USD">USD - United States Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="GBP">GBP - British Pound</option>
                                        <option value="CAD">CAD - Canadian Dollar</option>
                                        <option value="AUD">AUD - Australian Dollar</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Media */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Image Upload Card */}
                        <div className="bg-surface-container-low p-6 md:p-8 rounded-xl border border-surface-variant">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                                    Media (Up to 7)
                                </label>
                                <span className="text-label-sm text-primary-container font-semibold">
                                    {imageFiles.length}/7
                                </span>
                            </div>

                            {/* Drop/Click Upload Area */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`group cursor-pointer relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${isDragging
                                        ? "border-primary-container bg-primary-container/5"
                                        : "border-surface-variant hover:border-primary-container bg-surface-container/20"
                                    } mb-6`}
                            >
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    disabled={imageFiles.length >= 7}
                                />
                                <span className="material-symbols-outlined text-4xl text-primary-container mb-2 block">
                                    cloud_upload
                                </span>
                                <p className="font-label-md text-on-surface">
                                    Drop files or <span className="text-primary-container font-semibold">browse</span>
                                </p>
                                <p className="font-label-sm text-on-surface-variant mt-1">
                                    High-res PNG, JPG or WEBP
                                </p>
                            </div>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 gap-3">
                                    {imagePreviews.map((preview, index) => (
                                        <div
                                            key={preview.id}
                                            className="relative group aspect-square rounded-lg overflow-hidden border border-surface-variant bg-surface-container"
                                        >
                                            <img
                                                src={preview.url}
                                                alt={preview.name}
                                                className="w-full h-full object-cover object-center"
                                            />
                                            {/* Hover overlay and Remove button */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="bg-error text-on-error p-1.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-sm block">close</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Empty slots placeholders */}
                                    {imageFiles.length < 7 && (
                                        <div className="aspect-square rounded-lg bg-surface-container/10 border border-dashed border-surface-variant flex items-center justify-center text-on-surface-variant/20">
                                            <span className="material-symbols-outlined text-2xl">add</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit Button (Desktop only) */}
                        <div className="hidden lg:block pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary-container text-on-primary hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all duration-150 font-label-md text-label-md py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(255,215,0,0.2)]"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        Create Product
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </main>

            {/* Mobile Footer Action Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-md z-40 border-t border-surface-container-highest py-4 lg:hidden">
                <div className="px-container-padding-mobile">
                    <button
                        onClick={handleSubmit}
                        type="button"
                        disabled={submitting}
                        className="w-full bg-primary-container text-on-primary hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all duration-150 font-label-md text-label-md py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.15)]"
                    >
                        {submitting ? "Creating..." : "Create Product"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateProduct;