import React, { useState, useRef, useEffect } from 'react';

/**
 * Filters dropdown component (dummy implementation)
 */
export function FiltersDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dummyFilters = ['Filter 1', 'Filter 2', 'Filter 3', 'Filter 4'];

  return (
    <div className="filters-container" ref={dropdownRef}>
      <button 
        className="filters-button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle filters"
        aria-expanded={isOpen}
      >
        <span className="filter-icon">⚙️</span>
        <span>Add Filters</span>
      </button>
      
      {isOpen && (
        <div className="filters-dropdown">
          {dummyFilters.map((filter, index) => (
            <div key={index} className="filter-option">
              {filter}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
