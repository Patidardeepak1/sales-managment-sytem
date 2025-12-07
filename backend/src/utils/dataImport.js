import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Sales from '../models/Sales.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import { createReadStream } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transformRecord = (item) => {
  // Transform data to match schema
  let dateValue = item.Date || item.date || item['Transaction Date'];
  if (typeof dateValue === 'string') {
    dateValue = new Date(dateValue);
    if (isNaN(dateValue.getTime())) {
      return null; // Invalid date
    }
  }

  const transformedItem = {
    customerId: item['Customer ID'] || item.customerId || '',
    customerName: item['Customer Name'] || item.customerName || '',
    phoneNumber: String(item['Phone Number'] || item.phoneNumber || ''),
    gender: item.Gender || item.gender || '',
    age: parseInt(item.Age || item.age || 0),
    customerRegion: item['Customer Region'] || item.customerRegion || '',
    customerType: item['Customer Type'] || item.customerType || '',
    productId: item['Product ID'] || item.productId || '',
    productName: item['Product Name'] || item.productName || '',
    brand: item.Brand || item.brand || '',
    productCategory: item['Product Category'] || item.productCategory || '',
    tags: Array.isArray(item.Tags || item.tags)
      ? item.Tags || item.tags
      : String(item.Tags || item.tags || '')
          .split(',')
          .map(t => t.trim().replace(/"/g, ''))
          .filter(t => t),
    quantity: parseInt(item.Quantity || item.quantity || 0),
    pricePerUnit: parseFloat(item['Price per Unit'] || item.pricePerUnit || 0),
    discountPercentage: parseFloat(item['Discount Percentage'] || item.discountPercentage || 0),
    totalAmount: parseFloat(item['Total Amount'] || item.totalAmount || 0),
    finalAmount: parseFloat(item['Final Amount'] || item.finalAmount || 0),
    date: dateValue,
    paymentMethod: item['Payment Method'] || item.paymentMethod || '',
    orderStatus: item['Order Status'] || item.orderStatus || '',
    deliveryType: item['Delivery Type'] || item.deliveryType || '',
    storeId: item['Store ID'] || item.storeId || '',
    storeLocation: item['Store Location'] || item.storeLocation || '',
    salespersonId: item['Salesperson ID'] || item.salespersonId || '',
    employeeName: item['Employee Name'] || item.employeeName || '',
  };

  // Validate required fields
  if (!transformedItem.customerId || !transformedItem.customerName || !transformedItem.productId) {
    return null; // Invalid record
  }

  return transformedItem;
};

const importData = async (filePath) => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    console.log('Attempting to connect to MongoDB...');
    
    try {
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB successfully');
    } catch (connectError) {
      console.error('\n❌ MongoDB Connection Failed!');
      console.error('Error:', connectError.message);
      throw connectError;
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Determine file type
    const fileExtension = path.extname(filePath).toLowerCase();
    const isCSV = fileExtension === '.csv';

    if (isCSV) {
      console.log('Reading CSV file (streaming mode)...');
      
      // Clear existing data (optional - uncomment if needed)
      // await Sales.deleteMany({});
      // console.log('Cleared existing data');

      // Process CSV in streaming mode with batching
      const batchSize = 500; // Smaller batches for memory efficiency
      let batch = [];
      let imported = 0;
      let rowCount = 0;
      let skipped = 0;
      let isFirstDataRow = true;
      let skipFirstDataRow = false;

      // Check first line for metadata
      const firstLine = fs.readFileSync(filePath, 'utf8').split('\n')[0];
      if (firstLine.toLowerCase().includes('file in')) {
        skipFirstDataRow = true;
      }

      await new Promise((resolve, reject) => {
        const stream = createReadStream(filePath)
          .pipe(csv({
            skipEmptyLines: true,
            skipLinesWithError: true,
            mapHeaders: ({ header }) => {
              return header.trim().replace(/^file in\s*/i, '');
            },
          }))
          .on('headers', (headerList) => {
            console.log('CSV Headers detected:', headerList.slice(0, 5).join(', '), '...');
          })
          .on('data', async (data) => {
            rowCount++;
            
            // Skip first data row if it's metadata
            if (isFirstDataRow) {
              isFirstDataRow = false;
              const firstValue = Object.values(data)[0];
              if (skipFirstDataRow && typeof firstValue === 'string' && 
                  (firstValue.includes('Transaction ID') || firstValue.includes('Customer ID'))) {
                return; // Skip this row
              }
            }

            // Transform record
            const transformedItem = transformRecord(data);
            
            if (!transformedItem) {
              skipped++;
              return;
            }

            batch.push(transformedItem);

            // Insert batch when it reaches batchSize
            if (batch.length >= batchSize) {
              // Pause stream while inserting
              stream.pause();
              
              try {
                await Sales.insertMany(batch, { ordered: false });
                imported += batch.length;
                console.log(`Imported ${imported} records... (Skipped: ${skipped})`);
                batch = [];
              } catch (error) {
                console.error(`Error inserting batch: ${error.message}`);
                batch = [];
              }
              
              // Resume stream
              stream.resume();
            }
          })
          .on('end', async () => {
            // Insert remaining records
            if (batch.length > 0) {
              try {
                await Sales.insertMany(batch, { ordered: false });
                imported += batch.length;
              } catch (error) {
                console.error(`Error inserting final batch: ${error.message}`);
              }
            }
            
            console.log(`\n✅ Successfully imported ${imported} records!`);
            console.log(`   Total rows processed: ${rowCount}`);
            console.log(`   Records skipped: ${skipped}`);
            resolve();
          })
          .on('error', (error) => {
            reject(error);
          });
      });

    } else {
      // JSON file handling (for smaller files)
      console.log('Reading JSON file...');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const salesData = JSON.parse(fileContent);

      if (!Array.isArray(salesData)) {
        throw new Error('JSON data must be an array');
      }

      console.log(`Transforming ${salesData.length} records...`);

      const batchSize = 1000;
      let imported = 0;
      let batch = [];

      for (const item of salesData) {
        const transformedItem = transformRecord(item);
        
        if (!transformedItem) {
          continue;
        }

        batch.push(transformedItem);

        if (batch.length >= batchSize) {
          try {
            await Sales.insertMany(batch, { ordered: false });
            imported += batch.length;
            console.log(`Imported ${imported}/${salesData.length} records...`);
            batch = [];
          } catch (error) {
            console.error(`Error inserting batch: ${error.message}`);
            batch = [];
          }
        }
      }

      // Insert remaining records
      if (batch.length > 0) {
        try {
          await Sales.insertMany(batch, { ordered: false });
          imported += batch.length;
        } catch (error) {
          console.error(`Error inserting final batch: ${error.message}`);
        }
      }

      console.log(`\n✅ Successfully imported ${imported} records!`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Get file path from command line argument or use default
const filePath = process.argv[2] || path.join(__dirname, '../data/truestate_assignment_dataset.csv');

if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  console.log('Usage: npm run import-data <path-to-csv-or-json-file>');
  console.log(`Default: ${filePath}`);
  process.exit(1);
}

importData(filePath);
