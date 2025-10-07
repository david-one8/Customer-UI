import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CustomerTable } from './components/CustomerTable';
import { SearchBar } from './components/SearchBar';
import { FiltersDropdown } from './components/FiltersDropdown';
import { ThemeToggle } from './components/ThemeToggle';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useTheme } from './hooks/useTheme';
import { useDebounce } from './hooks/useDebounce';
import './styles/index.css';

const TOTAL_RECORDS = 1000000;
const PAGE_SIZE = 30;

// Pre-defined data for fast generation
const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'];

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788', '#F06292', '#7986CB', '#4DB6AC', '#FFB74D', '#A1887F', '#90A4AE', '#EF5350', '#AB47BC', '#5C6BC0', '#26A69A'];

// Generate single customer
function generateCustomer(id) {
  const firstNameIndex = id % firstNames.length;
  const lastNameIndex = Math.floor(id / firstNames.length) % lastNames.length;
  const firstName = firstNames[firstNameIndex];
  const lastName = lastNames[lastNameIndex];
  const name = `${firstName} ${lastName}`;
  
  return {
    id,
    name,
    phone: `+91${String(9000000000 + (id % 1000000000)).padStart(10, '0')}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${id}@doubletick.com`,
    score: (id * 17) % 100,
    lastMessageAt: new Date(Date.now() - ((id % 30) * 24 * 60 * 60 * 1000)).toISOString(),
    addedBy: `${firstNames[(id + 13) % firstNames.length]} ${lastNames[(id + 7) % lastNames.length]}`,
    avatar: {
      initials: firstName[0] + lastName[0],
      color: colors[id % colors.length]
    }
  };
}

// Initialize in-memory data store with progress callback
function initializeDataStore(onProgress) {
  console.time('Data Generation');
  const dataStore = new Map();
  const batchSize = 100000; // Update progress every 100k records
  
  for (let i = 1; i <= TOTAL_RECORDS; i++) {
    dataStore.set(i, generateCustomer(i));
    
    // Report progress every batch
    if (i % batchSize === 0) {
      const progress = (i / TOTAL_RECORDS * 100).toFixed(0);
      onProgress?.(progress);
    }
  }
  
  console.timeEnd('Data Generation');
  console.log(`✓ Generated ${TOTAL_RECORDS.toLocaleString()} records in memory`);
  
  return dataStore;
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const [dataStore, setDataStore] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initProgress, setInitProgress] = useState(0); // Progress state
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  const debouncedSearch = useDebounce(searchTerm, 250);

  // Initialize data store on mount (runs once)
  useEffect(() => {
    // Use setTimeout to prevent blocking initial render
    setTimeout(() => {
      const store = initializeDataStore((progress) => {
        console.log(`Progress: ${progress}%`);
        setInitProgress(parseInt(progress)); // Update progress state
      });
      setDataStore(store);
      setIsInitializing(false);
    }, 100);
  }, []);

  // Get filtered and sorted data
  const filteredData = useMemo(() => {
    if (!dataStore) return [];
    
    let data = Array.from(dataStore.values());
    
    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      data = data.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(debouncedSearch)
      );
    }
    
    // Apply sorting
    data.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    
    return data;
  }, [dataStore, debouncedSearch, sortField, sortOrder]);

  // Load customers (pagination)
  const loadCustomers = useCallback((page, reset = false) => {
    setLoading(true);
    
    // Simulate slight delay for UX
    setTimeout(() => {
      const start = page * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const pageData = filteredData.slice(start, end);
      
      if (reset) {
        setCustomers(pageData);
      } else {
        setCustomers(prev => [...prev, ...pageData]);
      }
      
      setHasMore(end < filteredData.length);
      setLoading(false);
    }, 50);
  }, [filteredData]);

  // Reset pagination when search/sort changes
  useEffect(() => {
    if (!isInitializing && dataStore) {
      setCurrentPage(0);
      loadCustomers(0, true);
    }
  }, [filteredData, isInitializing, dataStore]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadCustomers(nextPage);
    }
  }, [currentPage, hasMore, loading, loadCustomers]);

  // Sort handler
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField]);

  if (isInitializing) {
    return (
      <div className="app-container">
        <LoadingSpinner 
          progress={initProgress}
          message="Loading 1 million customers into memory..."
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/Doubletick-Logo.png" alt="DoubleTick Logo" className="logo" />
          </div>
          <div className="customer-count">
            {TOTAL_RECORDS.toLocaleString()} Customers
          </div>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="controls-bar">
          <SearchBar 
            value={searchTerm} 
            onChange={setSearchTerm}
          />
          <FiltersDropdown />
        </div>

        <CustomerTable
          customers={customers}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loading={loading}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />
      </main>
    </div>
  );
}

export default App;
