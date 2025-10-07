import React, { useState, useEffect, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

/**
 * Main customer table component with virtualization
 */
export function CustomerTable({ customers, onLoadMore, hasMore, loading, onSort, sortField, sortOrder }) {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const loadMoreRef = useInfiniteScroll(onLoadMore, hasMore, loading);

  const handleSelectAll = useCallback((e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(customers.map(c => c.id)));
    } else {
      setSelectedRows(new Set());
    }
  }, [customers]);

  const handleSelectRow = useCallback((id) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <span className="sort-icon">⇅</span>;
    }
    return (
      <span className={`sort-icon active`}>
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // Table row component
  const Row = ({ index, style }) => {
    const customer = customers[index];
    if (!customer) return null;

    return (
      <div className="table-row" style={style}>
        <div className="table-cell">
          <input
            type="checkbox"
            className="checkbox-input"
            checked={selectedRows.has(customer.id)}
            onChange={() => handleSelectRow(customer.id)}
            aria-label={`Select ${customer.name}`}
          />
        </div>
        <div className="table-cell">
          <div 
            className="customer-avatar" 
            style={{ backgroundColor: customer.avatar.color }}
          >
            {customer.avatar.initials}
          </div>
        </div>
        <div className="table-cell">
          <div className="customer-info">
            <span className="customer-name">{customer.name}</span>
            <span className="customer-phone">{customer.phone}</span>
          </div>
        </div>
        <div className="table-cell">{customer.id}</div>
        <div className="table-cell">{customer.email}</div>
        <div className="table-cell">
          <span className={`score-badge ${getScoreClass(customer.score)}`}>
            {customer.score}
          </span>
        </div>
        <div className="table-cell">{formatDate(customer.lastMessageAt)}</div>
        <div className="table-cell">{customer.addedBy}</div>
      </div>
    );
  };

  return (
    <div className="table-container">
      {/* Table Header */}
      <div className="table-header">
        <div className="table-header-cell">
          <input
            type="checkbox"
            className="checkbox-input"
            checked={customers.length > 0 && selectedRows.size === customers.length}
            onChange={handleSelectAll}
            aria-label="Select all customers"
          />
        </div>
        <div className="table-header-cell">Avatar</div>
        <div className="table-header-cell" onClick={() => onSort('name')}>
          Customer <SortIcon field="name" />
        </div>
        <div className="table-header-cell" onClick={() => onSort('id')}>
          ID <SortIcon field="id" />
        </div>
        <div className="table-header-cell" onClick={() => onSort('email')}>
          Email <SortIcon field="email" />
        </div>
        <div className="table-header-cell" onClick={() => onSort('score')}>
          Score <SortIcon field="score" />
        </div>
        <div className="table-header-cell" onClick={() => onSort('lastMessageAt')}>
          Last Message <SortIcon field="lastMessageAt" />
        </div>
        <div className="table-header-cell" onClick={() => onSort('addedBy')}>
          Added By <SortIcon field="addedBy" />
        </div>
      </div>

      {/* Table Body with Virtualization */}
      {customers.length > 0 ? (
        <>
          <List
            height={600}
            itemCount={customers.length}
            itemSize={73}
            width="100%"
          >
            {Row}
          </List>

          {/* Load More Indicator */}
          <div ref={loadMoreRef}>
            {loading && (
              <div className="load-more-indicator">
                <div className="load-more-spinner"></div>
                <span>Loading more customers...</span>
              </div>
            )}
            {!hasMore && customers.length > 0 && (
              <div className="load-more-indicator">
                <span>All customers loaded ({customers.length} total)</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No customers found</div>
          <div className="empty-description">
            Try adjusting your search criteria
          </div>
        </div>
      )}
    </div>
  );
}
