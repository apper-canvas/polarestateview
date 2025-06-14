import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import { savedPropertyService } from '@/services';

const PropertyCard = ({ property, index = 0 }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [property.id]);

  const checkIfSaved = async () => {
    try {
      const saved = await savedPropertyService.isPropertySaved(property.id);
      setIsSaved(saved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      if (isSaved) {
        await savedPropertyService.deleteByPropertyId(property.id);
        setIsSaved(false);
        toast.success('Property removed from saved list');
      } else {
        await savedPropertyService.create({
          propertyId: property.id,
          notes: ''
        });
        setIsSaved(true);
        toast.success('Property saved successfully');
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
      toast.error('Failed to update saved status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/property/${property.id}`);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === property.images?.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images?.length - 1 : prev - 1
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-surface rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer overflow-hidden max-w-full"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative aspect-property overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <>
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';
              }}
            />
            
            {/* Image Navigation */}
            {property.images.length > 1 && (
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevImage}
                  className="p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ApperIcon name="ChevronLeft" size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextImage}
                  className="p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ApperIcon name="ChevronRight" size={16} />
                </motion.button>
              </div>
            )}
            
            {/* Image Indicators */}
            {property.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {property.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-surface-200 flex items-center justify-center">
            <ApperIcon name="Image" size={48} className="text-surface-400" />
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="accent" size="lg" className="font-display font-semibold">
            {formatPrice(property.price)}
          </Badge>
        </div>
        
        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSaveToggle}
          disabled={isLoading}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors disabled:opacity-50"
        >
          <ApperIcon 
            name={isSaved ? "Heart" : "Heart"} 
            size={18} 
            className={`transition-colors ${
              isSaved ? 'text-accent fill-accent' : 'text-surface-400'
            }`}
            fill={isSaved ? 'currentColor' : 'none'}
          />
        </motion.button>
      </div>
      
      {/* Content Section */}
      <div className="p-4 space-y-3 max-w-full">
        <div>
          <h3 className="font-display font-semibold text-lg text-primary line-clamp-2 break-words">
            {property.title}
          </h3>
          <p className="text-surface-600 text-sm mt-1 break-words">
            {property.address?.full || 'Address not available'}
          </p>
        </div>
        
        {/* Property Stats */}
        <div className="flex items-center space-x-4 text-sm text-surface-600">
          <div className="flex items-center space-x-1">
            <ApperIcon name="Bed" size={16} />
            <span>{property.bedrooms} beds</span>
          </div>
          <div className="flex items-center space-x-1">
            <ApperIcon name="Bath" size={16} />
            <span>{property.bathrooms} baths</span>
          </div>
          <div className="flex items-center space-x-1">
            <ApperIcon name="Square" size={16} />
            <span>{property.squareFeet?.toLocaleString()} sq ft</span>
          </div>
        </div>
        
        {/* Property Type */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" size="sm">
            {property.propertyType}
          </Badge>
          <div className="flex items-center space-x-1 text-xs text-surface-500">
            <ApperIcon name="Calendar" size={14} />
            <span>Built {property.yearBuilt}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;