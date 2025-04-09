import {Router} from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/user.js';
import { protect } from '../middleware/auth.js';

const userRouter = Router();

userRouter.post('/', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/profile', protect, getUserProfile);

export default userRouter;