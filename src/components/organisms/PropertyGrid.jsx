import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropertyCard from '@/components/molecules/PropertyCard';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const PropertyGrid = ({ properties = [], loading = false, viewMode = 'grid' }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [sortedProperties, setSortedProperties] = useState([]);

  useEffect(() => {
    let sorted = [...properties];
    
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'bedrooms':
        sorted.sort((a, b) => b.bedrooms - a.bedrooms);
        break;
      case 'sqft':
        sorted.sort((a, b) => b.squareFeet - a.squareFeet);
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.listingDate) - new Date(a.listingDate));
        break;
    }
    
    setSortedProperties(sorted);
  }, [properties, sortBy]);

  const SkeletonCard = ({ index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-surface rounded-card shadow-card overflow-hidden"
    >
      <div className="aspect-property bg-surface-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-5 bg-surface-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-surface-200 rounded animate-pulse w-1/2" />
        </div>
        <div className="flex space-x-4">
          <div className="h-4 bg-surface-200 rounded animate-pulse w-16" />
          <div className="h-4 bg-surface-200 rounded animate-pulse w-16" />
          <div className="h-4 bg-surface-200 rounded animate-pulse w-20" />
        </div>
        <div className="flex justify-between">
          <div className="h-6 bg-surface-200 rounded animate-pulse w-20" />
          <div className="h-4 bg-surface-200 rounded animate-pulse w-16" />
        </div>
      </div>
    </motion.div>
  );

  const EmptyState = () => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="col-span-full text-center py-12"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <ApperIcon name="Home" className="w-16 h-16 text-surface-300 mx-auto" />
      </motion.div>
      <h3 className="mt-4 text-lg font-medium text-surface-900">No properties found</h3>
      <p className="mt-2 text-surface-500">Try adjusting your search criteria or filters</p>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4"
      >
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Reset Search
        </Button>
      </motion.div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="max-w-full">
        {/* Sort Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-surface-200 rounded animate-pulse w-32" />
          <div className="h-10 bg-surface-200 rounded animate-pulse w-40" />
        </div>
        
        {/* Grid Skeleton */}
        <div className={`grid gap-6 ${
          viewMode === 'list' 
            ? 'grid-cols-1' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} index={index} />
          ))}
        </div>
      </div>
    );
  }

  if (sortedProperties.length === 0) {
    return (
      <div className={`grid gap-6 ${
        viewMode === 'list' 
          ? 'grid-cols-1' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="max-w-full">
      {/* Sort Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-surface-600">
          {sortedProperties.length} {sortedProperties.length === 1 ? 'property' : 'properties'} found
        </p>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="sort" className="text-sm text-surface-600">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-surface-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="bedrooms">Most Bedrooms</option>
            <option value="sqft">Largest Square Feet</option>
          </select>
        </div>
      </div>
      
      {/* Property Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'list' 
          ? 'grid-cols-1' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        {sortedProperties.map((property, index) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default PropertyGrid;