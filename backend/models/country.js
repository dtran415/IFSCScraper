const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../db.js");

class Country extends Model {}

Country.init({
    code: {
        type: DataTypes.STRING,
        primaryKey: true
    }
}, {
    sequelize,
    modelName: 'Country'
})

module.exports = Country;