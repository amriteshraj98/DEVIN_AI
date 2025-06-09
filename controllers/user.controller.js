import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';

export const createUser = async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const user = await userService.createUser(req.body.email, req.body.password);
        const token = await user.generateJWT();
        delete user.password; // Remove password from the response for security
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user._id,
                email: user.email,
                createdAt: user.createdAt,
            },
            token: token,
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

    
}

export const loginController = async (req, res) => {
    const { email, password } = req.body;

    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await user.isValidPassword(password);
         // Check if the password is valid
         // Note: The method isValidPassword should be defined in the user model
         // and should compare the input password with the stored hashed password.
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = user.generateJWT();
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                createdAt: user.createdAt,
            },
            token: token,
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const profileController = async (req, res) => {
    console.log(req.user);
    res.status(200).json({
        id: req.user.id,
        email: req.user.email,
        createdAt: req.user.createdAt,
    });
}

export const logoutController = async (req, res) => {
    try{
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        redisClient.set(token, 'logout', 'EX', 60*60*24);
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getAllUsersController = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const users = await userService.getAllUsers({userId: loggedInUser._id});
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json({
            users: users,
            message: "Users fetched successfully"
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}