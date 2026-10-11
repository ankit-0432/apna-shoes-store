import React, { useState } from 'react';
import {
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  MapPin,
  ArrowRight,
  Info,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { Product } from '../types/store.js';
import { SneakerGraphic } from '../components/common/SneakerGraphic.js';
import { useCart } from '../context/CartContext.js';
import { api } from '../services/api.js';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onSelectProduct,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size || 'UK 8');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [pincode, setPincode] = useState('110001'); // Default Delhi NCR
  const [pincodeResult, setPincodeResult] = useState<any>(null);
  const [isCheckingPin, setIsCheckingPin] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Filter related shoes
  const relatedShoes = allProducts
    .filter((p) => p.id !== product.id && (p.categorySlug === product.categorySlug || p.gender === product.gender))
    .slice(0, 3);

  const handlePincodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    setIsCheckingPin(true);
    try {
      const result = await api.checkPincode(pincode.trim());
      setPincodeResult(result);
    } catch (err) {
      setPincodeResult({ serviceable: false, message: 'Invalid PIN code' });
    } finally {
      setIsCheckingPin(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedVariant.colorName, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedVariant.colorName, quantity);
    onNavigate('checkout');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500">
        <button onClick={() => onNavigate('home')} className="hover:text-zinc-900">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('all')} className="hover:text-zinc-900">Footwear</button>
        <span>/</span>
        <button onClick={() => onNavigate(product.gender === 'men' ? 'mens' : product.gender === 'women' ? 'womens' : 'kids')} className="hover:text-zinc-900 capitalize">
          {product.gender}
        </button>
        <span>/</span>
        <span className="text-zinc-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Contiguous Purchase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Visual Gallery Stage (Sticky Left) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] bg-zinc-100 rounded-2xl p-6 sm:p-10 flex items-center justify-center border border-zinc-200 overflow-hidden shadow-xs">
            {product.badge && (
              <span className="absolute top-4 left-4 z-10 text-xs font-bold uppercase tracking-wider text-zinc-900 bg-white/95 px-3 py-1 rounded shadow-sm border border-zinc-200">
                {product.badge}
              </span>
            )}

            <button
              onClick={handleShare}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white text-zinc-700 rounded-full shadow-sm transition-colors text-xs flex items-center gap-1"
              title="Share footwear"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare && <span className="text-[10px] text-emerald-600 font-bold">Link Copied!</span>}
            </button>

            {/* Product Image Stage (Photo or Vector Graphic) */}
            {product.images && product.images.length > 0 && !imageError ? (
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                onError={() => setImageError(true)}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain max-h-96 transition-all duration-200"
              />
            ) : (
              <SneakerGraphic
                type={product.graphicType}
                accentColor={selectedVariant.colorHex || '#FF5A1F'}
                className="w-full h-full max-h-96"
              />
            )}
          </div>

          {/* Perspective Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {product.images && product.images.length > 0 ? (
              product.images.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`aspect-[4/3] bg-white rounded-xl border p-1.5 flex items-center justify-center cursor-pointer overflow-hidden transition-all ${
                    activeImageIndex === i ? 'border-orange-600 ring-2 ring-orange-600/20' : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-contain" />
                </div>
              ))
            ) : (
              ['Side Profile', 'Top View', 'Sole Grip', 'Heel Counter'].map((viewLabel, i) => (
                <div
                  key={i}
                  className={`aspect-[4/3] bg-zinc-50 rounded-xl border p-2 flex flex-col items-center justify-between cursor-pointer transition-all ${
                    i === 0 ? 'border-orange-600 ring-2 ring-orange-600/20' : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <div className="w-full h-12 flex items-center justify-center">
                    <SneakerGraphic
                      type={product.graphicType}
                      accentColor={selectedVariant.colorHex || '#FF5A1F'}
                      className="w-full h-full"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-600">{viewLabel}</span>
                </div>
              ))
            )}
          </div>

          {/* Trust Guarantees Strip */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-orange-600 shrink-0" />
              <div>
                <p className="font-bold text-zinc-900">7-Day Returns</p>
                <p className="text-[10px] text-zinc-500">Free doorstep pickup</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-600 shrink-0" />
              <div>
                <p className="font-bold text-zinc-900">Express Courier</p>
                <p className="text-[10px] text-zinc-500">2-4 business days</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
              <div>
                <p className="font-bold text-zinc-900">COD Available</p>
                <p className="text-[10px] text-zinc-500">Pay cash at delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module (Sticky Right) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div>
            {/* Brand in unboxed text */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <span>{product.brand}</span>
              <span>·</span>
              <span className="text-orange-600">{product.gender} Footwear</span>
              <span>·</span>
              <span className="font-mono text-zinc-400">SKU: {product.sku}</span>
            </div>

            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-zinc-950 font-display">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="mt-2 flex items-center gap-3 text-xs">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                <span className="ml-1 font-bold text-zinc-900 tabular-nums">{product.rating}</span>
              </div>
              <span className="text-zinc-400">·</span>
              <span className="text-zinc-600 underline font-medium">{product.reviewCount} Verified Buyer Reviews</span>
            </div>

            {/* Price Module */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-zinc-950 tabular-nums">
                ₹{product.sellingPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-base text-zinc-400 line-through tabular-nums">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                SAVE {product.discountPercentage}%
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Inclusive of all Indian taxes (18% GST)</p>
          </div>

          {/* Colorway / Variant Selector */}
          <div className="pt-4 border-t border-zinc-200">
            <span className="text-xs font-bold text-zinc-900 block mb-2">
              Color: <span className="font-normal text-zinc-600">{selectedVariant.colorName}</span>
            </span>
            <div className="flex items-center gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVariant(v);
                    setSelectedSize(v.size);
                  }}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border-2 transition-all ${
                    selectedVariant.id === v.id
                      ? 'border-zinc-950 ring-2 ring-orange-500'
                      : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                  title={`${v.colorName} - ${v.size}`}
                >
                  <span
                    className="w-5 h-5 rounded-md shadow-xs"
                    style={{ backgroundColor: v.colorHex }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector & Size Guide */}
          <div className="pt-4 border-t border-zinc-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-900">
                Select Size: <span className="text-orange-600">{selectedSize}</span>
              </span>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="text-xs text-orange-600 font-semibold underline flex items-center gap-1 hover:text-orange-700"
              >
                <Info className="w-3.5 h-3.5" />
                Size Chart (UK / India)
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  disabled={v.stockQuantity === 0}
                  onClick={() => {
                    setSelectedSize(v.size);
                    setSelectedVariant(v);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    selectedSize === v.size
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                      : v.stockQuantity === 0
                      ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed line-through'
                      : 'bg-white text-zinc-800 border-zinc-300 hover:border-orange-600 hover:text-orange-600'
                  }`}
                >
                  {v.size}
                </button>
              ))}
            </div>

            {/* Stock indicator */}
            <div className="mt-2 text-[11px]">
              {selectedVariant.stockQuantity <= 10 ? (
                <span className="text-amber-600 font-semibold">
                  ⚠️ Only {selectedVariant.stockQuantity} pairs left in stock!
                </span>
              ) : (
                <span className="text-emerald-700 font-medium">
                  ✓ In Stock ({selectedVariant.stockQuantity} units available at central hub)
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons (Add to Cart / Buy Now) */}
          <div className="pt-4 border-t border-zinc-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm active:scale-98"
              >
                Add to Bag
              </button>
              <button
                onClick={handleBuyNow}
                className="py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all hover:opacity-95 active:scale-98"
                style={{ backgroundColor: '#FF5A1F' }}
              >
                Buy Now ⚡
              </button>
            </div>
          </div>

          {/* Delivery PIN Code Serviceability Check */}
          <div className="pt-4 border-t border-zinc-200 bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Check Delivery & COD at Your PIN Code</span>
            </div>

            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit PIN code (e.g. 110001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={isCheckingPin || pincode.length !== 6}
                className="px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                {isCheckingPin ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pincodeResult && (
              <div className={`text-xs p-2.5 rounded-lg border ${
                pincodeResult.serviceable
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <p className="font-semibold">{pincodeResult.message}</p>
                {pincodeResult.serviceable && (
                  <p className="text-[11px] text-emerald-700 mt-1">
                    ✓ Cash on Delivery Available · Courier: {pincodeResult.courierPartner}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Description & Technical Specifications */}
      <div className="pt-10 border-t border-zinc-200 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 font-display">Craftsmanship & Features</h3>
          <p className="text-sm text-zinc-700 leading-relaxed">{product.description}</p>

          <div className="pt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <span className="font-bold text-zinc-900 block">Responsive Cushioning</span>
              <span className="text-zinc-600 mt-0.5 block">Dual-density EVA foam absorbs heel strikes</span>
            </div>
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <span className="font-bold text-zinc-900 block">Engineered Grip</span>
              <span className="text-zinc-600 mt-0.5 block">High-traction waffle rubber designed for tarmac & rain</span>
            </div>
          </div>
        </div>

        {/* Specifications Table */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">
            Product Specifications
          </h3>
          <dl className="divide-y divide-zinc-100 text-xs">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="py-2.5 flex justify-between">
                <dt className="text-zinc-500 font-medium">{key}</dt>
                <dd className="text-zinc-900 font-semibold text-right max-w-xs">{value}</dd>
              </div>
            ))}
            <div className="py-2.5 flex justify-between">
              <dt className="text-zinc-500 font-medium">Weight</dt>
              <dd className="text-zinc-900 font-semibold">{product.weightGrams} grams per pair</dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-zinc-500 font-medium">Return Window</dt>
              <dd className="text-orange-600 font-semibold">7 Calendar Days Guaranteed</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Sizing Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-200">
              <h3 className="text-base font-bold text-zinc-900 font-display">Indian Footwear Size Chart</h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-zinc-400 hover:text-zinc-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-600 my-4 leading-relaxed">
              Apna Shoes follows standard <strong>UK / Indian sizing</strong>. Measure your foot length in centimeters (cm) against a wall to pick your best fit.
            </p>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-800">
                  <th className="py-2 px-3">UK / India Size</th>
                  <th className="py-2 px-3">Euro Size</th>
                  <th className="py-2 px-3">US Size</th>
                  <th className="py-2 px-3">Foot Length (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                <tr><td className="py-2 px-3 font-bold text-orange-600">UK 6</td><td className="py-2 px-3">EU 39.5</td><td className="py-2 px-3">US 6.5</td><td className="py-2 px-3">24.5 cm</td></tr>
                <tr><td className="py-2 px-3 font-bold text-orange-600">UK 7</td><td className="py-2 px-3">EU 40.5</td><td className="py-2 px-3">US 7.5</td><td className="py-2 px-3">25.4 cm</td></tr>
                <tr><td className="py-2 px-3 font-bold text-orange-600">UK 8</td><td className="py-2 px-3">EU 42</td><td className="py-2 px-3">US 8.5</td><td className="py-2 px-3">26.2 cm</td></tr>
                <tr><td className="py-2 px-3 font-bold text-orange-600">UK 9</td><td className="py-2 px-3">EU 43</td><td className="py-2 px-3">US 9.5</td><td className="py-2 px-3">27.1 cm</td></tr>
                <tr><td className="py-2 px-3 font-bold text-orange-600">UK 10</td><td className="py-2 px-3">EU 44.5</td><td className="py-2 px-3">US 10.5</td><td className="py-2 px-3">28.0 cm</td></tr>
                <tr><td className="py-2 px-3 font-bold text-orange-600">UK 11</td><td className="py-2 px-3">EU 45.5</td><td className="py-2 px-3">US 11.5</td><td className="py-2 px-3">28.8 cm</td></tr>
              </tbody>
            </table>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => setShowSizeGuide(false)}
                className="px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
