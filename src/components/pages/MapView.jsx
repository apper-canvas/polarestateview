import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PropertyMap from '@/components/organisms/PropertyMap';
import SearchBar from '@/components/molecules/SearchBar';
import FilterSidebar from '@/components/molecules/FilterSidebar';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { propertyService } from '@/services';

const MapView = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
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
      
      // Clear selected property if it's no longer in filtered results
      if (selectedProperty && !filtered.find(p => p.id === selectedProperty.id)) {
        setSelectedProperty(null);
      }
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
    setSelectedProperty(null);
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
  };

  const handleViewDetails = () => {
    if (selectedProperty) {
      navigate(`/property/${selectedProperty.id}`);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (error && properties.length === 0) {
    return (
      <div className="h-full bg-background">
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
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-surface border-b border-surface-200 p-4">
        <div className="container mx-auto max-w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-primary">
                Map View
              </h1>
              <p className="text-surface-600 text-sm">
                {loading ? 'Loading...' : `${filteredProperties.length} properties shown`}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={showFilters ? 'primary' : 'outline'}
                icon="Filter"
                onClick={toggleFilters}
                size="sm"
              >
                Filters
              </Button>
              
              {selectedProperty && (
                <Button
                  icon="Eye"
                  onClick={handleViewDetails}
                  size="sm"
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
          
          {/* Search Bar */}
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search properties on map..."
            className="max-w-md"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Filter Sidebar */}
        {showFilters && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-80 flex-shrink-0 bg-surface border-r border-surface-200 overflow-y-auto"
          >
            <div className="p-4 border-b border-surface-200 flex items-center justify-between">
              <h3 className="font-semibold text-surface-900">Map Filters</h3>
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
        )}

        {/* Map Container */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 bg-surface-100 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <ApperIcon name="Loader2" className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="mt-2 text-surface-600">Loading properties...</p>
              </div>
            </div>
          ) : (
            <PropertyMap
              properties={filteredProperties}
              selectedProperty={selectedProperty}
              onPropertySelect={handlePropertySelect}
              className="w-full h-full"
            />
          )}

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <ApperIcon name="Home" size={10} className="text-white" />
                </div>
                <span className="text-surface-600">Available Property</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                  <ApperIcon name="Home" size={10} className="text-white" />
                </div>
                <span className="text-surface-600">Selected Property</span>
              </div>
            </div>
          </div>

          {/* Results Counter */}
          {!loading && filteredProperties.length > 0 && (
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-sm px-3 py-2 z-10">
              <span className="text-sm font-medium text-surface-700">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
              </span>
            </div>
          )}

          {/* No Results Message */}
          {!loading && filteredProperties.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-50">
              <div className="text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <ApperIcon name="MapPin" className="w-16 h-16 text-surface-300 mx-auto" />
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
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;