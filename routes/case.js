import { Router } from 'express';
import {
  createCase,
  getCases,
  getCaseById,
  updateCaseStatus,
  updateCase,
} from '../controllers/case.js';
import { uploadDocument, getDocuments } from '../controllers/document.js';
import { createUpdate, getCaseUpdates } from '../controllers/update.js';
import { protect, admin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const caseRouter = Router();

// Case routes
caseRouter.route('/')
  .post(protect, createCase)
  .get(protect, getCases);

  caseRouter.route('/:id')
  .get(protect, getCaseById)
  .put(protect, updateCase);

  caseRouter.route('/:id/status')
  .put(protect, updateCaseStatus);

// Document routes
caseRouter.route('/:caseId/documents')
  .post(protect, upload.single('file'), uploadDocument)
  .get(protect, getDocuments);

// Update routes
caseRouter.route('/:caseId/updates')
  .post(protect, createUpdate)
  .get(protect, getCaseUpdates);

export default caseRouter;