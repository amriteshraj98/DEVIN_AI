import {Router } from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import  * as authMiddleware  from '../middleware/auth.middleware.js';
import mongoose from 'mongoose';
const router = Router();

router.post('/create',
    authMiddleware.authUser, // Middleware to authenticate user
    body('name').isString().withMessage('Project name is required'),
    projectController.createProject
);
router.get('/getAll',
    authMiddleware.authUser, // Middleware to authenticate user
    projectController.getAllProjects
);

router.put('/add-user',
    authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    projectController.addUserToProject
);

router.get('/getProjectById/:projectId',
    authMiddleware.authUser,
    (req, res, next) => {
        const { projectId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }
        next();
    },
    projectController.getProjectById
);

router.put('/update-file-tree',
    authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree must be an object'),
    projectController.updateFileTree
);



export default router;