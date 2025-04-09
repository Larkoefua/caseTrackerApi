import { UpdateModel } from '../models/update.js';
import { CaseModel } from '../models/case.js';

// @desc    Create a new update
// @route   POST /api/updates
// @access  Private
const createUpdate = async (req, res) => {
  try {
    const { caseId, message, updateType } = req.body;

    if (!caseId || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Case ID and message are required' 
      });
    }

    const caseItem = await CaseModel.findById(caseId);

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
        message: 'Not authorized to create updates for this case' 
      });
    }

    const newUpdate = await UpdateModel.create({
      caseId,
      message,
      updateType: updateType || 'general',
      createdBy: req.user._id,
      isAutomatic: false,
    });

    res.status(201).json({
      success: true,
      data: newUpdate
    });
  } catch (error) {
    console.error('Create update error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error creating update'
    });
  }
};

// @desc    Get all updates for a case
// @route   GET /api/updates/case/:caseId
// @access  Private
const getCaseUpdates = async (req, res) => {
  try {
    const caseItem = await CaseModel.findById(req.params.caseId);

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
        message: 'Not authorized to view updates for this case' 
      });
    }

    const updates = await UpdateModel.find({ caseId: caseItem._id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      count: updates.length,
      data: updates
    });
  } catch (error) {
    console.error('Get updates error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error fetching updates'
    });
  }
};

// @desc    Delete an update
// @route   DELETE /api/updates/:id
// @access  Private
const deleteUpdate = async (req, res) => {
  try {
    const update = await UpdateModel.findById(req.params.id);

    if (!update) {
      return res.status(404).json({ 
        success: false,
        message: 'Update not found' 
      });
    }

    const caseItem = await CaseModel.findById(update.caseId);

    // Check if user is authorized
    if (req.user.role !== 'admin' && caseItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this update' 
      });
    }

    await update.deleteOne();

    res.json({
      success: true,
      message: 'Update deleted successfully'
    });
  } catch (error) {
    console.error('Delete update error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error deleting update'
    });
  }
};

export { createUpdate, getCaseUpdates, deleteUpdate };