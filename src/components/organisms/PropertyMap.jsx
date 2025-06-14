import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';

const PropertyMap = ({ properties = [], selectedProperty, onPropertySelect, className = '' }) => {
  const [mapCenter, setMapCenter] = useState({ lat: 39.8283, lng: -98.5795 }); // Center of US
  const [mapZoom, setMapZoom] = useState(4);

  useEffect(() => {
    if (properties.length > 0) {
      // Calculate center based on properties
      const avgLat = properties.reduce((sum, p) => sum + (p.coordinates?.lat || 0), 0) / properties.length;
      const avgLng = properties.reduce((sum, p) => sum + (p.coordinates?.lng || 0), 0) / properties.length;
      
      setMapCenter({ lat: avgLat, lng: avgLng });
      setMapZoom(8);
    }
  }, [properties]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Simulate map with property markers
  const MapMarker = ({ property, index }) => {
    const isSelected = selectedProperty?.id === property.id;
    
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.1 }}
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 ${
          isSelected ? 'z-20' : ''
        }`}
        style={{
          left: `${20 + (index % 3) * 30}%`,
          top: `${30 + Math.floor(index / 3) * 20}%`
        }}
        onClick={() => onPropertySelect(property)}
      >
        {/* Marker Pin */}
        <div className={`relative ${isSelected ? 'z-20' : ''}`}>
          <motion.div
            whileHover={{ y: -2 }}
            className={`p-2 rounded-full shadow-lg transition-all ${
              isSelected 
                ? 'bg-accent text-white' 
                : 'bg-white text-primary border border-surface-200'
            }`}
          >
            <ApperIcon name="Home" size={16} />
          </motion.div>
          
          {/* Price Label */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-sm ${
              isSelected
                ? 'bg-accent text-white'
                : 'bg-white text-surface-700 border border-surface-200'
            }`}
          >
            {formatPrice(property.price)}
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const PropertyInfoCard = ({ property }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 z-30 max-w-full overflow-hidden"
    >
      <div className="flex space-x-4">
        {property.images && property.images[0] && (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';
            }}
          />
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-lg text-primary line-clamp-1 break-words">
            {property.title}
          </h3>
          <p className="text-surface-600 text-sm mb-2 break-words">
            {property.address?.full}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-surface-600">
            <div className="flex items-center space-x-1">
              <ApperIcon name="Bed" size={14} />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ApperIcon name="Bath" size={14} />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ApperIcon name="Square" size={14} />
              <span>{property.squareFeet?.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <Badge variant="accent" size="sm" className="font-display font-semibold">
              {formatPrice(property.price)}
            </Badge>
            <Badge variant="secondary" size="sm">
              {property.propertyType}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`relative bg-surface-100 rounded-lg overflow-hidden ${className}`}>
      {/* Map Container */}
      <div className="relative w-full h-full min-h-96">
        {/* Simulated Map Background */}
        <div 
          className="w-full h-full bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
              linear-gradient(45deg, transparent 40%, rgba(251, 191, 36, 0.05) 60%)
            `
          }}
        >
          {/* Map Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Property Markers */}
        {properties.map((property, index) => (
          <MapMarker 
            key={property.id} 
            property={property} 
            index={index}
          />
        ))}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
            onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
          >
            <ApperIcon name="Plus" size={18} className="text-surface-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
            onClick={() => setMapZoom(prev => Math.max(prev - 1, 1))}
          >
            <ApperIcon name="Minus" size={18} className="text-surface-600" />
          </motion.button>
        </div>

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center space-x-2 text-sm text-surface-600">
            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <ApperIcon name="Home" size={10} className="text-white" />
            </div>
            <span>Available Properties</span>
          </div>
        </div>

        {/* Property Info Card */}
        {selectedProperty && (
          <PropertyInfoCard property={selectedProperty} />
        )}

        {/* No Properties Message */}
        {properties.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <ApperIcon name="MapPin" className="w-16 h-16 text-surface-300 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-surface-900">No properties to show</h3>
              <p className="mt-2 text-surface-500">Adjust your search filters to see properties on the map</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyMap;