import { useState, useRef, useEffect } from 'react';

const FilterDropdown = ({ label, options, selectedValues, onSelect, placeholder, isRange = false, rangeValue = null, onRangeChange = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = (value) => {
    if (isRange) {
      // For range filters, handle differently
      return;
    }
    const currentValues = selectedValues || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    onSelect(newValues);
  };

  const getDisplayText = () => {
    if (isRange && rangeValue) {
      if (rangeValue.min && rangeValue.max) {
        return `${rangeValue.min} - ${rangeValue.max}`;
      } else if (rangeValue.min) {
        return `Min: ${rangeValue.min}`;
      } else if (rangeValue.max) {
        return `Max: ${rangeValue.max}`;
      }
    }
    
    if (!selectedValues || selectedValues.length === 0) {
      return placeholder || label;
    }
    
    if (selectedValues.length === 1) {
      return selectedValues[0];
    }
    
    return `${selectedValues.length} selected`;
  };

  const hasSelection = () => {
    if (isRange) {
      return rangeValue && (rangeValue.min || rangeValue.max);
    }
    return selectedValues && selectedValues.length > 0;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
          hasSelection()
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span>{getDisplayText()}</span>
        <svg
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
          {isRange ? (
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Min
                  </label>
                  <input
                    type="number"
                    value={rangeValue?.min || ''}
                    onChange={(e) => onRangeChange({ ...rangeValue, min: e.target.value })}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Max
                  </label>
                  <input
                    type="number"
                    value={rangeValue?.max || ''}
                    onChange={(e) => onRangeChange({ ...rangeValue, max: e.target.value })}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    onRangeChange({ min: '', max: '' });
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="py-2">
              {options && options.length > 0 ? (
                <>
                  {options.map((option) => {
                    const isSelected = selectedValues?.includes(option);
                    return (
                      <label
                        key={option}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggle(option)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">{option}</span>
                      </label>
                    );
                  })}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={() => {
                        onSelect([]);
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                    >
                      Clear all
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No options available</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DateRangeDropdown = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDateRange = (type, value) => {
    onFilterChange('dateRange', {
      ...filters.dateRange,
      [type]: value,
    });
  };

  const getDisplayText = () => {
    if (filters.dateRange.from && filters.dateRange.to) {
      return `${filters.dateRange.from} to ${filters.dateRange.to}`;
    } else if (filters.dateRange.from) {
      return `From: ${filters.dateRange.from}`;
    } else if (filters.dateRange.to) {
      return `To: ${filters.dateRange.to}`;
    }
    return 'Date';
  };

  const hasSelection = filters.dateRange.from || filters.dateRange.to;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
          hasSelection
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span>{getDisplayText()}</span>
        <svg
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateRange.from || ''}
                onChange={(e) => handleDateRange('from', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateRange.to || ''}
                onChange={(e) => handleDateRange('to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => {
                onFilterChange('dateRange', { from: '', to: '' });
                setIsOpen(false);
              }}
              className="w-full px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterPanel = ({ filters, filterOptions, onFilterChange, onClearFilters }) => {
  const hasActiveFilters = () => {
    return (
      filters.customerRegion.length > 0 ||
      filters.gender.length > 0 ||
      filters.ageRange.min ||
      filters.ageRange.max ||
      filters.productCategory.length > 0 ||
      filters.tags.length > 0 ||
      filters.paymentMethod.length > 0 ||
      filters.dateRange.from ||
      filters.dateRange.to
    );
  };

  const handleDateRange = (type, value) => {
    onFilterChange('dateRange', {
      ...filters.dateRange,
      [type]: value,
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
        {/* Refresh/Clear Button */}
        {hasActiveFilters() && (
          <button
            onClick={onClearFilters}
            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            title="Clear all filters"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}

        {/* Customer Region */}
        <FilterDropdown
          label="Customer Region"
          placeholder="Customer Region"
          options={filterOptions.customerRegions || []}
          selectedValues={filters.customerRegion}
          onSelect={(values) => onFilterChange('customerRegion', values)}
        />

        {/* Gender */}
        <FilterDropdown
          label="Gender"
          placeholder="Gender"
          options={filterOptions.genders || []}
          selectedValues={filters.gender}
          onSelect={(values) => onFilterChange('gender', values)}
        />

        {/* Age Range */}
        <FilterDropdown
          label="Age Range"
          placeholder="Age Range"
          isRange={true}
          rangeValue={filters.ageRange}
          onRangeChange={(value) => onFilterChange('ageRange', value)}
        />

        {/* Product Category */}
        <FilterDropdown
          label="Product Category"
          placeholder="Product Category"
          options={filterOptions.productCategories || []}
          selectedValues={filters.productCategory}
          onSelect={(values) => onFilterChange('productCategory', values)}
        />

        {/* Tags */}
        <FilterDropdown
          label="Tags"
          placeholder="Tags"
          options={filterOptions.tags || []}
          selectedValues={filters.tags}
          onSelect={(values) => onFilterChange('tags', values)}
        />

        {/* Payment Method */}
        <FilterDropdown
          label="Payment Method"
          placeholder="Payment Method"
          options={filterOptions.paymentMethods || []}
          selectedValues={filters.paymentMethod}
          onSelect={(values) => onFilterChange('paymentMethod', values)}
        />

        {/* Date Range */}
        <DateRangeDropdown
          filters={filters}
          onFilterChange={onFilterChange}
        />
    </div>
  );
};

export default FilterPanel;
