
import React from 'react';
import { FilterState } from '../types';
import { X } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableOrigins: string[];
  availableColors: string[];
  maxPriceLimit: number;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  availableOrigins,
  availableColors,
  maxPriceLimit,
}) => {
  if (!isOpen) return null;

  const toggleOrigin = (origin: string) => {
    setFilters(prev => ({
      ...prev,
      origins: prev.origins.includes(origin)
        ? prev.origins.filter(o => o !== origin)
        : [...prev.origins, origin]
    }));
  };

  const toggleColor = (color: string) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/50 pointer-events-auto backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-t-3xl sm:rounded-2xl pointer-events-auto shadow-2xl animate-in slide-in-from-bottom-full duration-300 border dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-900 dark:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Price Filter */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Price Range</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">${filters.minPrice}</span>
            <input 
              type="range" 
              min="0" 
              max={maxPriceLimit} 
              value={filters.maxPrice} 
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
            />
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">${filters.maxPrice}</span>
          </div>
        </div>

        {/* Origin Filter */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Origin</h3>
          <div className="flex flex-wrap gap-2">
            {availableOrigins.map(origin => (
              <button
                key={origin}
                onClick={() => toggleOrigin(origin)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  filters.origins.includes(origin)
                    ? 'bg-black text-white border-black dark:bg-white dark:text-slate-900 dark:border-white'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-600 dark:hover:border-slate-500'
                }`}
              >
                {origin}
              </button>
            ))}
          </div>
        </div>

        {/* Color Filter */}
        <div className="mb-8">
          <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Color</h3>
          <div className="flex flex-wrap gap-2">
            {availableColors.map(color => (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className={`pl-2 pr-3 py-1.5 rounded-full text-sm border transition-all flex items-center gap-2 ${
                  filters.colors.includes(color)
                    ? 'bg-black text-white border-black dark:bg-white dark:text-slate-900 dark:border-white'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-600 dark:hover:border-slate-500'
                }`}
              >
                <span 
                    className="w-3 h-3 rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: color.toLowerCase() }}
                ></span>
                {color}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform dark:bg-white dark:text-slate-900"
        >
          Show Results
        </button>
      </div>
    </div>
  );
};

export default FilterModal;
