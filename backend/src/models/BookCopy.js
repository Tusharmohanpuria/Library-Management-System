import mongoose from "mongoose";

const BookCopySchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: true,
    },
    copyId: {
        type: Number,
        required: true,
        unique: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    qrCode: {
        type: String,
    },
}, {
    timestamps: true,
});

export default mongoose.model("BookCopy", BookCopySchema);


