import asyncHandler from 'express-async-handler';
import Invoice from '../models/Invoice.js';

// @desc    Generate a new invoice
// @route   POST /api/billing
// @access  Private (Billing Executive, Super Admin)
const generateInvoice = asyncHandler(async (req, res) => {
  const { patientId, lineItems } = req.body;

  // Calculate total amount
  const totalAmount = lineItems.reduce((acc, item) => acc + item.amount, 0);

  const invoice = await Invoice.create({
    patientId,
    lineItems,
    totalAmount,
    generatedBy: req.user._id,
  });

  if (invoice) {
    res.status(201).json(invoice);
  } else {
    res.status(400);
    throw new Error('Invalid invoice data');
  }
});

// @desc    Get patient invoices
// @route   GET /api/billing/patient/:patientId
// @access  Private (Patient, Billing Executive)
const getPatientInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ patientId: req.params.patientId })
    .populate('generatedBy', 'name')
    .sort({ createdAt: -1 });

  res.json(invoices);
});

// @desc    Update payment status
// @route   PUT /api/billing/:id/pay
// @access  Private (Billing Executive)
const processPayment = asyncHandler(async (req, res) => {
  const { paymentMethod } = req.body;
  const invoice = await Invoice.findById(req.params.id);

  if (invoice) {
    invoice.paymentStatus = 'Paid';
    invoice.paymentMethod = paymentMethod;
    invoice.paidAt = Date.now();

    const updatedInvoice = await invoice.save();
    res.json(updatedInvoice);
  } else {
    res.status(404);
    throw new Error('Invoice not found');
  }
});

// @desc    Get all invoices
// @route   GET /api/billing/all
// @access  Private (Billing Executive, Super Admin)
const getAllInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({})
    .populate('generatedBy', 'name')
    .populate({
      path: 'patientId',
      populate: { path: 'userId', select: 'name' }
    })
    .sort({ createdAt: -1 });
  res.json(invoices);
});

// @desc    Update invoice (Admin Edit)
// @route   PUT /api/billing/:id
// @access  Private (Billing Executive, Super Admin)
const updateInvoiceAdmin = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (invoice) {
    invoice.totalAmount = req.body.totalAmount ?? invoice.totalAmount;
    invoice.paymentStatus = req.body.paymentStatus || invoice.paymentStatus;
    
    const updatedInvoice = await invoice.save();
    
    const populatedInvoice = await Invoice.findById(updatedInvoice._id)
      .populate('generatedBy', 'name')
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name' }
      });
      
    res.json(populatedInvoice);
  } else {
    res.status(404);
    throw new Error('Invoice not found');
  }
});

export { generateInvoice, getPatientInvoices, processPayment, getAllInvoices, updateInvoiceAdmin };
