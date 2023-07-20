const { Model, DataTypes } = require("sequelize");
const {sequelize} = require("../db.js");
const Athlete = require("./athlete.js");
const SubEvent = require("./subevent.js");

class OverallResult extends Model {}

OverallResult.init({
    rank: {
        type: DataTypes.INTEGER
    },
    qualifierScore: {
        type: DataTypes.STRING
    },
    semifinalScore: {
        type: DataTypes.STRING
    },
    finalScore: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'OverallResult'
})

Athlete.belongsToMany(SubEvent, {through: OverallResult});
SubEvent.belongsToMany(Athlete, {through: OverallResult});
OverallResult.belongsTo(SubEvent);
OverallResult.belongsTo(Athlete);

module.exports = OverallResult;