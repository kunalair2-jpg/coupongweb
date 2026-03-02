const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { syncDB } = require('./models'); // DB Sync

const authRoutes = require('./routes/authRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const couponRoutes = require('./routes/couponRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', authRoutes); // /api/signup, /api/login...
app.use('/api/vendor', vendorRoutes); // /api/vendor/coupons...
app.use('/api/coupons', couponRoutes); // /api/coupons...
app.use('/api/cart', cartRoutes); // /api/cart...
app.use('/api/orders', orderRoutes); // /api/orders...

// Root
app.get('/', (req, res) => {
    res.send('Cou-pong Backend API Running...');
});

// Start
const startServer = async () => {
    try {
        await syncDB(); // Sync Database Tables
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
};

startServer();
