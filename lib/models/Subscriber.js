import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      index: true,
    },
    formattedDate: {
      type: String,
      default: '',
    },
    formattedTime: {
      type: String,
      default: '',
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailLog: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    ip: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent recompilation of model across hot reloads in Next.js development
const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);

export default Subscriber;
