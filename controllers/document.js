import { DocumentModel } from '../models/document.js';
import { CaseModel } from '../models/case.js';
import { UpdateModel } from '../models/update.js';
import { cloudinary } from '../middleware/upload.js';

// @desc    Upload document to a case
// @route   POST /api/documents
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    const { caseId, title, documentType } = req.body;

    if (!caseId || !title || !documentType) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    console.log('Uploading file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

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
        message: 'Not authorized to upload to this case' 
      });
    }

    // Create document record with initial file URL
    const newDocument = await DocumentModel.create({
      caseId: caseItem._id,
      title: title,
      documentType: documentType,
      fileUrl: req.file.path,
      publicId: req.file.filename,
      uploadedBy: req.user._id,
    });

    console.log('Document created:', {
      fileUrl: newDocument.fileUrl,
      publicId: newDocument.publicId
    });

    // Create an update for the document upload
    await UpdateModel.create({
      caseId: caseItem._id,
      message: `New document uploaded: ${title}`,
      updateType: 'document',
      createdBy: req.user._id,
      isAutomatic: false,
    });

    // Get the secure URL with the correct extension
    const secureUrl = await cloudinary.url(newDocument.publicId, {
      secure: true,
      resource_type: 'raw'
    });

    // Update the document with the secure URL
    newDocument.fileUrl = secureUrl;
    await newDocument.save();

    res.status(201).json({
      success: true,
      data: newDocument
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error uploading document'
    });
  }
};

// @desc    Get all documents for a case
// @route   GET /api/documents/case/:caseId
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const caseItem = await CaseModel.findById(req.params.caseId);

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Check if user is authorized
    if (req.user.role !== 'admin' && caseItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view documents for this case' });
    }

    const documents = await DocumentModel.find({ caseId: caseItem._id })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email');

    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error fetching documents'
    });
  }
};

// @desc    Get a single document
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res) => {
  try {
    const document = await DocumentModel.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const caseItem = await CaseModel.findById(document.caseId);

    // Check if user is authorized
    if (req.user.role !== 'admin' && caseItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this document' });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error fetching document'
    });
  }
};

// @desc    Update document details
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = async (req, res) => {
  try {
    const { title, documentType } = req.body;
    const document = await DocumentModel.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const caseItem = await CaseModel.findById(document.caseId);

    // Check if user is authorized
    if (req.user.role !== 'admin' && caseItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this document' });
    }

    // Update document
    document.title = title || document.title;
    document.documentType = documentType || document.documentType;
    const updatedDocument = await document.save();

    res.json({
      success: true,
      data: updatedDocument
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error updating document'
    });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  try {
    const document = await DocumentModel.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const caseItem = await CaseModel.findById(document.caseId);

    // Check if user is authorized
    if (req.user.role !== 'admin' && caseItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(document.publicId);

    // Delete from database
    await document.deleteOne();

    // Create an update for the document deletion
    await UpdateModel.create({
      caseId: caseItem._id,
      message: `Document deleted: ${document.title}`,
      updateType: 'document',
      createdBy: req.user._id,
      isAutomatic: false,
    });

    res.json({ 
      success: true,
      message: 'Document removed successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error deleting document'
    });
  }
};

export { uploadDocument, getDocuments, getDocumentById, updateDocument, deleteDocument };