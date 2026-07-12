const mongoose = require('mongoose');

const RevisionSchema = new mongoose.Schema({
  doctorNotes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending_review', 'reviewed', 'finalized'],
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const PredictionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Please assign a patient'],
    index: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please associate the doctor/uploader'],
    index: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide the uploaded scan image path']
  },
  predictedClass: {
    type: String,
    enum: ['glioma', 'meningioma', 'pituitary', 'notumor'],
    required: true
  },
  confidenceScores: {
    glioma: { type: Number, required: true },
    meningioma: { type: Number, required: true },
    pituitary: { type: Number, required: true },
    notumor: { type: Number, required: true }
  },
  doctorNotes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending_review', 'reviewed', 'finalized'],
    default: 'pending_review'
  },
  modelVersion: {
    type: String,
    default: 'ResNet50-Transfer-v1.0'
  },
  revisions: [RevisionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  timestamps: { createdAt: false, updatedAt: true }
});

// Compound unique index: prevents duplicate reports for the same patient scanning image
PredictionSchema.index({ patient: 1, imageUrl: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', PredictionSchema);
