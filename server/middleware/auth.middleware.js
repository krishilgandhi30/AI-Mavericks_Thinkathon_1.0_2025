import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config();

export const Authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded
        
        next();

    } catch (error) {
        res.status(401).json({message: "Token is not valid!"})
    }
}