import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        require: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
    reviewText: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

export default mongoose.model("Review", ReviewSchema);


