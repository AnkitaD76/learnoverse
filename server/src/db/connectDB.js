import mongoose from 'mongoose';
const connectDB = url => {
  return mongoose
    .connect(url)
    .then(() => {
      console.log('✅ Connected to MongoDB successfully');
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err);
      process.exit(1);
    });
};

export default connectDB;
