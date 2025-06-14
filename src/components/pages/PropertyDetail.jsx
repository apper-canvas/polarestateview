import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ImageGallery from '@/components/molecules/ImageGallery';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { propertyService, savedPropertyService } from '@/services';
import { format } from 'date-fns';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingProperty, setSavingProperty] = useState(false);

  useEffect(() => {
    if (id) {
      loadProperty();
      checkIfSaved();
    }
  }, [id]);

  const loadProperty = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await propertyService.getById(id);
      setProperty(result);
    } catch (err) {
      setError(err.message || 'Failed to load property');
      toast.error('Property not found');
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const saved = await savedPropertyService.isPropertySaved(id);
      setIsSaved(saved);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveToggle = async () => {
    setSavingProperty(true);
    
    try {
      if (isSaved) {
        await savedPropertyService.deleteByPropertyId(id);
        setIsSaved(false);
        toast.success('Property removed from saved list');
      } else {
        await savedPropertyService.create({
          propertyId: id,
          notes: ''
        });
        setIsSaved(true);
        toast.success('Property saved successfully');
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
      toast.error('Failed to update saved status');
    } finally {
      setSavingProperty(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return 'Date not available';
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <div className="container mx-auto px-4 py-6 max-w-full">
          {/* Header Skeleton */}
          <div className="mb-6 space-y-2">
            <div className="h-8 bg-surface-200 rounded animate-pulse w-64" />
            <div className="h-4 bg-surface-200 rounded animate-pulse w-48" />
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery Skeleton */}
              <div className="aspect-property bg-surface-200 rounded-lg animate-pulse" />
              
              {/* Description Skeleton */}
              <div className="space-y-3">
                <div className="h-6 bg-surface-200 rounded animate-pulse w-32" />
                <div className="space-y-2">
                  <div className="h-4 bg-surface-200 rounded animate-pulse w-full" />
                  <div className="h-4 bg-surface-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-surface-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Property Info Skeleton */}
              <div className="bg-surface rounded-lg p-6 space-y-4">
                <div className="h-8 bg-surface-200 rounded animate-pulse w-32" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 bg-surface-200 rounded animate-pulse w-20" />
                      <div className="h-4 bg-surface-200 rounded animate-pulse w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-full bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-surface-900">Property not found</h3>
            <p className="mt-2 text-surface-500">{error || 'The property you are looking for does not exist.'}</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4"
            >
              <Button onClick={() => navigate('/')}>
                Back to Browse
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto px-4 py-6 max-w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              icon="ArrowLeft"
              onClick={() => navigate('/')}
              className="text-surface-500"
            >
              Back to Browse
            </Button>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-3xl font-bold text-primary mb-2 break-words">
                {property.title}
              </h1>
              <div className="flex items-center space-x-2 text-surface-600 mb-4">
                <ApperIcon name="MapPin" size={18} />
                <span className="break-words">{property.address?.full}</span>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="accent" size="lg" className="font-display font-bold text-xl">
                  {formatPrice(property.price)}
                </Badge>
                <Badge variant="secondary" size="md">
                  {property.propertyType}
                </Badge>
              </div>
            </div>
            
            <Button
              variant={isSaved ? 'primary' : 'outline'}
              icon="Heart"
              onClick={handleSaveToggle}
              disabled={savingProperty}
              className="flex-shrink-0 ml-4"
            >
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Description */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <ImageGallery
                images={property.images}
                alt={property.title}
                className="w-full"
              />
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface rounded-lg p-6"
            >
              <h2 className="font-display text-2xl font-semibold text-primary mb-4">
                About This Property
              </h2>
              <p className="text-surface-700 leading-relaxed break-words">
                {property.description}
              </p>
            </motion.div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-surface rounded-lg p-6"
              >
                <h2 className="font-display text-2xl font-semibold text-primary mb-4">
                  Amenities & Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="flex items-center space-x-2"
                    >
                      <ApperIcon name="Check" size={16} className="text-success flex-shrink-0" />
                      <span className="text-surface-700 break-words">{amenity}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Property Info */}
          <div className="space-y-6">
            {/* Property Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface rounded-lg p-6 shadow-card"
            >
              <h3 className="font-display text-xl font-semibold text-primary mb-4">
                Property Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-surface-100 last:border-b-0">
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Bed" size={18} className="text-surface-500" />
                    <span className="text-surface-700">Bedrooms</span>
                  </div>
                  <span className="font-medium text-surface-900">{property.bedrooms}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-surface-100 last:border-b-0">
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Bath" size={18} className="text-surface-500" />
                    <span className="text-surface-700">Bathrooms</span>
                  </div>
                  <span className="font-medium text-surface-900">{property.bathrooms}</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-surface-100 last:border-b-0">
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Square" size={18} className="text-surface-500" />
                    <span className="text-surface-700">Square Feet</span>
                  </div>
                  <span className="font-medium text-surface-900">
                    {property.squareFeet?.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-surface-100 last:border-b-0">
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Calendar" size={18} className="text-surface-500" />
                    <span className="text-surface-700">Year Built</span>
                  </div>
                  <span className="font-medium text-surface-900">{property.yearBuilt}</span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Clock" size={18} className="text-surface-500" />
                    <span className="text-surface-700">Listed</span>
                  </div>
                  <span className="font-medium text-surface-900">
                    {formatDate(property.listingDate)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Contact Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface rounded-lg p-6 shadow-card"
            >
              <h3 className="font-display text-xl font-semibold text-primary mb-4">
                Interested in this property?
              </h3>
              
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  icon="Phone"
                  onClick={() => toast.success('Contact feature coming soon!')}
                >
                  Schedule a Tour
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  icon="Mail"
                  onClick={() => toast.success('Contact feature coming soon!')}
                >
                  Contact Agent
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full"
                  icon="Share"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: property.title,
                        text: `Check out this property: ${property.title}`,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard!');
                    }
                  }}
                >
                  Share Property
                </Button>
              </div>
            </motion.div>

            {/* Location Info */}
            {property.coordinates && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-surface rounded-lg p-6 shadow-card"
              >
                <h3 className="font-display text-xl font-semibold text-primary mb-4">
                  Location
                </h3>
                
                <div className="aspect-video bg-surface-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ApperIcon name="MapPin" className="w-12 h-12 text-surface-400 mx-auto" />
                    <p className="mt-2 text-surface-600 text-sm">Interactive map view</p>
                    <p className="text-xs text-surface-500 break-words">
                      {property.address?.city}, {property.address?.state}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  icon="Map"
                  onClick={() => navigate('/map')}
                >
                  View on Map
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;