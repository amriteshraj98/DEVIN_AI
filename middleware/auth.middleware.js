import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async (req,res,next) => {
    try{
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const isBlacklisted = await redisClient.get(token); // Check if token is blacklisted in Redis
        if (isBlacklisted) {
            res.cookie("token", "", { maxAge: 1, httpOnly: true }); // Clear the cookie if token is blacklisted
            return res.status(401).json({ message: "Unauthorized user" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        req.user = decoded; // Attach user info to request object
        next(); // Proceed to the next middleware or route handler
       

    }
    catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
}