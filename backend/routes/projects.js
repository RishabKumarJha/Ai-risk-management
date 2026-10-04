const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// GET all projects for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.userId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CREATE new project
router.post('/', auth, async (req, res) => {
  try {
    const {
      projectName,
      projectType,
      teamSize,
      estimatedTimelineMonths,
      complexityScore,
      methodologyUsed,
      teamExperienceLevel,
      budget,
      priorityLevel,
      projectManagerExperience,
      riskLevel,
      riskReason
    } = req.body;

    const project = new Project({
      userId: req.userId,
      projectName,
      projectType,
      teamSize,
      estimatedTimelineMonths,
      complexityScore,
      methodologyUsed,
      teamExperienceLevel,
      budget,
      priorityLevel,
      projectManagerExperience,
      riskLevel,
      riskReason
    });

    await project.save();
    res.status(201).json({ message: 'Project created successfully', project });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// UPDATE project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project updated successfully', project });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;