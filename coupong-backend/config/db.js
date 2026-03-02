import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
    if (isConnected) return;

    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('PASTE_YOUR')) {
        console.warn('⚠️  MONGODB_URI not set — running without database (in-memory only)');
        return;
    }

    try {
        await mongoose.connect(uri, {
            dbName: 'coupong',
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        console.log('✅ MongoDB connected:', mongoose.connection.host);
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    }
}

mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('⚠️  MongoDB disconnected');
});

export default mongoose;
