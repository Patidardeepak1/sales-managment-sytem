# Data Format Guide

## Expected JSON Data Format

The sales data should be provided as a JSON array. Each object in the array should contain the following fields:

### Customer Fields
- `Customer ID` or `customerId` (String, required)
- `Customer Name` or `customerName` (String, required)
- `Phone Number` or `phoneNumber` (String, required)
- `Gender` or `gender` (String, required)
- `Age` or `age` (Number, required)
- `Customer Region` or `customerRegion` (String, required)
- `Customer Type` or `customerType` (String, optional)

### Product Fields
- `Product ID` or `productId` (String, required)
- `Product Name` or `productName` (String, required)
- `Brand` or `brand` (String, optional)
- `Product Category` or `productCategory` (String, required)
- `Tags` or `tags` (Array of Strings or comma-separated string, optional)

### Sales Fields
- `Quantity` or `quantity` (Number, required)
- `Price per Unit` or `pricePerUnit` (Number, required)
- `Discount Percentage` or `discountPercentage` (Number, default: 0)
- `Total Amount` or `totalAmount` (Number, required)
- `Final Amount` or `finalAmount` (Number, required)

### Operational Fields
- `Date` or `date` (Date string or Date object, required)
- `Payment Method` or `paymentMethod` (String, required)
- `Order Status` or `orderStatus` (String, optional)
- `Delivery Type` or `deliveryType` (String, optional)
- `Store ID` or `storeId` (String, optional)
- `Store Location` or `storeLocation` (String, optional)
- `Salesperson ID` or `salespersonId` (String, optional)
- `Employee Name` or `employeeName` (String, optional)

## Example JSON Structure

```json
[
  {
    "Customer ID": "CUST12016",
    "Customer Name": "Neha Yadav",
    "Phone Number": "+91 9123456789",
    "Gender": "Female",
    "Age": 25,
    "Customer Region": "South",
    "Customer Type": "Regular",
    "Product ID": "PROD0001",
    "Product Name": "T-Shirt",
    "Brand": "BrandX",
    "Product Category": "Clothing",
    "Tags": ["Summer", "Casual"],
    "Quantity": 1,
    "Price per Unit": 1000,
    "Discount Percentage": 10,
    "Total Amount": 1000,
    "Final Amount": 900,
    "Date": "2023-09-26",
    "Payment Method": "Credit Card",
    "Order Status": "Completed",
    "Delivery Type": "Standard",
    "Store ID": "STORE001",
    "Store Location": "Mumbai",
    "Salesperson ID": "SP001",
    "Employee Name": "Harsh Agrawal"
  }
]
```

## Converting CSV/Excel to JSON

If your data is in CSV or Excel format, you can use online converters or scripts:

### Using Python (pandas)
```python
import pandas as pd
import json

# Read CSV
df = pd.read_csv('sales_data.csv')

# Convert to JSON
df.to_json('sales_data.json', orient='records', date_format='iso')
```

### Using Node.js (csvtojson)
```bash
npm install -g csvtojson
csvtojson sales_data.csv > sales_data.json
```

## Notes

- The import script automatically handles both naming conventions (with spaces and camelCase)
- Date fields can be in ISO format (YYYY-MM-DD) or any valid date string
- Tags can be provided as an array or comma-separated string
- Missing optional fields will be set to null or default values
- The import process validates and transforms data automatically

