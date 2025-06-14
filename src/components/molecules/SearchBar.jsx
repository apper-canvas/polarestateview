import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';

const SearchBar = ({ onSearch, placeholder = "Search by city, state, or address...", className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions] = useState([
    'San Francisco, CA',
    'Portland, OR',
    'Miami, FL',
    'Scottsdale, AZ',
    'Austin, TX'
  ]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, suggestions]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm);
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            icon="Search"
            className="w-full"
          />
          
          {/* Search Suggestions */}
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 bg-white border border-surface-200 rounded-md shadow-lg z-10 mt-1 max-w-full overflow-hidden"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-surface-50 transition-colors border-b border-surface-100 last:border-b-0 break-words"
                >
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="MapPin" size={16} className="text-surface-400 flex-shrink-0" />
                    <span className="text-surface-700">{suggestion}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
        
        <Button 
          onClick={handleSearch}
          icon="Search"
          className="flex-shrink-0"
        >
          Search
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;