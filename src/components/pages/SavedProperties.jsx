import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '@/components/molecules/PropertyCard';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { savedPropertyService, propertyService } from '@/services';

const SavedProperties = () => {
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [selectedProperties, setSelectedProperties] = useState(new Set());
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    loadSavedProperties();
  }, []);

  const loadSavedProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const savedResult = await savedPropertyService.getAll();
      setSavedProperties(savedResult);
      
      // Load full property details for each saved property
      const propertyPromises = savedResult.map(saved => 
        propertyService.getById(saved.propertyId)
      );
      
      const propertyResults = await Promise.allSettled(propertyPromises);
      const validProperties = propertyResults
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      setProperties(validProperties);
    } catch (err) {
      setError(err.message || 'Failed to load saved properties');
      toast.error('Failed to load saved properties');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProperty = async (propertyId) => {
    try {
      await savedPropertyService.deleteByPropertyId(propertyId);
      setSavedProperties(prev => prev.filter(sp => sp.propertyId !== propertyId));
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      setSelectedProperties(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
      toast.success('Property removed from saved list');
    } catch (error) {
      console.error('Error removing property:', error);
      toast.error('Failed to remove property');
    }
  };

  const handleEditNotes = (savedProperty) => {
    setEditingNotes(savedProperty.id);
    setNoteText(savedProperty.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!editingNotes) return;
    
    try {
      await savedPropertyService.update(editingNotes, { notes: noteText });
      setSavedProperties(prev => 
        prev.map(sp => 
          sp.id === editingNotes 
            ? { ...sp, notes: noteText }
            : sp
        )
      );
      setEditingNotes(null);
      setNoteText('');
      toast.success('Notes updated successfully');
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    }
  };

  const handleCancelEdit = () => {
    setEditingNotes(null);
    setNoteText('');
  };

  const handlePropertySelect = (propertyId) => {
    setSelectedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const handleCompareProperties = () => {
    if (selectedProperties.size < 2) {
      toast.warning('Select at least 2 properties to compare');
      return;
    }
    setIsComparing(true);
  };

  const handleClearSelection = () => {
    setSelectedProperties(new Set());
    setIsComparing(false);
  };

  const getSavedPropertyById = (propertyId) => {
    return savedProperties.find(sp => sp.propertyId === propertyId);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

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
        <div className="h-16 bg-surface-200 rounded animate-pulse" />
      </div>
    </motion.div>
  );

  const EmptyState = () => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-12"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <ApperIcon name="Heart" className="w-16 h-16 text-surface-300 mx-auto" />
      </motion.div>
      <h3 className="mt-4 text-lg font-medium text-surface-900">No saved properties yet</h3>
      <p className="mt-2 text-surface-500">Start browsing and save properties you're interested in</p>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4"
      >
        <Button onClick={() => navigate('/')}>
          Browse Properties
        </Button>
      </motion.div>
    </motion.div>
  );

  const ComparisonView = () => {
    const selectedProps = properties.filter(p => selectedProperties.has(p.id));
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-lg p-6 mt-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-semibold text-primary">
            Property Comparison
          </h3>
          <Button
            variant="ghost"
            size="sm"
            icon="X"
            onClick={() => setIsComparing(false)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="text-left p-3 font-medium text-surface-700">Feature</th>
                {selectedProps.map(property => (
                  <th key={property.id} className="text-left p-3 min-w-48">
                    <div className="font-display font-semibold text-primary line-clamp-2 break-words">
                      {property.title}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-surface-100">
                <td className="p-3 font-medium text-surface-700">Price</td>
                {selectedProps.map(property => (
                  <td key={property.id} className="p-3 font-semibold text-accent">
                    ${property.price?.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-surface-100">
                <td className="p-3 font-medium text-surface-700">Bedrooms</td>
                {selectedProps.map(property => (
                  <td key={property.id} className="p-3">{property.bedrooms}</td>
                ))}
              </tr>
              <tr className="border-b border-surface-100">
                <td className="p-3 font-medium text-surface-700">Bathrooms</td>
                {selectedProps.map(property => (
                  <td key={property.id} className="p-3">{property.bathrooms}</td>
                ))}
              </tr>
              <tr className="border-b border-surface-100">
                <td className="p-3 font-medium text-surface-700">Square Feet</td>
                {selectedProps.map(property => (
                  <td key={property.id} className="p-3">
                    {property.squareFeet?.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-surface-100">
                <td className="p-3 font-medium text-surface-700">Property Type</td>
                {selectedProps.map(property => (
                  <td key={property.id} className="p-3">{property.propertyType}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-surface-700">Year Built</td>
                {selectedProps.map(property => (
                  <td key={property.id} className="p-3">{property.yearBuilt}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <div className="container mx-auto px-4 py-6 max-w-full">
          {/* Header Skeleton */}
          <div className="mb-6 space-y-2">
            <div className="h-8 bg-surface-200 rounded animate-pulse w-48" />
            <div className="h-4 bg-surface-200 rounded animate-pulse w-64" />
          </div>
          
          {/* Grid Skeleton */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <SkeletonCard key={index} index={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && properties.length === 0) {
    return (
      <div className="min-h-full bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-surface-900">Failed to load saved properties</h3>
            <p className="mt-2 text-surface-500">{error}</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4"
            >
              <Button onClick={loadSavedProperties}>
                Try Again
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="min-h-full bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold text-primary mb-2">
              Saved Properties
            </h1>
            <p className="text-surface-600">
              Your personal collection of favorite properties
            </p>
          </div>
          <EmptyState />
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
            Saved Properties
          </h1>
          <p className="text-surface-600">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} in your saved list
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {selectedProperties.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-surface-600">
                  {selectedProperties.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCompareProperties}
                  disabled={selectedProperties.size < 2}
                >
                  Compare ({selectedProperties.size})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-sm text-surface-500">
            Click properties to select for comparison
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property, index) => {
            const savedProperty = getSavedPropertyById(property.id);
            const isSelected = selectedProperties.has(property.id);
            
            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-accent ring-offset-2' : ''
                }`}
                onClick={() => handlePropertySelect(property.id)}
              >
                <PropertyCard property={property} index={index} />
                
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 left-2 bg-accent text-white rounded-full p-1 z-10">
                    <ApperIcon name="Check" size={14} />
                  </div>
                )}
                
                {/* Saved Info Card */}
                <div className="mt-3 bg-surface-50 rounded-lg p-3 border border-surface-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-surface-500">
                      Saved on {formatDate(savedProperty?.savedDate)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Trash2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveProperty(property.id);
                      }}
                      className="text-error hover:text-error p-1"
                    />
                  </div>
                  
                  {/* Notes Section */}
                  {editingNotes === savedProperty?.id ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Add your notes..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="text-sm"
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveNotes();
                          }}
                          className="text-xs"
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditNotes(savedProperty);
                      }}
                    >
                      {savedProperty?.notes ? (
                        <p className="text-sm text-surface-700 break-words">
                          {savedProperty.notes}
                        </p>
                      ) : (
                        <p className="text-sm text-surface-500 italic">
                          Click to add notes...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison View */}
        <AnimatePresence>
          {isComparing && <ComparisonView />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SavedProperties;