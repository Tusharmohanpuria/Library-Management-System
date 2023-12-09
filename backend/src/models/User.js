import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        userType: {
            type: String,
            required: true,
        },
        userFullName: {
            type: String,
            required: true,
            unique: true,
        },
        admissionId: {
            type: String,
            maxLength: 15,
            unique: true,
            sparse: true,
        },
        employeeId: {
            type: String,
            maxLength: 15,
            unique: true,
            sparse: true,
        },
        gender: {
            type: String,
        },
        dob: {
            type: Date,
        },
        mobileNumber: {
            type: String,
            required: true,
        },
        photo: {
            type: String,
            default: '',
        },
        email: {
            type: String,
            required: true,
            maxLength: 50,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minLength: 6,
        },
        points: {
            type: Number,
            default: 0,
        },
        activeTransactions: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'BookTransaction',
            },
        ],
        prevTransactions: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'BookTransaction',
            },
        ],
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('User', UserSchema);

