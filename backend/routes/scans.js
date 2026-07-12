const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Prediction = require('../models/Prediction');
const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Setup storage for uploaded MRI scans
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `mri_${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter (Only allow image uploads)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, and PNG images are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// @desc    Upload scan and run ML prediction
// @route   POST /api/scans/upload
// @access  Private (Doctor/Admin)
router.post('/upload', protect, authorize('doctor', 'admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload an MRI image file' });
    }

    const { patientId } = req.body;
    if (!patientId) {
      // Remove uploaded file if patient ID is missing
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'Please provide a valid Patient ID' });
    }

    // Verify patient exists
    const patientObj = await Patient.findById(patientId);
    if (!patientObj) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, error: 'Target patient record not found' });
    }

    // Save image url path (relative)
    const imageUrl = `/uploads/${req.file.filename}`;

    // Call ML Microservice via REST
    const mlUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';
    
    let mlResponse;
    try {
      // Build form-data for ML microservice call using Axios 1.x stream serialization
      mlResponse = await axios.post(`${mlUrl}/predict`, {
        file: fs.createReadStream(req.file.path)
      }, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (mlErr) {
      // Clean up uploaded file if ML service is offline
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error("ML service error detail:", mlErr.message);
      return res.status(502).json({
        success: false,
        error: 'ML microservice is offline or returned an error. Prediction aborted.'
      });
    }

    const { predictedClass, confidenceScores, modelVersion } = mlResponse.data;

    // Create Prediction Document in MongoDB (append-only entry)
    const prediction = await Prediction.create({
      patient: patientObj._id,
      uploadedBy: req.user.id,
      imageUrl,
      predictedClass,
      confidenceScores,
      modelVersion,
      status: 'pending_review'
    });

    // Create Audit Log
    await AuditLog.create({
      user: req.user.id,
      action: `Processed MRI Scan prediction: ${predictedClass} (ID: ${prediction._id})`,
      targetId: prediction._id,
      targetType: 'Prediction'
    });

    res.status(201).json({
      success: true,
      data: prediction
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get all scans
// @route   GET /api/scans
// @access  Private (Doctor/Admin)
router.get('/', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const { patient, predictedClass, status, dateStart, dateEnd } = req.query;
    let query = {};

    if (req.user.role === 'doctor') {
      // Find patients assigned to this doctor to filter predictions
      const myPatients = await Patient.find({ assignedDoctor: req.user.id }).select('_id');
      const patientIds = myPatients.map(p => p._id);
      query.patient = { $in: patientIds };
    }

    // Filter properties
    if (patient) {
      query.patient = patient;
    }
    if (predictedClass) {
      query.predictedClass = predictedClass;
    }
    if (status) {
      query.status = status;
    }
    if (dateStart || dateEnd) {
      query.createdAt = {};
      if (dateStart) query.createdAt.$gte = new Date(dateStart);
      if (dateEnd) query.createdAt.$lte = new Date(dateEnd);
    }

    const scans = await Prediction.find(query)
      .populate('patient', 'name patientId age gender')
      .populate('uploadedBy', 'name hospital')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: scans.length,
      data: scans
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get single scan details
// @route   GET /api/scans/:id
// @access  Private (Doctor/Admin)
router.get('/:id', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const scan = await Prediction.findById(req.params.id)
      .populate('patient')
      .populate('uploadedBy', 'name hospital licenseId')
      .populate('revisions.updatedBy', 'name role');

    if (!scan) {
      return res.status(404).json({ success: false, error: 'MRI scan prediction not found' });
    }

    // Auth validation check for doctors
    if (req.user.role === 'doctor') {
      const patient = await Patient.findById(scan.patient);
      if (patient.assignedDoctor.toString() !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied to this scan file' });
      }
    }

    res.status(200).json({
      success: true,
      data: scan
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Update scan findings/notes (Append-Only Revision Control)
// @route   PUT /api/scans/:id/notes
// @access  Private (Doctor/Admin)
router.put('/:id/notes', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    let scan = await Prediction.findById(req.params.id);
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan prediction not found' });
    }

    // Access check
    if (req.user.role === 'doctor') {
      const patient = await Patient.findById(scan.patient);
      if (patient.assignedDoctor.toString() !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    const { doctorNotes, status } = req.body;

    // Build the revision subdocument
    const newRevision = {
      doctorNotes: doctorNotes || '',
      status: status || scan.status,
      updatedBy: req.user.id,
      updatedAt: new Date()
    };

    // Update active state and push revision to array
    scan.doctorNotes = doctorNotes !== undefined ? doctorNotes : scan.doctorNotes;
    scan.status = status !== undefined ? status : scan.status;
    scan.revisions.push(newRevision);

    await scan.save();

    // Create Audit Log
    await AuditLog.create({
      user: req.user.id,
      action: `Created prediction revision status '${scan.status}' (Scan: ${scan._id})`,
      targetId: scan._id,
      targetType: 'Prediction'
    });

    res.status(200).json({
      success: true,
      data: scan
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
