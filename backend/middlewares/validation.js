import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../models/userSchema.js";
dotenv.config()

export const validateEmail = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email' });
  next();
};

export const validateCode = (req, res, next) => {
  const { code } = req.body;
  if (!/^\d{4}$/.test(code)) return res.status(400).json({ message: 'Invalid 4-digit code' });
  next();
};

export const validatePhone = (req, res, next) => {
  const { phoneNumber } = req.body;
  const phoneRegex = /^\+[1-9]\d{1,14}$/; // E.164 format
  if (!phoneRegex.test(phoneNumber)) return res.status(400).json({ message: 'Invalid phone number' });
  next();
};

export const validateProfile = (req, res, next) => {
  const { firstName, lastName, profilePicture, dateOfBirth } = req.body;
  if (!firstName || !lastName || !profilePicture || !dateOfBirth ) {
    return res.status(400).json({ message: 'All profile fields are required' });
  }
  next();
};



export const validatePassword = (req, res, next) => {
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  next();
};



export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) return res.status(401).json({error: 'Access denied'})


      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
      } catch (error) {
         console.log(error)
        res.status(403).json({ error: 'Invalid or expired token' });
      }
}


// Helper to generate JWT
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};



export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'Not authorized, user not found' });
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};