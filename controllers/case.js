import { CaseModel } from '../models/case.js';
import { UpdateModel } from '../models/update.js';

// @desc    Create a new case
// @route   POST /api/cases
// @access  Private
const createCase = async (req, res) => {
  try {
    const { title, description, courtInfo } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const newCase = await CaseModel.create({
      title,
      description,
      caseType,
      user: req.user._id,
      courtInfo: courtInfo || {},
    });

    // Create an initial update for the case
    await UpdateModel.create({
      caseId: newCase._id,
      message: 'Case filing initiated',
      updateType: 'status',
      createdBy: req.user._id,
      isAutomatic: true,
    });

    res.status(201).json({
      success: true,
      data: newCase
    });
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating case'
    });
  }
};

// @desc    Get all cases for a user
// @route   GET /api/cases
// @access  Private
const getCases = async (req, res) => {
  try {
    // If admin, get all cases; otherwise, get only user's cases
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const cases = await CaseModel.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json({
      success: true,
      count: cases.length,
      data: cases
    });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching cases'
    });
  }
};

// @desc    Get case by ID
// @route   GET /api/cases/:id
// @access  Private
const getCaseById = async (req, res) => {
  try {
    const caseItem = await CaseModel.findById(req.params.id)
      .populate('user', 'name email');

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user is authorized
    if (req.user.role !== 'admin' && caseItem.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this case'
      });
    }

    res.json({
      success: true,
      data: caseItem
    });
  } catch (error) {
    console.error('Get case error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching case'
    });
  }
};

// @desc    Update case status
// @route   PUT /api/cases/:id/status
// @access  Private
const updateCaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const caseItem = await CaseModel.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user is authorized
    if (req.user.role !== 'admin' && caseItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this case'
      });
    }

    caseItem.status = status;
    const updatedCase = await caseItem.save();

    // Create an update entry for status change
    await UpdateModel.create({
      caseId: caseItem._id,
      message: `Case status updated to ${status}`,
      updateType: 'status',
      createdBy: req.user._id,
      isAutomatic: false,
    });

    res.json({
      success: true,
      data: updatedCase
    });
  } catch (error) {
    console.error('Update case status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating case status'
    });
  }
};

// @desc    Update case details
// @route   PUT /api/cases/:id
// @access  Private
const updateCase = async (req, res) => {
  try {
    const { title, description, courtInfo } = req.body;
    const caseItem = await CaseModel.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if user is authorized
    if (req.user.role !== 'admin' && caseItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this case'
      });
    }

    // Update fields
    if (title) caseItem.title = title;
    if (description) caseItem.description = description;
    if (courtInfo) caseItem.courtInfo = courtInfo;

    const updatedCase = await caseItem.save();

    // Create an update entry
    await UpdateModel.create({
      caseId: caseItem._id,
      message: 'Case details updated',
      updateType: 'general',
      createdBy: req.user._id,
      isAutomatic: false,
    });

    res.json({
      success: true,
      data: updatedCase
    });
  } catch (error) {
    console.error('Update case error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating case'
    });
  }
};

export { createCase, getCases, getCaseById, updateCaseStatus, updateCase };