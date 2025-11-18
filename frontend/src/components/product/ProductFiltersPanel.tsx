import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, SlidersHorizontal } from 'lucide-react';
import { ProductFilters } from '../../services/productService';
import { api } from '@/utils/api.client';

interface ProductFiltersPanelProps {
  filters: ProductFilters;
  onFilterChange: (filters: Partial<ProductFilters>) => void;
  onClearFilters: () => void;
}

const ProductFiltersPanel: React.FC<ProductFiltersPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const [categories, setCategories] = useState<Array<{ name: string; slug: string }>>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/products/categories');
        const list = (res.data?.items || []).map((c: any) => ({ name: c.name, slug: c.slug }));
        if (mounted) setCategories(list);
      } catch {
        if (mounted) setCategories([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popularity', label: 'Most Popular' },
  ];

  const priceRanges = [
    { min: 0, max: 1000, label: 'Under Nrs 1,000' },
    { min: 1000, max: 5000, label: 'Nrs 1,000 - 5,000' },
    { min: 5000, max: 10000, label: 'Nrs 5,000 - 10,000' },
    { min: 10000, max: 20000, label: 'Nrs 10,000 - 20,000' },
    { min: 20000, max: undefined, label: 'Over Nrs 20,000' },
  ];

  const hasActiveFilters = !!(filters.category || filters.minPrice || filters.maxPrice || filters.search);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="card p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      {filters.search && (
        <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
          <span className="text-sm text-primary-700">
            Searching for: "{filters.search}"
          </span>
          <button
            onClick={() => onFilterChange({ search: '' })}
            className="text-primary-600 hover:text-primary-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sort By */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => onFilterChange({ sortBy: e.target.value as ProductFilters['sortBy'] })}
          className="w-full input-field"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label key={range.label} className="flex items-center">
              <input
                type="radio"
                name="priceRange"
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                checked={
                  filters.minPrice === range.min && filters.maxPrice === range.max
                }
                onChange={() => onFilterChange({ 
                  minPrice: range.min, 
                  maxPrice: range.max 
                })}
              />
              <span className="ml-2 text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => onFilterChange({ 
                minPrice: e.target.value ? Number(e.target.value) : undefined 
              })}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => onFilterChange({ 
                maxPrice: e.target.value ? Number(e.target.value) : undefined 
              })}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              checked={!filters.category}
              onChange={() => onFilterChange({ category: '' })}
            />
            <span className="ml-2 text-sm text-gray-700">All categories</span>
          </label>
          {categories.map((c) => (
            <label key={c.slug} className="flex items-center">
              <input
                type="radio"
                name="category"
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                checked={filters.category === c.slug}
                onChange={() => onFilterChange({ 
                  category: c.slug 
                })}
              />
              <span className="ml-2 text-sm text-gray-700">{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Regions removed */}
    </motion.div>
  );
};

export default ProductFiltersPanel;
