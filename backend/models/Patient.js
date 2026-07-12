const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please add patient name'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Please add patient age']
  },
  gender: {
    type: String,
    required: [true, 'Please add patient gender'],
    enum: ['Male', 'Female', 'Other']
  },
  contact: {
    type: String,
    required: [true, 'Please add contact number'],
    trim: true
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign a doctor']
  }
}, {
  timestamps: true
});

// Auto-generate patient ID pre-save (e.g. PAT-10023)
PatientSchema.pre('save', async function (next) {
  if (this.isNew && !this.patientId) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    this.patientId = `PAT-${randomNum}`;
  }
  next();
});

module.exports = mongoose.model('Patient', PatientSchema);
