const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  projectType: String,
  teamSize: Number,
  estimatedTimelineMonths: Number,
  complexityScore: Number,
  methodologyUsed: String,
  teamExperienceLevel: String,
  budget: Number,
  priorityLevel: String,
  projectManagerExperience: String,
  riskLevel: String,
  riskReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', projectSchema);