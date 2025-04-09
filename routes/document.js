import { Router } from 'express';
import { 
  uploadDocument, 
  getDocuments, 
  deleteDocument,
  getDocumentById,
  updateDocument
} from '../controllers/document.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const documentRouter = Router();

// Upload a new document
documentRouter.post('/', protect, upload.single('file'), uploadDocument);

// Get all documents for a case
documentRouter.get('/case/:caseId', protect, getDocuments);

// Get a specific document
documentRouter.get('/:id', protect, getDocumentById);

// Update document details
documentRouter.put('/:id', protect, updateDocument);

// Delete a document
documentRouter.delete('/:id', protect, deleteDocument);

export default documentRouter;