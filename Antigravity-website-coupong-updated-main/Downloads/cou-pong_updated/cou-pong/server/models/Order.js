const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const { Sequelize } = require('sequelize');

const Order = sequelize.define('Order', {
    id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    items: { type: DataTypes.TEXT, allowNull: false }, // Stores JSON array of items { couponId, title, price, qty }
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'completed'), defaultValue: 'pending' },
    paymentStatus: { type: DataTypes.STRING, defaultValue: 'unpaid' },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
});

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

module.exports = Order;
