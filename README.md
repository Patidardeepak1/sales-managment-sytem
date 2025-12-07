# Sales Management System - TruEstate Assignment

## Overview

A comprehensive Retail Sales Management System built with MERN stack that provides advanced search, filtering, sorting, and pagination capabilities for managing sales transactions. The system efficiently handles large datasets and provides real-time summary statistics.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **HTTP Client**: Axios

## Search Implementation Summary

The search functionality is implemented as a case-insensitive full-text search across Customer Name and Phone Number fields. The search uses MongoDB's regex query with case-insensitive option (`$regex` with `$options: 'i'`). The search works seamlessly alongside filters and sorting, maintaining state across pagination.

## Filter Implementation Summary

Multi-select filters are implemented for Customer Region, Gender, Product Category, Tags, and Payment Method. Range-based filters are provided for Age Range and Date Range. All filters work independently and in combination, with state preserved during search, sorting, and pagination operations. Filter options are dynamically loaded from the database to ensure accuracy.

## Sorting Implementation Summary

Sorting is implemented for three fields:
- Date (Newest First - default)
- Quantity (Ascending/Descending)
- Customer Name (A-Z)

Sorting preserves active search and filter states. The backend uses MongoDB's sort functionality with appropriate indexes for optimal performance.

## Pagination Implementation Summary

Pagination is implemented with a fixed page size of 10 items per page. The pagination component displays page numbers with ellipsis for large datasets, Previous/Next navigation buttons, and maintains all active search, filter, and sort states when navigating between pages.

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd trustate
```

2. Install dependencies for root, server, and client:
```bash
npm run install-all
```

3. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Update MongoDB connection string if needed:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/trustate_sales
     NODE_ENV=development
     ```

4. Start MongoDB (if using local installation):
```bash
mongod
```

5. Import sales data:
   - Download the dataset from the provided Google Drive link
   - Convert the data to JSON format if needed
   - Use the import endpoint or a script to load data:
```bash
# Using curl or Postman, POST to http://localhost:5000/api/sales/import
# with the JSON array in the request body
```

6. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Production Build

To build the frontend for production:
```bash
npm run build
```

The built files will be in `frontend/dist/`.

### Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Use the search bar to search by customer name or phone number
3. Apply filters using the filter panel
4. Change sorting using the dropdown
5. Navigate through pages using pagination controls
6. View summary statistics in the summary cards

