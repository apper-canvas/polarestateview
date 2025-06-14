import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';

const FilterSidebar = ({ filters, onFiltersChange, onClearFilters, className = '' }) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    property: true,
    beds: true,
    amenities: false
  });

  const propertyTypes = ['House', 'Condo', 'Townhouse', 'Multi-Family'];
  const amenitiesList = [
    'City Views', 'Pool', 'Gym', 'Parking', 'Fireplace', 
    'Hardwood Floors', 'Updated Kitchen', 'In-Unit Laundry',
    'Private Garden', 'Balcony', 'Walk-in Closet'
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handlePropertyTypeToggle = (type) => {
    const currentTypes = filters.propertyTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    handleFilterChange('propertyTypes', newTypes);
  };

  const handleAmenityToggle = (amenity) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    handleFilterChange('amenities', newAmenities);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceMin) count++;
    if (filters.priceMax) count++;
    if (filters.propertyTypes?.length > 0) count += filters.propertyTypes.length;
    if (filters.bedroomsMin) count++;
    if (filters.bathroomsMin) count++;
    if (filters.squareFeetMin) count++;
    if (filters.amenities?.length > 0) count += filters.amenities.length;
    return count;
  };

  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-surface-200 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-50 transition-colors"
      >
        <span className="font-medium text-surface-900">{title}</span>
        <motion.div
          animate={{ rotate: expandedSections[section] ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ApperIcon name="ChevronDown" size={20} className="text-surface-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {expandedSections[section] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className={`bg-surface border border-surface-200 rounded-lg overflow-hidden max-w-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-surface-200 bg-surface-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-surface-900">Filters</h3>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="accent" size="sm">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-surface-500 hover:text-surface-700"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Filter Sections */}
      <div className="max-h-96 overflow-y-auto">
        {/* Price Range */}
        <FilterSection title="Price Range" section="price">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Price"
              type="number"
              value={filters.priceMin || ''}
              onChange={(e) => handleFilterChange('priceMin', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="$0"
            />
            <Input
              label="Max Price"
              type="number"
              value={filters.priceMax || ''}
              onChange={(e) => handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Any"
            />
          </div>
        </FilterSection>

        {/* Property Type */}
        <FilterSection title="Property Type" section="property">
          <div className="space-y-2">
            {propertyTypes.map(type => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.propertyTypes?.includes(type) || false}
                  onChange={() => handlePropertyTypeToggle(type)}
                  className="rounded text-accent focus:ring-accent"
                />
                <span className="text-surface-700">{type}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Bedrooms & Bathrooms */}
        <FilterSection title="Beds & Baths" section="beds">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Bedrooms"
                type="number"
                value={filters.bedroomsMin || ''}
                onChange={(e) => handleFilterChange('bedroomsMin', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Any"
                min="0"
              />
              <Input
                label="Min Bathrooms"
                type="number"
                value={filters.bathroomsMin || ''}
                onChange={(e) => handleFilterChange('bathroomsMin', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Any"
                min="0"
                step="0.5"
              />
            </div>
            <Input
              label="Min Square Feet"
              type="number"
              value={filters.squareFeetMin || ''}
              onChange={(e) => handleFilterChange('squareFeetMin', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Any"
            />
          </div>
        </FilterSection>

        {/* Amenities */}
        <FilterSection title="Amenities" section="amenities">
          <div className="space-y-2">
            {amenitiesList.map(amenity => (
              <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.amenities?.includes(amenity) || false}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="rounded text-accent focus:ring-accent"
                />
                <span className="text-surface-700 text-sm break-words">{amenity}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

export default FilterSidebar;