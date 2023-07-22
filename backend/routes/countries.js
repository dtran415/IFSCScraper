const express = require("express");
const router = new express.Router();
const OverallResult = require("../models/overall_result");
const Athlete = require("../models/athlete");
const Country = require("../models/country");
const { sequelize } = require("../db");

// list all countries
router.get("/", async function (req, res, next) {
    try {
        const medalsResult = await OverallResult.findAll({
            attributes: [[sequelize.literal('COUNT(CASE WHEN rank=1 THEN 1 END)'), 'gold'], [sequelize.literal('COUNT(CASE WHEN rank=2 THEN 1 END)'), 'silver'],
            [sequelize.literal('COUNT(CASE WHEN rank=3 THEN 1 END)'), 'bronze'],
            [sequelize.fn('COUNT', sequelize.col('Athlete.id')), 'numAthletes']],
            raw: true,
            order: [
                ['gold', 'DESC'],
                ['silver', 'DESC'],
                ['bronze', 'DESC']
            ],
            group: ['Athlete->Country.code'],
            include: [{
                model: Athlete,
                attributes: [],
                include: [{model: Country, attributes:["code"]}]
            }],
        });

        return res.json({ medalsResult });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;