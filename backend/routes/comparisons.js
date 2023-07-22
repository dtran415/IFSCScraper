const express = require("express");
const router = new express.Router();
const Event = require("../models/event");
const SubEvent = require("../models/subevent");
const OverallResult = require("../models/overall_result");
const Athlete = require("../models/athlete");
const Country = require("../models/country");
const { sequelize } = require("../db");
const { Op } = require("sequelize");

router.get("/countries", async function (req, res, next) {
    try {
        // get top 10 countries by medals by default
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
                include: [{ model: Country, attributes: ["code"] }]
            }],
            limit: 10
        });

        const countries = [];
        for (let result of medalsResult) {
            countries.push(result['Athlete.Country.code']);
        }

        console.log(countries);

        // medals by country per event
        const medalsResult2 = await OverallResult.findAll({
            attributes: [[sequelize.literal('COUNT(CASE WHEN rank=1 THEN 1 END)'), 'gold'], [sequelize.literal('COUNT(CASE WHEN rank=2 THEN 1 END)'), 'silver'],
            [sequelize.literal('COUNT(CASE WHEN rank=3 THEN 1 END)'), 'bronze']],
            raw: true,
            order: [
                [sequelize.col('SubEvent->Event.dateStart'), 'DESC']
            ],
            group: ['SubEvent->Event.id', 'Athlete.CountryCode'],
            include: [{
                model: Athlete,
                attributes: ['CountryCode'],
                where: {
                    'CountryCode': {
                        [Op.in]: countries
                    }
                }
            }, {
                model: SubEvent,
                attributes: [],
                include: { model: Event }
            }],
        });

        return res.json({ medals: medalsResult2 })
    } catch (err) {
        return next(err);
    }
});

module.exports = router;