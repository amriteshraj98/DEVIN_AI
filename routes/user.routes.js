import {Router} from 'express';

const router = Router();
import * as userController from '../controllers/user.controller.js';
import {body} from 'express-validator';
import * as authMiddleware from '../middleware/auth.middleware.js';

router.post('/register',
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    userController.createUser
);

router.post('/login',
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
    userController.loginController
);

// Additional routes can be added here, e.g., for user profile, password reset, etc.
router.get('/profile',authMiddleware.authUser,userController.profileController);

router.get('/logout', authMiddleware.authUser, userController.logoutController);

router.get('/getAllUsers', authMiddleware.authUser, userController.getAllUsersController);


export default router;