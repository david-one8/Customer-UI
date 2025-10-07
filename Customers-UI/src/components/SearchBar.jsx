import React from 'react';

/**
 * Search bar component with icon
 */
export function SearchBar({ value, onChange, placeholder = "Search by name, email, or phone..." }) {
  return (
    <div className="search-container">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search customers"
      />
    </div>
  );
}
