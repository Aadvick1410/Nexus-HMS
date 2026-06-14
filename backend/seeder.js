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
    await User.deleteMany();
    await Patient.deleteMany();
    await Appointment.deleteMany();
    await Invoice.deleteMany();
    await Room.deleteMany();
    await Admission.deleteMany();
    await EmergencyCase.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    const staffUsers = await User.insertMany([
      { name: 'System Admin', email: 'admin@nexushms.com', password: passwordHash, role: 'Super Admin' },
      { name: 'Hospital Director', email: 'director@nexushms.com', password: passwordHash, role: 'Hospital Admin' },
      { name: 'Dr. Emily Chen', email: 'dr.chen@nexushms.com', password: passwordHash, role: 'Doctor', department: 'Cardiology' },
      { name: 'Dr. Rajesh Patel', email: 'dr.patel@nexushms.com', password: passwordHash, role: 'Doctor', department: 'Neurology' },
      { name: 'Dr. Sarah Williams', email: 'dr.williams@nexushms.com', password: passwordHash, role: 'Doctor', department: 'Endocrinology' },
      { name: 'Dr. Michael Torres', email: 'dr.torres@nexushms.com', password: passwordHash, role: 'Doctor', department: 'Pediatrics' },
      { name: 'Dr. Priya Sharma', email: 'dr.sharma@nexushms.com', password: passwordHash, role: 'Doctor', department: 'Orthopedics' },
      { name: 'Nurse Clara', email: 'nurse.clara@nexushms.com', password: passwordHash, role: 'Nurse' },
      { name: 'Nurse Joy', email: 'nurse.joy@nexushms.com', password: passwordHash, role: 'Nurse' },
      { name: 'Nurse Angela', email: 'nurse.angela@nexushms.com', password: passwordHash, role: 'Nurse' },
      { name: 'Nurse Marcus', email: 'nurse.marcus@nexushms.com', password: passwordHash, role: 'Nurse' },
      { name: 'Recp. David', email: 'reception@nexushms.com', password: passwordHash, role: 'Receptionist' },
      { name: 'Lab Tech Sam', email: 'lab@nexushms.com', password: passwordHash, role: 'Lab Technician' },
      { name: 'Pharm. Lisa', email: 'pharmacy@nexushms.com', password: passwordHash, role: 'Pharmacist' },
      { name: 'Billing John', email: 'billing@nexushms.com', password: passwordHash, role: 'Billing Executive' }
    ]);
    const adminId = staffUsers[0]._id;
    const doctor1Id = staffUsers[2]._id;
    const doctor2Id = staffUsers[3]._id;
    const doctor3Id = staffUsers[4]._id;
    const nurse1Id = staffUsers[7]._id;
    const nurse2Id = staffUsers[8]._id;
    const nurse3Id = staffUsers[9]._id;
    const nurse4Id = staffUsers[10]._id;

    // 2. Create 20 Patients
    const patientNames = [
      'Aadvick', 'Amay', 'Arpita', 'James', 'Gunjot', 'Sophia', 'Liam', 'Olivia', 
      'Noah', 'Emma', 'Oliver', 'Ava', 'Elijah', 'Charlotte', 'William', 'Amelia', 
      'Lucas', 'Mia', 'Mason', 'Harper'
    ];
    
    const patientUsers = await User.insertMany(
      patientNames.map(name => ({
        name: name,
        email: `${name.toLowerCase()}@nexushms.com`,
        password: passwordHash,
        role: 'Patient'
      }))
    );

    // 3. Create Profiles for 20 patients
    const patientProfiles = patientUsers.map((user, index) => {
      const isEven = index % 2 === 0;
      return {
        userId: user._id,
        patientId: `PAT-10${index.toString().padStart(2, '0')}`,
        dob: new Date(1970 + index, (index % 12), (index % 28) + 1),
        gender: isEven ? 'Male' : 'Female',
        bloodGroup: ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'][index % 8],
        phone: `+1-555-${(1000 + index).toString()}`,
        address: `${100 + index} Main St, City`,
        emergencyContact: { name: `Relative ${index}`, relationship: 'Family', phone: `+1-555-${(2000 + index).toString()}` },
        allergies: index % 3 === 0 ? ['Penicillin'] : (index % 4 === 0 ? ['Peanuts'] : ['None']),
        medicalHistory: index % 5 === 0 ? [
          { condition: 'Hypertension', diagnosedDate: new Date('2020-01-01'), notes: 'Routine checkups required.' }
        ] : []
      };
    });
    
    const patientDocs = await Patient.insertMany(patientProfiles);

    // 4. Create Demo Rooms
    const rooms = await Room.insertMany([
      { roomNumber: '101A', ward: 'General', bedCount: 4, occupiedBeds: 1, pricePerDay: 50, status: 'Available' },
      { roomNumber: '201B', ward: 'ICU', bedCount: 1, occupiedBeds: 1, pricePerDay: 500, status: 'Full' },
      { roomNumber: '301C', ward: 'Private', bedCount: 1, occupiedBeds: 0, pricePerDay: 200, status: 'Available' },
    ]);

    // 5. Create Demo Admissions
    await Admission.insertMany([
      { patientId: patientDocs[0]._id, roomId: rooms[0]._id, admittedBy: doctor1Id, assignedNurse: nurse1Id, status: 'Admitted', diagnosis: 'Observation for high BP' },
      { patientId: patientDocs[1]._id, roomId: rooms[1]._id, admittedBy: doctor3Id, assignedNurse: nurse2Id, status: 'Under Treatment', diagnosis: 'Severe Hypoglycemia', treatmentPlan: 'IV Dextrose' },
      { patientId: patientDocs[2]._id, roomId: rooms[0]._id, admittedBy: doctor2Id, assignedNurse: nurse3Id, status: 'Admitted', diagnosis: 'Migraine Observation' },
      { patientId: patientDocs[3]._id, roomId: rooms[2]._id, admittedBy: doctor1Id, assignedNurse: nurse4Id, status: 'Under Treatment', diagnosis: 'Post-Surgery Recovery', treatmentPlan: 'Pain management' },
      { patientId: patientDocs[4]._id, roomId: rooms[0]._id, admittedBy: doctor3Id, assignedNurse: nurse1Id, status: 'Admitted', diagnosis: 'Allergic Reaction' }
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

    console.log('Data Imported successfully with 20 patients!');
    console.log('--- DEMO CREDENTIALS ---');
    console.log('All passwords are: Password123!');
    console.log('Roles:');
    console.log('  Admin: admin@nexushms.com');
    console.log('  Director: director@nexushms.com');
    console.log('  Nurse Clara: nurse.clara@nexushms.com');
    console.log('  Nurse Joy: nurse.joy@nexushms.com');
    console.log('  Nurse Angela: nurse.angela@nexushms.com');
    console.log('  Nurse Marcus: nurse.marcus@nexushms.com');
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
    console.log(`Created ${patientNames.length} patients. (e.g. ${patientNames[0].toLowerCase()}@nexushms.com)`);
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
