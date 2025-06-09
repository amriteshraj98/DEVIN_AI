import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'; // Use bcryptjs for compatibility with Node.js ESM
const userSchema = new mongoose.Schema({
    // username: {
    //     type: String,
    //     required: true,
    //     unique: true,
    // },
    email: {
        type: String,
        required: true,
        unique: true,
        trim : true,
        lowercase: true,
        minLength: [5, 'Email must be at least 5 characters long'],
        maxLength: [50, 'Email must be at most 50 characters long'],

    },
    password: {
        type: String,
        required: true,
        select : false, // Exclude password from queries by default
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.statics.hashPassword = async function (password) {
    const bcrypt = await import('bcrypt');
    const saltRounds = 10;
    return await bcrypt.default.hash(password, saltRounds);
}

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWT = function () {
    return jwt.sign(
        { id: this._id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: '48h' }
    );
}

const User = mongoose.model('user', userSchema);
export default User;