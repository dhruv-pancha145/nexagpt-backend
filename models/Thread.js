import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {  // स्पेलिंग मिस्टेक (timestemp) को भी यहाँ ठीक कर दिया है
    type: Date,
    default: Date.now
  },
});

const ThreadsSchema = new mongoose.Schema({
    // 1. यहाँ हमने थ्रेड को User Model की ID से लिंक कर दिया है
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    threadId: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        default: "New Chat",
    },
    messages: [MessageSchema],
}, { timestamps: true });

export default mongoose.model("Thread", ThreadsSchema);