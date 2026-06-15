import asyncHandler from 'express-async-handler';
import Invoice from '../models/Invoice.js';
import Appointment from '../models/Appointment.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  
  // 1. Revenue Trends (Last 7 Days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const invoices = await Invoice.find({ 
    paymentStatus: 'Paid', 
    updatedAt: { $gte: sevenDaysAgo } 
  });

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const revenueMap = {};
  
  // Initialize last 7 days with 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    revenueMap[daysOfWeek[d.getDay()]] = 0;
  }

  invoices.forEach(inv => {
    const day = daysOfWeek[new Date(inv.updatedAt).getDay()];
    if (revenueMap[day] !== undefined) {
      revenueMap[day] += inv.totalAmount;
    }
  });

  const revenueData = Object.keys(revenueMap).map(day => ({
    date: day,
    revenue: revenueMap[day]
  }));

  // Sort revenue data starting from 6 days ago up to today
  const sortedRevenueData = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const day = daysOfWeek[d.getDay()];
    sortedRevenueData.push({ date: day, revenue: revenueMap[day] });
  }

  // 2. Department Load (Appointments per department)
  const deptAggr = await Appointment.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const departmentData = deptAggr.map(d => ({
    name: d._id || 'Unknown',
    patients: d.count
  }));

  // Fallback if empty database
  if (departmentData.length === 0) {
    departmentData.push(
      { name: 'Cardiology', patients: 0 },
      { name: 'Neurology', patients: 0 }
    );
  }

  // 3. Bed Occupancy
  const rooms = await Room.find({});
  let occupied = 0;
  let available = 0;
  let maintenance = 0;

  rooms.forEach(room => {
    if (room.status === 'Maintenance') {
      maintenance += room.bedCount;
    } else {
      occupied += room.occupiedBeds;
      available += Math.max(0, room.bedCount - room.occupiedBeds);
    }
  });

  const bedOccupancy = [
    { name: 'Occupied', value: occupied },
    { name: 'Available', value: available },
    { name: 'Maintenance', value: maintenance },
  ];

  // 4. Doctor Utilization
  const doctorAggr = await Appointment.aggregate([
    { $group: { _id: '$doctorId', count: { $sum: 1 } } }
  ]);

  // We need to populate doctor names
  await User.populate(doctorAggr, { path: '_id', select: 'name' });

  const maxAppointments = doctorAggr.reduce((max, d) => Math.max(max, d.count), 0);
  const fullMark = Math.max(10, maxAppointments + 5);

  const doctorUtilization = doctorAggr.map(d => ({
    subject: d._id ? d._id.name.replace('Dr. ', '') : 'Unknown',
    A: d.count,
    fullMark
  }));

  // Fallback if no doctors/appointments yet
  if (doctorUtilization.length === 0) {
    doctorUtilization.push({ subject: 'No Data', A: 0, fullMark: 10 });
  }

  res.json({
    revenueData: sortedRevenueData,
    departmentData,
    bedOccupancy,
    doctorUtilization,
  });
});

export { getDashboardAnalytics };
