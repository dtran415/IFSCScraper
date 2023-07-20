const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../db.js");
const ScrapeTracker = require("./scrape_tracker.js");

class Event extends Model {}

Event.init({
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    dateStart: {
        type: DataTypes.DATE
    },
    dateEnd: {
        type: DataTypes.DATE
    }

}, {
    sequelize,
    modelName: 'Event'
})

Event.belongsTo(ScrapeTracker, {foreignKey: 'id', targetKey: 'ifscId'});
ScrapeTracker.belongsTo(Event, {foreignKey: 'ifscId'});

module.exports = Event;