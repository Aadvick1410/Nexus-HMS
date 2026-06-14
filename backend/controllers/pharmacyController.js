import asyncHandler from 'express-async-handler';
import Medicine from '../models/Medicine.js';

// @desc    Add a new medicine
// @route   POST /api/pharmacy
// @access  Private (Pharmacist, Super Admin)
const addMedicine = asyncHandler(async (req, res) => {
  const { name, genericName, stock, reorderLevel, expiryDate, price, supplier } = req.body;

  const medicineExists = await Medicine.findOne({ name });

  if (medicineExists) {
    res.status(400);
    throw new Error('Medicine already exists in inventory');
  }

  const medicine = await Medicine.create({
    name,
    genericName,
    stock,
    reorderLevel,
    expiryDate,
    price,
    supplier,
  });

  if (medicine) {
    res.status(201).json(medicine);
  } else {
    res.status(400);
    throw new Error('Invalid medicine data');
  }
});

// @desc    Get all medicines
// @route   GET /api/pharmacy
// @access  Private (Pharmacist, Doctor)
const getMedicines = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({});
  res.json(medicines);
});

// @desc    Update medicine stock
// @route   PUT /api/pharmacy/:id/stock
// @access  Private (Pharmacist)
const updateMedicineStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body; // Can be negative (dispensed) or positive (restocked)
  
  const medicine = await Medicine.findById(req.params.id);

  if (medicine) {
    const newStock = medicine.stock + Number(quantity);
    
    if (newStock < 0) {
      res.status(400);
      throw new Error(`Insufficient stock. Current stock: ${medicine.stock}, requested: ${Math.abs(quantity)}`);
    }

    medicine.stock = newStock;
    const updatedMedicine = await medicine.save();
    res.json(updatedMedicine);
  } else {
    res.status(404);
    throw new Error('Medicine not found');
  }
});

export { addMedicine, getMedicines, updateMedicineStock };
