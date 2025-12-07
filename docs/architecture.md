# Architecture Document

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Port**: 5000 (configurable via environment variables)

### Folder Structure
```
backend/
├── index.js              # Entry point, server setup, MongoDB connection
├── models/
│   └── Sales.js          # Mongoose schema and model for sales data
├── routes/
│   └── salesRoutes.js    # API routes for sales operations
└── package.json          # Dependencies and scripts
```

### Module Responsibilities

#### `server/index.js`
- Initializes Express application
- Configures middleware (CORS, JSON parsing)
- Establishes MongoDB connection
- Registers API routes
- Starts HTTP server

#### `server/models/Sales.js`
- Defines Mongoose schema for sales transactions
- Includes all required fields: customer, product, sales, and operational fields
- Creates indexes for performance optimization:
  - Text indexes for search (customerName, phoneNumber)
  - Single field indexes for filtering
  - Compound indexes for sorting
- Exports Sales model for use in routes

#### `server/routes/salesRoutes.js`
- **GET `/api/sales`**: Main endpoint for fetching sales with search, filter, sort, and pagination
  - Accepts query parameters for all filter types
  - Builds dynamic MongoDB query based on parameters
  - Executes query with sorting and pagination
  - Calculates summary statistics using aggregation
  - Returns sales data, pagination info, and summary
  
- **GET `/api/sales/filters`**: Returns unique filter options
  - Aggregates distinct values for all filter fields
  - Returns age range (min/max) using aggregation
  
- **POST `/api/sales/import`**: Imports sales data
  - Accepts array of sales objects
  - Transforms data to match schema
  - Bulk inserts into database

### Data Flow

1. **Request Flow**:
   - Client sends HTTP request with query parameters
   - Express middleware processes request
   - Route handler builds MongoDB query
   - Mongoose executes query with indexes
   - Results are transformed and sent to client

2. **Query Building**:
   - Search: Uses `$or` with regex for customerName and phoneNumber
   - Filters: Uses `$in` for multi-select, `$gte`/`$lte` for ranges
   - Sorting: Uses MongoDB sort with appropriate field and order
   - Pagination: Uses `skip` and `limit` for page-based pagination

3. **Performance Optimizations**:
   - Database indexes on frequently queried fields
   - Parallel queries using `Promise.all` for summary statistics
   - Lean queries for faster JSON serialization

## Frontend Architecture

### Technology Stack
- **Build Tool**: Vite
- **Framework**: React 18 with functional components and hooks
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Port**: 3000 (development)

### Folder Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx         # Search input component
│   │   ├── FilterPanel.jsx        # Multi-select and range filters
│   │   ├── SortDropdown.jsx      # Sorting dropdown
│   │   ├── SummaryCards.jsx      # Summary statistics display
│   │   ├── SalesTable.jsx        # Data table component
│   │   └── Pagination.jsx        # Pagination controls
│   ├── services/
│   │   └── api.js                # API service layer
│   ├── App.jsx                    # Main application component
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles and Tailwind imports
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── package.json                   # Dependencies and scripts
```

### Module Responsibilities

#### `frontend/src/App.jsx`
- Main application component managing global state
- State management for:
  - Sales data
  - Filters (search, all filter types)
  - Sorting (field and order)
  - Pagination (current page)
  - Summary statistics
  - Filter options
- Coordinates data fetching based on state changes
- Handles user interactions and state updates

#### `frontend/src/services/api.js`
- Centralized API service layer
- Uses Axios for HTTP requests
- Functions:
  - `fetchSales(params)`: Fetches sales with all query parameters
  - `fetchFilterOptions()`: Fetches available filter values
  - `importSalesData(data)`: Imports sales data

#### Component Hierarchy
```
App
├── SearchBar
├── SortDropdown
├── FilterPanel
│   ├── Multi-select filters (Region, Gender, Category, Tags, Payment)
│   ├── Range filters (Age, Date)
│   └── Clear filters button
├── SummaryCards
│   ├── Total Units Sold
│   ├── Total Amount
│   └── Total Discount
├── SalesTable
└── Pagination
```

### Data Flow

1. **Initial Load**:
   - App component mounts
   - Fetches filter options
   - Fetches initial sales data with default parameters

2. **User Interaction Flow**:
   - User interacts with search/filter/sort/pagination
   - Component updates local state
   - `useEffect` hook detects state change
   - API service makes request with updated parameters
   - Backend processes request and returns data
   - Component updates with new data

3. **State Management**:
   - All state managed in App component using React hooks
   - State changes trigger data refetch
   - Pagination resets to page 1 on filter/search/sort changes
   - State persists across pagination navigation

4. **Performance Considerations**:
   - Debounced search (can be added for optimization)
   - Efficient re-renders using React hooks
   - Conditional rendering based on loading/error states
   - Responsive design with Tailwind CSS

## Data Flow Diagram

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │ HTTP Request (query params)
       ▼
┌─────────────┐
│   Express   │
│   Server    │
└──────┬──────┘
       │ Query Building
       ▼
┌─────────────┐
│  MongoDB    │
│  Database   │
└──────┬──────┘
       │ Query Results
       ▼
┌─────────────┐
│   Express   │
│   Server    │
└──────┬──────┘
       │ JSON Response
       ▼
┌─────────────┐
│   Client    │
│  (React)    │
└─────────────┘
```

## Key Design Decisions

1. **Single Repository Structure**: Both frontend and backend in one repository for easier deployment and version control

2. **RESTful API Design**: Clean separation between frontend and backend using REST principles

3. **MongoDB Indexes**: Strategic indexing for optimal query performance on large datasets

4. **Component-Based Architecture**: Modular React components for maintainability and reusability

5. **State Management**: React hooks for state management without external libraries, keeping the solution lightweight

6. **Responsive Design**: Tailwind CSS for modern, responsive UI that works on all devices

7. **Error Handling**: Comprehensive error handling at both API and component levels

8. **Edge Case Handling**: Proper handling of empty results, invalid filters, and missing data

