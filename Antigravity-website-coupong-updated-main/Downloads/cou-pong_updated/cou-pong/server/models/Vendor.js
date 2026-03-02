const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Vendor = sequelize.define('Vendor', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    businessName: { type: DataTypes.STRING, allowNull: false },
    ownerName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    approved: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    hooks: {
        beforeCreate: async (vendor) => {
            if (vendor.password) {
                vendor.password = await bcrypt.hash(vendor.password, 10);
            }
        }
    }
});

Vendor.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = Vendor;
