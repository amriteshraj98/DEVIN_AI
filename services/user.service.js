import userModel from '../models/user.model.js';

export  const createUser = async (email,password) => {
   
    if (!email || !password) {
        throw new Error('Email and password are required');
    }
    const hashedPassword = await userModel.hashPassword(password);
    const user = new userModel({
        email,
        password: hashedPassword,
    });
    await user.save();
    return user;
        
}
const userService = {
    createUser,
};

export const getAllUsers = async ({userId}) => {
    try {
        const users = await userModel.find({
            _id: { $ne: userId } // Exclude the current user
        }).select('-password'); // Exclude password from the response
        return users;
    } catch (error) {
        throw new Error('Error fetching users: ' + error.message);
    }
};

export default userService;
