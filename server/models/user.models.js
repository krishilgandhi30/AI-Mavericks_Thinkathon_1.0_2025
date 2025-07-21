import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    // Profile Information
    fullName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        default: ''
    },
    createdAt: { type: Date, default: Date.now },

    // Role
    role: {
        type: String,
        enum: ['patient', 'doctor'],
        default: 'patient'
    },
    
    // Doctor specific fields
    specialization: { 
        type: String, 
        default: '',
        enum: ['', 'General Medicine', 'Cardiology', 'Endocrinology', 'Nephrology', 'Hematology', 'Other']
    },
    licenseNumber: { type: String, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    
    // Patient specific fields
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    medicalHistory: [{ type: String }],

    resetPasswordToken: String,
    resetPasswordExpires: Date

}, { timestamps: true,   collection: 'users'   // ← force it to use the singular collection
 })

userSchema.pre("save", async function (next) {
    // only hash if it's new or modified
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next()
    } catch (error) {
        next(error)
    }
})

const User = mongoose.model('User', userSchema)
export default User;