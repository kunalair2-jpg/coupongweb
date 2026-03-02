const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Vendor = require('./Vendor');

const Coupon = sequelize.define('Coupon', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, defaultValue: 'percentage' },
    discountValue: { type: DataTypes.INTEGER, allowNull: false },
    validFrom: { type: DataTypes.DATEONLY, allowNull: false },
    expiresOn: { type: DataTypes.DATEONLY, allowNull: false },
    category: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    locality: { type: DataTypes.STRING }, // Added Locality
    status: { type: DataTypes.ENUM('active', 'expired', 'pending'), defaultValue: 'pending' },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    redemptions: { type: DataTypes.INTEGER, defaultValue: 0 }
});

// Relations
Vendor.hasMany(Coupon, { foreignKey: 'vendorId' });
Coupon.belongsTo(Vendor, { foreignKey: 'vendorId' });

module.exports = Coupon;
