const express = require('express');
const Patient = require('../models/Patient');
const Prediction = require('../models/Prediction');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (Doctor/Admin)
router.get('/', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = {};

    // Doctors only see their assigned patients, Admins see all
    if (req.user.role === 'doctor') {
      query.assignedDoctor = req.user.id;
    }

    // Search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(query)
      .populate('assignedDoctor', 'name email hospital')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Patient.countDocuments(query);

    res.status(200).json({
      success: true,
      count: patients.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      },
      data: patients
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get single patient detail & history timeline
// @route   GET /api/patients/:id
// @access  Private (Doctor/Admin)
router.get('/:id', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('assignedDoctor', 'name email hospital');

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    // Check ownership if doctor
    if (req.user.role === 'doctor' && patient.assignedDoctor._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied to this patient file' });
    }

    // Fetch full prediction timeline
    const scans = await Prediction.find({ patient: patient._id })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        patient,
        scans
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Private (Doctor/Admin)
router.post('/', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { name, age, gender, contact, assignedDoctor } = req.body;

    // Doctor ID defaults to self if not provided or logged in as doctor
    const doctorId = req.user.role === 'doctor' ? req.user.id : (assignedDoctor || req.user.id);

    const patient = await Patient.create({
      name,
      age,
      gender,
      contact,
      assignedDoctor: doctorId
    });

    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      action: `Created patient record: ${patient.patientId}`,
      targetId: patient._id,
      targetType: 'Patient'
    });

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (Doctor/Admin)
router.put('/:id', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    let patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    // Check ownership if doctor
    if (req.user.role === 'doctor' && patient.assignedDoctor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      action: `Updated patient details: ${patient.patientId}`,
      targetId: patient._id,
      targetType: 'Patient'
    });

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Delete patient (soft delete preferred in production, raw delete here for simplicity)
// @route   DELETE /api/patients/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    // Delete associated scans
    await Prediction.deleteMany({ patient: patient._id });

    // Delete patient
    await patient.deleteOne();

    // Create audit log
    await AuditLog.create({
      user: req.user.id,
      action: `Deleted patient and associated scan history for ID: ${patient.patientId}`
    });

    res.status(200).json({
      success: true,
      message: 'Patient record and scan history deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
