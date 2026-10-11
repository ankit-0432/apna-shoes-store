import React, { useState } from 'react';
import { Star, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../../types/store.js';
import { SneakerGraphic } from './SneakerGraphic.js';
import { useCart } from '../../context/CartContext.js';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const [showSizes, setShowSizes] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [imageError, setImageError] = useState(false);

  const handleQuickAdd = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const variant = product.variants.find(v => v.size === size) || product.variants[0];
    addToCart(product, size, variant.colorName, 1);
    setShowSizes(false);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-zinc-300"
    >
      {/* Badge (Single disciplined badge if present) */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-900 bg-white/95 px-2.5 py-1 rounded shadow-sm border border-zinc-200/60">
            {product.badge}
          </span>
        </div>
      )}

      {/* Product Image Stage (65-75% visual dominance) */}
      <div className="relative aspect-[4/3] bg-zinc-100 flex items-center justify-center p-4 overflow-hidden group-hover:bg-zinc-50 transition-colors">
        {product.images && product.images.length > 0 && !imageError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <SneakerGraphic
            type={product.graphicType}
            accentColor={selectedVariant?.colorHex || '#FF5A1F'}
            className="w-full h-full"
          />
        )}

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="px-3.5 py-1.5 bg-white/90 backdrop-blur-sm text-zinc-900 text-xs font-semibold rounded-lg shadow hover:bg-white flex items-center gap-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        </div>
      </div>

      {/* Product Metadata Module */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Brand & Category in unboxed text with typographic separator */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
            <span className="uppercase tracking-wider">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{product.gender}</span>
          </div>

          {/* Product Title */}
          <h3 className="mt-1 text-sm font-bold text-zinc-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-600">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              <span className="ml-1 font-semibold text-zinc-900 tabular-nums">{product.rating}</span>
            </div>
            <span className="text-zinc-400">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-zinc-950 tabular-nums">
              ₹{product.sellingPrice.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.sellingPrice && (
              <>
                <span className="text-xs text-zinc-400 line-through tabular-nums">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-bold text-orange-600">
                  {product.discountPercentage}% OFF
                </span>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSizes(!showSizes);
              }}
              className="p-2 text-zinc-700 bg-zinc-100 hover:bg-orange-600 hover:text-white rounded-lg transition-colors"
              title="Select Size & Add to Cart"
              aria-label="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>

            {/* Quick Size Dropdown */}
            {showSizes && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-zinc-200 p-3 z-30 w-52 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
                  <span className="text-xs font-semibold text-zinc-900">Select UK Size:</span>
                  <button
                    onClick={() => setShowSizes(false)}
                    className="text-xs text-zinc-400 hover:text-zinc-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      disabled={v.stockQuantity === 0}
                      onClick={(e) => handleQuickAdd(v.size, e)}
                      className={`py-1.5 text-xs font-medium rounded border transition-colors ${
                        v.stockQuantity === 0
                          ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed line-through'
                          : 'border-zinc-200 hover:border-orange-600 hover:bg-orange-50 hover:text-orange-600 text-zinc-800'
                      }`}
                    >
                      {v.size.replace('UK ', '')}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-[10px] text-zinc-400 text-center">
                  Standard Indian Sizing
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
