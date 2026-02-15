
import React from 'react';
import { Product } from '../types';
import { Plus, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onClick?: (product: Product) => void;
  isInWishlist?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onClick, isInWishlist, onToggleWishlist }) => {
  const isSoldOut = product.stockStatus === 'Sold Out';

  return (
    <div 
      onClick={() => onClick && onClick(product)}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col h-full transition-transform active:scale-[0.98] cursor-pointer group relative"
    >
      <div className="relative h-48 w-full bg-gray-100 dark:bg-slate-800">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isSoldOut ? 'grayscale opacity-75' : ''}`}
          loading="lazy"
        />
        
        {/* Wishlist Button - REPOSITIONED TO TOP RIGHT */}
        {onToggleWishlist && (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(product);
                }}
                className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm z-10"
            >
                <Heart size={16} className={isInWishlist ? "fill-red-500 text-red-500" : ""} />
            </button>
        )}

        {/* Price Badge - REPOSITIONED TO BOTTOM RIGHT */}
        <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 z-10">
          ${product.price.toFixed(2)}
        </div>
        
        {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-0">
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Sold Out</span>
            </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">{product.name}</h3>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="mt-auto flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
                {product.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md">
                        #{tag}
                    </span>
                ))}
            </div>
            
            <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSoldOut) onAdd(product);
                }}
                disabled={isSoldOut}
                className={`p-2 rounded-full transition-colors shadow-lg shadow-gray-200 dark:shadow-none z-10 ${
                    isSoldOut 
                    ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed' 
                    : 'bg-black dark:bg-white text-white dark:text-slate-900 hover:bg-gray-800 dark:hover:bg-gray-200'
                }`}
                aria-label={isSoldOut ? "Out of stock" : "Add to cart"}
            >
                <Plus size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
