import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import SearchBar from '@/components/molecules/SearchBar';
import FilterSidebar from '@/components/molecules/FilterSidebar';
import PropertyGrid from '@/components/organisms/PropertyGrid';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { propertyService } from '@/services';

const Browse = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, filters, searchTerm]);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await propertyService.getAll();
      setProperties(result);
    } catch (err) {
      setError(err.message || 'Failed to load properties');
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    if (properties.length === 0) return;

    try {
      let filtered = [...properties];

      // Apply search filter
      if (searchTerm) {
        filtered = await propertyService.searchByLocation(searchTerm);
      }

      // Apply other filters
      if (Object.keys(filters).length > 0) {
        filtered = await propertyService.filterProperties(filters);
        
        // If we have both search and filters, combine them
        if (searchTerm) {
          const searchResults = await propertyService.searchByLocation(searchTerm);
          const searchIds = new Set(searchResults.map(p => p.id));
          filtered = filtered.filter(p => searchIds.has(p.id));
        }
      }

      setFilteredProperties(filtered);
    } catch (err) {
      console.error('Error applying filters:', err);
      setFilteredProperties(properties);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setFilteredProperties(properties);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (error && properties.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-surface-900">Failed to load properties</h3>
          <p className="mt-2 text-surface-500">{error}</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4"
          >
            <Button onClick={loadProperties}>
              Try Again
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto px-4 py-6 max-w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-primary mb-2">
            Browse Properties
          </h1>
          <p className="text-surface-600">
            Discover your perfect home from our curated collection of premium properties
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search by city, state, or address..."
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* Filter Toggle */}
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              icon="Filter"
              onClick={toggleFilters}
              className="md:hidden"
            >
              Filters
            </Button>
            
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center space-x-1 p-1 bg-surface-100 rounded-lg">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                <ApperIcon name="Grid3X3" size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                <ApperIcon name="List" size={18} />
              </motion.button>
            </div>
          </div>

          {/* Active Filters Count */}
          {(Object.keys(filters).length > 0 || searchTerm) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="text-surface-500 hover:text-surface-700"
            >
              Clear All Filters
            </Button>
          )}
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>

          {/* Mobile Filter Sidebar */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={toggleFilters}
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-surface-200 flex items-center justify-between">
                  <h3 className="font-semibold text-surface-900">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="X"
                    onClick={toggleFilters}
                  />
                </div>
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                  className="border-0 rounded-none"
                />
              </motion.div>
            </motion.div>
          )}

          {/* Property Grid */}
          <div className="flex-1 min-w-0">
            <PropertyGrid
              properties={filteredProperties}
              loading={loading}
              viewMode={viewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;