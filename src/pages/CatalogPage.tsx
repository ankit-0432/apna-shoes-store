import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, Search, X, Check } from 'lucide-react';
import { Product } from '../types/store.js';
import { ProductCard } from '../components/common/ProductCard.js';

interface CatalogPageProps {
  products: Product[];
  currentCategory?: string; // 'all' | 'mens' | 'womens' | 'kids' | 'running' | 'bestsellers' | 'sale'
  searchQuery?: string;
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  products,
  currentCategory = 'all',
  searchQuery = '',
  onSelectProduct,
  onNavigate,
}) => {
  const [selectedGender, setSelectedGender] = useState<string>(
    currentCategory === 'mens' ? 'men' : currentCategory === 'womens' ? 'women' : currentCategory === 'kids' ? 'kids' : 'all'
  );
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(3500);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [searchTerm, setSearchTerm] = useState<string>(searchQuery);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available sizes in stock
  const allSizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Category / Badge
      if (currentCategory === 'bestsellers' && p.badge !== 'Bestseller' && p.rating < 4.7) return false;
      if (currentCategory === 'sale' && p.discountPercentage < 45) return false;
      if (currentCategory === 'running' && p.categorySlug !== 'running-shoes') return false;
      if (currentCategory === 'mens' && p.gender !== 'men' && p.gender !== 'unisex') return false;
      if (currentCategory === 'womens' && p.gender !== 'women' && p.gender !== 'unisex') return false;
      if (currentCategory === 'kids' && p.gender !== 'kids') return false;

      // 2. Gender filter
      if (selectedGender !== 'all') {
        if (selectedGender === 'kids' && p.gender !== 'kids') return false;
        if (selectedGender === 'men' && p.gender !== 'men' && p.gender !== 'unisex') return false;
        if (selectedGender === 'women' && p.gender !== 'women' && p.gender !== 'unisex') return false;
      }

      // 3. Size filter
      if (selectedSize !== 'all') {
        const hasSize = p.variants.some((v) => v.size === selectedSize && v.stockQuantity > 0);
        if (!hasSize) return false;
      }

      // 4. Price
      if (p.sellingPrice > maxPrice) return false;

      // 5. Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categorySlug.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'price-high') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
      return 0;
    });
  }, [products, currentCategory, selectedGender, selectedSize, maxPrice, sortBy, searchTerm]);

  const pageTitle =
    currentCategory === 'mens'
      ? "Men's Footwear Collection"
      : currentCategory === 'womens'
      ? "Women's Footwear Collection"
      : currentCategory === 'kids'
      ? "Kids' Active Footwear"
      : currentCategory === 'running'
      ? 'Running & Training Sneakers'
      : currentCategory === 'bestsellers'
      ? 'Bestselling Footwear'
      : currentCategory === 'sale'
      ? 'Sale & Clearance Deals'
      : 'All Footwear Collection';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <button onClick={() => onNavigate('home')} className="hover:text-zinc-900">Home</button>
            <span>/</span>
            <span className="text-zinc-900 font-medium capitalize">{currentCategory}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 font-display">
            {pageTitle}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Showing <span className="font-semibold text-zinc-900 tabular-nums">{filteredProducts.length}</span> styles engineered for Indian roads
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search in category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 w-44 sm:w-56"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="featured">Featured First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="discount">Biggest Discount</option>
          </select>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden p-2 bg-zinc-100 rounded-lg text-zinc-700"
            aria-label="Filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Catalog Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className={`md:block ${mobileFilterOpen ? 'block' : 'hidden'} md:col-span-1 space-y-6 bg-white md:bg-transparent p-4 md:p-0 rounded-xl border md:border-none border-zinc-200`}>
          {/* Gender Filter */}
          <div>
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">Gender</h3>
            <div className="space-y-1.5 text-xs text-zinc-700">
              {[
                { label: 'All Footwear', val: 'all' },
                { label: 'Men', val: 'men' },
                { label: 'Women', val: 'women' },
                { label: 'Kids', val: 'kids' },
              ].map((g) => (
                <button
                  key={g.val}
                  onClick={() => setSelectedGender(g.val)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                    selectedGender === g.val ? 'bg-zinc-900 text-white font-semibold' : 'hover:bg-zinc-100'
                  }`}
                >
                  <span>{g.label}</span>
                  {selectedGender === g.val && <Check className="w-3.5 h-3.5 text-orange-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="pt-4 border-t border-zinc-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">UK Size</h3>
              {selectedSize !== 'all' && (
                <button
                  onClick={() => setSelectedSize('all')}
                  className="text-[10px] text-orange-600 font-semibold underline"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {allSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? 'all' : sz)}
                  className={`py-1.5 text-xs font-semibold rounded border transition-colors ${
                    selectedSize === sz
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'border-zinc-200 text-zinc-700 hover:border-zinc-400 bg-white'
                  }`}
                >
                  {sz.replace('UK ', '')}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">Standard Indian sizing (Bata/Nike equivalent)</p>
          </div>

          {/* Max Price Slider */}
          <div className="pt-4 border-t border-zinc-200">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">Max Price</span>
              <span className="font-bold text-orange-600 tabular-nums">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="999"
              max="3500"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>₹999</span>
              <span>₹3,500</span>
            </div>
          </div>

          {/* Value Props Reminder */}
          <div className="pt-4 border-t border-zinc-200 bg-zinc-50 p-3.5 rounded-xl text-xs space-y-2">
            <div className="font-bold text-zinc-900 text-[11px]">⚡ APNA PROMISE:</div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              • 7-Day Doorstep Returns
              <br />
              • Free Delivery on orders &gt; ₹999
              <br />
              • Cash on Delivery supported
            </p>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center space-y-3">
              <p className="text-base font-bold text-zinc-900">No footwear found matching filters</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Try widening your price range, clearing the size filter, or searching for other sneaker styles.
              </p>
              <button
                onClick={() => {
                  setSelectedGender('all');
                  setSelectedSize('all');
                  setMaxPrice(3500);
                  setSearchTerm('');
                }}
                className="mt-2 px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
