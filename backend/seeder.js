import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Appointment from './models/Appointment.js';
import Invoice from './models/Invoice.js';
import Room from './models/Room.js';
import Admission from './models/Admission.js';
import EmergencyCase from './models/EmergencyCase.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Patient.deleteMany();
    await Appointment.deleteMany();
    await Invoice.deleteMany();
    await Room.deleteMany();
    await Admission.deleteMany();
    await EmergencyCase.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    // 1. Create Base Users (Admin, Doctors, and ALL other roles)
    const staffUsers = await User.insertMany([
      { name: 'System Admin', email: 'admin@nexushms.com', password: passwordHash, role: 'Super Admin' },
      { name: 'Hospital Director', email: 'director@nexushms.com', password: passwordHash, role: 'Hospital Admin' },
      { name: 'Dr. Emily Chen', email: 'dr.chen@nexushms.com', password: passwordHash, role: 'Doctor', department: 'Cardiology' },
      { name: 'Dr. Rajesh Patel', email: 'dr.patel@nexushms.com', password: passwordHash, role: 'Doctor', department: 'Neurology' },
      { name: 'Dr. Sarah Williams', email: 'dr.williams@nexushms.com', password: passwordHash, role: 'Doctor', department: 'Endocrinology' },
      { name: 'Dr. Michael Torres', email: 'dr.torres@nexushms.com', password: passwordHash, role: 'Doctor', department: 'Pediatrics' },
      { name: 'Dr. Priya Sharma', email: 'dr.sharma@nexushms.com', password: passwordHash, role: 'Doctor', department: 'Orthopedics' },
      { name: 'Nurse Clara', email: 'nurse.clara@nexushms.com', password: passwordHash, role: 'Nurse' },
      { name: 'Recp. David', email: 'reception@nexushms.com', password: passwordHash, role: 'Receptionist' },
      { name: 'Lab Tech Sam', email: 'lab@nexushms.com', password: passwordHash, role: 'Lab Technician' },
      { name: 'Pharm. Lisa', email: 'pharmacy@nexushms.com', password: passwordHash, role: 'Pharmacist' },
      { name: 'Billing John', email: 'billing@nexushms.com', password: passwordHash, role: 'Billing Executive' }
    ]);
    const adminId = staffUsers[0]._id;
    const doctor1Id = staffUsers[2]._id;
    const doctor2Id = staffUsers[3]._id;
    const doctor3Id = staffUsers[4]._id;

    // 2. Create Demo Patients Users
    const patientNames = ['Aadvick', 'Amay', 'Arpita', 'James', 'Gunjot'];
    const patientUsers = await User.insertMany(
      patientNames.map(name => ({
        name: name,
        email: `${name.toLowerCase()}@nexushms.com`,
        password: passwordHash,
        role: 'Patient'
      }))
    );

    // 3. Create Intricate Patient Profiles
    const patientDocs = await Patient.insertMany([
      {
        userId: patientUsers[0]._id, // Aadvick
        patientId: 'PAT-1001',
        dob: new Date('1990-05-14'),
        gender: 'Male',
        bloodGroup: 'O+',
        phone: '+1-555-0101',
        address: '123 Tech Lane, Silicon Valley',
        emergencyContact: { name: 'Sarah (Wife)', relationship: 'Spouse', phone: '+1-555-0199' },
        allergies: ['Penicillin', 'Peanuts'],
        medicalHistory: [
          { condition: 'Hypertension', diagnosedDate: new Date('2021-08-10'), notes: 'Managing with Lisinopril 10mg. Blood pressure stable at 125/80.' },
          { condition: 'Mild Asthma', diagnosedDate: new Date('2015-03-22'), notes: 'Uses Albuterol inhaler occasionally during spring.' }
        ]
      },
      {
        userId: patientUsers[1]._id, // Amay
        patientId: 'PAT-1002',
        dob: new Date('1985-11-02'),
        gender: 'Male',
        bloodGroup: 'A+',
        phone: '+1-555-0102',
        address: '456 Startup Blvd, SF',
        emergencyContact: { name: 'Ravi', relationship: 'Brother', phone: '+1-555-0299' },
        allergies: ['Dust Mites'],
        medicalHistory: [
          { condition: 'Type 2 Diabetes', diagnosedDate: new Date('2019-11-05'), notes: 'HbA1c is 6.5%. Diet controlled. Takes Metformin 500mg.' }
        ]
      },
      {
        userId: patientUsers[2]._id, // Arpita
        patientId: 'PAT-1003',
        dob: new Date('1992-07-19'),
        gender: 'Female',
        bloodGroup: 'B+',
        phone: '+1-555-0103',
        address: '789 Innovation Drive, SJ',
        emergencyContact: { name: 'Neha', relationship: 'Sister', phone: '+1-555-0399' },
        allergies: ['Sulfa Drugs'],
        medicalHistory: [
          { condition: 'Migraines', diagnosedDate: new Date('2018-02-14'), notes: 'Occurs once a month. Prescribed Sumatriptan 50mg PRN.' }
        ]
      },
      {
        userId: patientUsers[3]._id, // James
        patientId: 'PAT-1004',
        dob: new Date('1978-04-30'),
        gender: 'Male',
        bloodGroup: 'AB-',
        phone: '+1-555-0104',
        address: '321 Enterprise Way, NY',
        emergencyContact: { name: 'Mary', relationship: 'Wife', phone: '+1-555-0499' },
        allergies: ['None'],
        medicalHistory: []
      },
      {
        userId: patientUsers[4]._id, // Gunjot
        patientId: 'PAT-1005',
        dob: new Date('1995-12-08'),
        gender: 'Male',
        bloodGroup: 'O-',
        phone: '+1-555-0105',
        address: '654 Cloud Ave, Seattle',
        emergencyContact: { name: 'Simran', relationship: 'Sister', phone: '+1-555-0599' },
        allergies: ['Latex'],
        medicalHistory: []
      }
    ]);

    // 4. Create Demo Rooms
    const rooms = await Room.insertMany([
      { roomNumber: '101A', ward: 'General', bedCount: 4, occupiedBeds: 1, pricePerDay: 50, status: 'Available' },
      { roomNumber: '201B', ward: 'ICU', bedCount: 1, occupiedBeds: 1, pricePerDay: 500, status: 'Full' },
      { roomNumber: '301C', ward: 'Private', bedCount: 1, occupiedBeds: 0, pricePerDay: 200, status: 'Available' },
    ]);

    // 5. Create Demo Admissions
    await Admission.insertMany([
      { patientId: patientDocs[0]._id, roomId: rooms[0]._id, admittedBy: doctor1Id, status: 'Admitted', diagnosis: 'Observation for high BP' },
      { patientId: patientDocs[1]._id, roomId: rooms[1]._id, admittedBy: doctor3Id, status: 'Under Treatment', diagnosis: 'Severe Hypoglycemia', treatmentPlan: 'IV Dextrose' }
    ]);

    // 6. Create Demo Emergency Cases
    await EmergencyCase.insertMany([
      { patientName: 'Unknown John Doe', severity: 'Critical', chiefComplaint: 'Car Accident, Head Trauma', status: 'In Treatment', assignedDoctor: doctor2Id }
    ]);

    // 7. Create Demo Appointments
    await Appointment.insertMany([
      { patientId: patientDocs[0]._id, doctorId: doctor1Id, department: 'Cardiology', slot: new Date('2026-06-20T10:00:00Z'), status: 'Confirmed', reason: 'Routine BP checkup' },
      { patientId: patientDocs[1]._id, doctorId: doctor3Id, department: 'Endocrinology', slot: new Date('2026-06-22T09:00:00Z'), status: 'Confirmed', reason: 'Diabetes follow-up (A1C review)' },
      { patientId: patientDocs[2]._id, doctorId: doctor2Id, department: 'Neurology', slot: new Date('2026-06-25T11:00:00Z'), status: 'Requested', reason: 'Increased migraine frequency' }
    ]);

    // 8. Create Demo Invoices
    await Invoice.insertMany([
      {
        patientId: patientDocs[0]._id,
        lineItems: [
          { description: 'Cardiology Consultation', amount: 250, category: 'Consultation' }
        ],
        totalAmount: 250,
        paymentStatus: 'Unpaid',
        paymentMethod: 'Pending',
        generatedBy: adminId
      }
    ]);

    console.log('Data Imported successfully!');
    console.log('--- DEMO CREDENTIALS ---');
    console.log('All passwords are: Password123!');
    console.log('Roles:');
    console.log('  Admin: admin@nexushms.com');
    console.log('  Director: director@nexushms.com');
    console.log('  Nurse: nurse.clara@nexushms.com');
    console.log('  Receptionist: reception@nexushms.com');
    console.log('  Lab Tech: lab@nexushms.com');
    console.log('  Pharmacist: pharmacy@nexushms.com');
    console.log('  Billing: billing@nexushms.com');
    console.log('Doctors:');
    console.log('  dr.chen@nexushms.com');
    console.log('  dr.patel@nexushms.com');
    console.log('  dr.williams@nexushms.com');
    console.log('  dr.torres@nexushms.com');
    console.log('  dr.sharma@nexushms.com');
    patientNames.forEach(name => {
      console.log(`Patient ${name}: ${name.toLowerCase()}@nexushms.com`);
    });
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
