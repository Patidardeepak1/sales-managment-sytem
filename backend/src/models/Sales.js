import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema({
  customerId: { type: String, required: true, index: true },
  customerName: { type: String, required: true, index: true },
  phoneNumber: { type: String, required: true, index: true },
  gender: { type: String, required: true, index: true },
  age: { type: Number, required: true, index: true },
  customerRegion: { type: String, required: true, index: true },
  customerType: { type: String },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  brand: { type: String },
  productCategory: { type: String, required: true, index: true },
  tags: [{ type: String, index: true }],
  quantity: { type: Number, required: true, index: true },
  pricePerUnit: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  finalAmount: { type: Number, required: true },
  date: { type: Date, required: true, index: true },
  paymentMethod: { type: String, required: true, index: true },
  orderStatus: { type: String },
  deliveryType: { type: String },
  storeId: { type: String },
  storeLocation: { type: String },
  salespersonId: { type: String },
  employeeName: { type: String },
}, {
  timestamps: true,
});

// Compound indexes for better query performance
// Text index for search functionality (customerName and phoneNumber)
salesSchema.index({ customerName: 'text', phoneNumber: 'text' });
// Date index for sorting (descending for newest first)
salesSchema.index({ date: -1 });
// Note: quantity and customerName already have indexes from schema definition (index: true)

const Sales = mongoose.model('Sales', salesSchema);

export default Sales;

