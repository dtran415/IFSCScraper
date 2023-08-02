const express = require("express");
const router = new express.Router();
const Event = require("../models/event");
const SubEvent = require("../models/subevent");
const OverallResult = require("../models/overall_result");
const Athlete = require("../models/athlete");
const Country = require("../models/country");
const { sequelize } = require("../db");
const { Op } = require("sequelize");
const ExpressError = require("../expressError");
const ComparisonsAthleteDTO = require("../DTOs/ComparisonsAthleteDTO");

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

router.get('/athletes', async (req, res, next) => {
    try {
        const ids = req.query.ids.split(",").map(id => +id);
        if (ids.length === 0)
            throw ExpressError("Please supply athlete ids to compare");

        // get athletes
        const athletes = await Athlete.findAll({
            attributes: ['id', 'firstName', 'lastName'],
            where: {
                id: { [Op.in]: ids }
            },
            include: {
                attributes: ['rank'],
                model: OverallResult,
                include: {
                    attributes: ['type'],
                    model: SubEvent,
                    include: {
                        attributes: ['id', 'title', 'dateStart'],
                        model: Event
                    }
                }
            }
        })

        const output = new ComparisonsAthleteDTO();
        for (let athlete of athletes) {
            const athleteDTO = new ComparisonsAthleteDTO.Athlete();
            athleteDTO.id = athlete.id;
            athleteDTO.firstName = athlete.firstName;
            athleteDTO.lastName = athlete.lastName;

            for (let result of athlete.OverallResults) {
                const resultDTO = new ComparisonsAthleteDTO.Athlete.Result();
                resultDTO.rank = result.rank;
                resultDTO.eventId = result.SubEvent.Event.id;
                resultDTO.eventTitle = result.SubEvent.Event.title;
                resultDTO.date = result.SubEvent.Event.dateStart;
                resultDTO.type = result.SubEvent.type;
                athleteDTO.results.push(resultDTO);
            }

            output.athletes.push(athleteDTO);
        }

        return res.json(output);
    } catch (err) {
        return next(err);
    }


});

module.exports = router;