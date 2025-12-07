import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SalesTable from './components/SalesTable';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import SummaryCards from './components/SummaryCards';
import SortDropdown from './components/SortDropdown';
import Pagination from './components/Pagination';
import { fetchSales, fetchFilterOptions } from './services/api';
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    customerRegion: [],
    gender: [],
    ageRange: { min: '', max: '' },
    productCategory: [],
    tags: [],
    paymentMethod: [],
    dateRange: { from: '', to: '' },
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [summary, setSummary] = useState({
    totalUnitsSold: 0,
    totalAmount: 0,
    totalDiscount: 0,
    totalTransactions: 0,
  });
  const [filterOptions, setFilterOptions] = useState({
    customerRegions: [],
    genders: [],
    productCategories: [],
    tags: [],
    paymentMethods: [],
    ageRange: { minAge: 0, maxAge: 100 },
  });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadSales();
  }, [filters, sortBy, sortOrder, currentPage]);

  const loadFilterOptions = async () => {
    try {
      const data = await fetchFilterOptions();
      setFilterOptions(data);
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  const loadSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: filters.search,
        customerRegion: filters.customerRegion.join(','),
        gender: filters.gender.join(','),
        ageMin: filters.ageRange.min || '',
        ageMax: filters.ageRange.max || '',
        productCategory: filters.productCategory.join(','),
        tags: filters.tags.join(','),
        paymentMethod: filters.paymentMethod.join(','),
        dateFrom: filters.dateRange.from || '',
        dateTo: filters.dateRange.to || '',
        sortBy,
        sortOrder,
        page: currentPage,
        limit: 10,
      };

      const data = await fetchSales(params);
      setSales(data.sales || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      });
      setSummary(data.summary || {
        totalUnitsSold: 0,
        totalAmount: 0,
        totalDiscount: 0,
        totalTransactions: 0,
      });
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError('Backend server is not running. Please start the backend server on port 5000.');
      } else {
        setError(err.message || 'Failed to load sales data');
      }
      console.error('Error loading sales:', err);
      // Set empty data on error
      setSales([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      });
      setSummary({
        totalUnitsSold: 0,
        totalAmount: 0,
        totalDiscount: 0,
        totalTransactions: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (filterType === 'ageRange' || filterType === 'dateRange') {
        newFilters[filterType] = { ...prev[filterType], ...value };
      } else {
        newFilters[filterType] = value;
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      customerRegion: [],
      gender: [],
      ageRange: { min: '', max: '' },
      productCategory: [],
      tags: [],
      paymentMethod: [],
      dateRange: { from: '', to: '' },
    });
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      <Sidebar />
      <div className="flex-1 ml-64 w-full">
        <Routes>
          <Route path="/invoices/proforma" element={
            <div className="p-6 w-full">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                  Sales Management System
                </h1>
                <div className="w-80">
                  <SearchBar onSearch={handleSearch} searchValue={filters.search} />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <FilterPanel
                    filters={filters}
                    filterOptions={filterOptions}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                  />
                  <SortDropdown
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                  />
                </div>
              </div>

              <div className="mb-6">
                <SummaryCards summary={summary} />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  <p className="mt-4 text-gray-600">Loading sales data...</p>
                </div>
              ) : sales.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-gray-600 text-lg">No sales data found</p>
                  <p className="text-gray-500 mt-2">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <>
                  <SalesTable sales={sales} />
                  <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </div>
          } />
          <Route path="/" element={<Navigate to="/invoices/proforma" />} />
          <Route path={"*"} element={<div className="p-12 text-center text-gray-400 text-2xl font-semibold">Page not found</div>} />
          {/* All other routes receive a dummy placeholder */}
          <Route path="/dashboard" element={<div className="p-12 text-center text-gray-600 text-xl font-medium">Dashboard Placeholder</div>} />
          <Route path="/nexus" element={<div className="p-12 text-center text-gray-600 text-xl font-medium">Nexus Placeholder</div>} />
          <Route path="/intake" element={<div className="p-12 text-center text-gray-600 text-xl font-medium">Intake Placeholder</div>} />
          <Route path="/services/pre-active" element={<div className="p-12 text-center text-gray-600 text-xl font-medium">Pre-active Placeholder</div>} />
          <Route path="/services/active" element={<div className="p-12 text-center text-gray-600 text-xl font-medium">Active Placeholder</div>} />
          <Route path="/services/blocked" element={<div className="p-12 text-center text-gray-600 text-xl font-medium">Blocked Placeholder</div>} />
          <Route path="/services/closed" element={<div className="p-12 text-center text-gray-600 text-xl font-medium">Closed Placeholder</div>} />
          <Route path="/invoices/final" element={<div className="p-12 text-center text-gray-600 text-xl font-medium">Final Invoices Placeholder</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

