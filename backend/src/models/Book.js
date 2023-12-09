import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
    bookName: {
        type: String,
        required: true,
    },
    alternateTitle: {
        type: String,
        default: "",
    },
    author: {
        type: String,
        required: true,
    },
    publisher: {
        type: String,
        default: "",
    },
    bookCountAvailable: {
        type: Number,
        required: true,
    },
    bookStatus: {
        type: String,
        default: "Available",
    },
    noofpages: {
        type: Number,
        required: true,
    },
    coverpage: {
        type: String,
    },
    description: {
        type: String, 
    },
    ISBN: {
        isbn10: {
            type: String,
            required: true,
            unique: true,
        },
        isbn13: {
            type: String,
            required: true,
            unique: true,
        },
    },
    categories: [
        {
            type: mongoose.Types.ObjectId,
            ref: "BookCategory",
        },
    ],
    transactions: [
        {
            type: mongoose.Types.ObjectId,
            ref: "BookTransaction",
        },
    ],
    reviews: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Review",
        },
    ],
    copies: [
        {
            type: mongoose.Types.ObjectId,
            ref: "BookCopy",
        },
    ],
}, {
    timestamps: true
});

export default mongoose.model("Book", BookSchema);


