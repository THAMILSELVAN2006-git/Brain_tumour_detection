const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Prediction = require('../models/Prediction');
const AuditLog = require('../models/AuditLog');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mastishknetra';

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(mongoUri);
    console.log('Database connected.');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Patient.deleteMany();
    await Prediction.deleteMany();
    await AuditLog.deleteMany();
    console.log('Database cleared.');

    // Create Admin Account
    console.log('Creating Admin Account...');
    const admin = await User.create({
      name: 'Admin Admin',
      email: 'admin@mastishk.net',
      password: 'password123',
      role: 'admin',
      hospital: 'MastishkNetra System Hub',
      licenseId: 'SYS-001'
    });
    console.log(`Admin created: ${admin.email}`);

    // Create Doctor Account
    console.log('Creating Doctor Account...');
    const doctor = await User.create({
      name: 'Dr. Siddharth Sharma',
      email: 'doctor@mastishk.net',
      password: 'password123',
      role: 'doctor',
      hospital: 'Apollo Hospital Delhi',
      licenseId: 'LIC-88901'
    });
    console.log(`Doctor created: ${doctor.email}`);

    // Create Patients
    console.log('Creating Patients...');
    const patients = [
      {
        name: 'Rajesh Kumar',
        age: 45,
        gender: 'Male',
        contact: '+91 98765 43210',
        assignedDoctor: doctor._id
      },
      {
        name: 'Priya Patel',
        age: 32,
        gender: 'Female',
        contact: '+91 99887 76655',
        assignedDoctor: doctor._id
      },
      {
        name: 'Anil Mehta',
        age: 58,
        gender: 'Male',
        contact: '+91 91234 56789',
        assignedDoctor: doctor._id
      }
    ];

    const createdPatients = await Patient.create(patients);
    console.log(`Patients created: ${createdPatients.length} patients.`);

    // Log seed action in Audit Logs
    await AuditLog.create({
      user: admin._id,
      action: 'Seeded initial database containing Admin, Doctor, and 3 Patients.'
    });

    console.log('Database seeding successfully finished!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
