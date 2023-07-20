const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../db.js");
const Country = require('./country.js');

class Athlete extends Model {}

Athlete.init({
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    height: {
        type: DataTypes.FLOAT
    },
    gender: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'Athlete'
})

Athlete.Country = Athlete.belongsTo(Country);

module.exports = Athlete;