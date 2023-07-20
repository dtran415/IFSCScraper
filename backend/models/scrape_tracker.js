const { Model, DataTypes, INTEGER } = require("sequelize");
const {sequelize} = require("../db.js");

class ScrapeTracker extends Model {}

ScrapeTracker.init({
    // level: calendar, event, overall_result, subevent
    type: {
        type: DataTypes.STRING
    },
    ifscId: {
        type: DataTypes.INTEGER
    },
    ifscId2: {
        type: DataTypes.INTEGER
    }
}, {
    sequelize,
    modelName: 'ScrapeTracker',
    indexes: [
        {
            unique: true,
            fields: ['ifscId', 'ifscId2']
        }
    ]
})

module.exports = ScrapeTracker;