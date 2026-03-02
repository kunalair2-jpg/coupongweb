const sequelize = require('../config/database');
const User = require('./User');
const Vendor = require('./Vendor');
const Coupon = require('./Coupon');
const Order = require('./Order');
const CartItem = require('./CartItem');

// Relations (Defined in files, but ensuring export)

const syncDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await sequelize.sync({ alter: true }); // Automatically creates tables
        console.log('Database synced.');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
};

module.exports = {
    sequelize,
    syncDB,
    User,
    Vendor,
    Coupon,
    Order,
    CartItem
};
