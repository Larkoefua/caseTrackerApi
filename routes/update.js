import { Router } from 'express';
import { createUpdate, getCaseUpdates, deleteUpdate } from '../controllers/update.js';
import { protect } from '../middleware/auth.js';

const updateRouter = Router();

// Create a new update for a case
updateRouter.post('/', protect, createUpdate);

// Get all updates for a case
updateRouter.get('/case/:caseId', protect, getCaseUpdates);

// Delete an update
updateRouter.delete('/:id', protect, deleteUpdate);

export default updateRouter;
