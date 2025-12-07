import express from 'express';
import Sales from '../models/Sales.js';

const router = express.Router();

// Get all sales with search, filter, sort, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      customerRegion = '',
      gender = '',
      ageMin = '',
      ageMax = '',
      productCategory = '',
      tags = '',
      paymentMethod = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build query object
    const query = {};

    // Search: Customer Name or Phone Number (case-insensitive)
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Filters
    if (customerRegion) {
      const regions = customerRegion.split(',').filter(r => r.trim());
      if (regions.length > 0) {
        query.customerRegion = { $in: regions };
      }
    }

    if (gender) {
      const genders = gender.split(',').filter(g => g.trim());
      if (genders.length > 0) {
        query.gender = { $in: genders };
      }
    }

    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin) query.age.$gte = parseInt(ageMin);
      if (ageMax) query.age.$lte = parseInt(ageMax);
    }

    if (productCategory) {
      const categories = productCategory.split(',').filter(c => c.trim());
      if (categories.length > 0) {
        query.productCategory = { $in: categories };
      }
    }

    if (tags) {
      const tagArray = tags.split(',').filter(t => t.trim());
      if (tagArray.length > 0) {
        query.tags = { $in: tagArray };
      }
    }

    if (paymentMethod) {
      const methods = paymentMethod.split(',').filter(m => m.trim());
      if (methods.length > 0) {
        query.paymentMethod = { $in: methods };
      }
    }

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        query.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.date.$lte = endDate;
      }
    }

    // Sorting
    const sortOptions = {};
    if (sortBy === 'date') {
      sortOptions.date = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'quantity') {
      sortOptions.quantity = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'customerName') {
      sortOptions.customerName = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.date = -1; // Default: newest first
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [sales, total] = await Promise.all([
      Sales.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Sales.countDocuments(query),
    ]);

    // Calculate summary statistics
    const summaryQuery = { ...query };
    const summaryData = await Sales.aggregate([
      { $match: summaryQuery },
      {
        $group: {
          _id: null,
          totalUnits: { $sum: '$quantity' },
          totalAmount: { $sum: '$totalAmount' },
          totalDiscount: { $sum: { $subtract: ['$totalAmount', '$finalAmount'] } },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    const summary = summaryData[0] || {
      totalUnits: 0,
      totalAmount: 0,
      totalDiscount: 0,
      totalTransactions: 0,
    };

    res.json({
      sales,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
      summary: {
        totalUnitsSold: summary.totalUnits,
        totalAmount: summary.totalAmount,
        totalDiscount: summary.totalDiscount,
        totalTransactions: summary.totalTransactions,
      },
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get unique filter values
router.get('/filters', async (req, res) => {
  try {
    const [
      customerRegions,
      genders,
      productCategories,
      tags,
      paymentMethods,
      ageRange,
    ] = await Promise.all([
      Sales.distinct('customerRegion'),
      Sales.distinct('gender'),
      Sales.distinct('productCategory'),
      Sales.distinct('tags'),
      Sales.distinct('paymentMethod'),
      Sales.aggregate([
        {
          $group: {
            _id: null,
            minAge: { $min: '$age' },
            maxAge: { $max: '$age' },
          },
        },
      ]),
    ]);

    res.json({
      customerRegions: customerRegions.sort(),
      genders: genders.sort(),
      productCategories: productCategories.sort(),
      tags: tags.filter(t => t).sort(),
      paymentMethods: paymentMethods.sort(),
      ageRange: ageRange[0] || { minAge: 0, maxAge: 100 },
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Import/upload sales data
router.post('/import', async (req, res) => {
  try {
    const salesData = req.body;
    
    if (!Array.isArray(salesData)) {
      return res.status(400).json({ error: 'Data must be an array' });
    }

    // Validate and transform data
    const transformedData = salesData.map((item) => {
      // Handle date conversion
      let dateValue = item.Date || item.date;
      if (typeof dateValue === 'string') {
        dateValue = new Date(dateValue);
      }

      return {
        customerId: item['Customer ID'] || item.customerId,
        customerName: item['Customer Name'] || item.customerName,
        phoneNumber: item['Phone Number'] || item.phoneNumber,
        gender: item.Gender || item.gender,
        age: parseInt(item.Age || item.age),
        customerRegion: item['Customer Region'] || item.customerRegion,
        customerType: item['Customer Type'] || item.customerType,
        productId: item['Product ID'] || item.productId,
        productName: item['Product Name'] || item.productName,
        brand: item.Brand || item.brand,
        productCategory: item['Product Category'] || item.productCategory,
        tags: Array.isArray(item.Tags || item.tags) 
          ? item.Tags || item.tags 
          : (item.Tags || item.tags || '').split(',').map(t => t.trim()).filter(t => t),
        quantity: parseInt(item.Quantity || item.quantity),
        pricePerUnit: parseFloat(item['Price per Unit'] || item.pricePerUnit),
        discountPercentage: parseFloat(item['Discount Percentage'] || item.discountPercentage || 0),
        totalAmount: parseFloat(item['Total Amount'] || item.totalAmount),
        finalAmount: parseFloat(item['Final Amount'] || item.finalAmount),
        date: dateValue,
        paymentMethod: item['Payment Method'] || item.paymentMethod,
        orderStatus: item['Order Status'] || item.orderStatus,
        deliveryType: item['Delivery Type'] || item.deliveryType,
        storeId: item['Store ID'] || item.storeId,
        storeLocation: item['Store Location'] || item.storeLocation,
        salespersonId: item['Salesperson ID'] || item.salespersonId,
        employeeName: item['Employee Name'] || item.employeeName,
      };
    });

    // Insert data
    const result = await Sales.insertMany(transformedData, { ordered: false });
    
    res.json({
      message: 'Data imported successfully',
      count: result.length,
    });
  } catch (error) {
    console.error('Error importing sales data:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;

