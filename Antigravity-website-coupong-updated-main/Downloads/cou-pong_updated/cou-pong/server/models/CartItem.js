const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Coupon = require('./Coupon');
const User = require('./User');

const CartItem = sequelize.define('CartItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    couponId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
});

CartItem.belongsTo(Coupon, { foreignKey: 'couponId' });
CartItem.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(CartItem, { foreignKey: 'userId' });

module.exports = CartItem;
