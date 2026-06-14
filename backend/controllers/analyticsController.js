import asyncHandler from 'express-async-handler';

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  // Normally you would aggregate this data from your MongoDB collections using Mongoose.
  // For the purpose of providing robust, visual dashboard data (especially on a fresh database),
  // we will return realistic mock data tailored for the charting libraries.

  const revenueData = [
    { date: 'Mon', revenue: 1200 },
    { date: 'Tue', revenue: 1900 },
    { date: 'Wed', revenue: 1500 },
    { date: 'Thu', revenue: 2200 },
    { date: 'Fri', revenue: 2800 },
    { date: 'Sat', revenue: 2100 },
    { date: 'Sun', revenue: 1800 },
  ];

  const departmentData = [
    { name: 'Cardiology', patients: 145 },
    { name: 'Neurology', patients: 85 },
    { name: 'Oncology', patients: 65 },
    { name: 'Pediatrics', patients: 110 },
    { name: 'Orthopedics', patients: 95 },
  ];

  const bedOccupancy = [
    { name: 'Occupied', value: 120 },
    { name: 'Available', value: 30 },
    { name: 'Maintenance', value: 5 },
  ];

  const doctorUtilization = [
    { subject: 'Dr. Smith', A: 120, fullMark: 150 },
    { subject: 'Dr. Jones', A: 98, fullMark: 150 },
    { subject: 'Dr. Davis', A: 140, fullMark: 150 },
    { subject: 'Dr. Wilson', A: 85, fullMark: 150 },
    { subject: 'Dr. Taylor', A: 110, fullMark: 150 },
  ];

  res.json({
    revenueData,
    departmentData,
    bedOccupancy,
    doctorUtilization,
  });
});

export { getDashboardAnalytics };
