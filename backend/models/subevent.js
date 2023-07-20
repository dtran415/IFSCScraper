const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../db.js");
const Event = require("./event.js");

class SubEvent extends Model { }

SubEvent.init({
    // Using IFSC types: BOULDER Men, LEAD Women, etc
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    dCatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    sequelize,
    modelName: 'SubEvent',
    indexes: [
        {
            unique: true,
            fields: ['dCatId', 'EventId']
        }
    ]
})

SubEvent.Event = SubEvent.belongsTo(Event);
Event.hasMany(SubEvent);

module.exports = SubEvent;