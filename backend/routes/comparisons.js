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

        // get events
        const events = await Event.findAll();

        // get athletes
        const athletes = await Athlete.findAll({
            where: {
                id: { [Op.in]: ids }
            }
        })

        const rankings = await OverallResult.findAll({
            include: {
                model: SubEvent,
                include: [Event]
            },
            where: {
                AthleteId: { [Op.in]: ids }
            }
        })

        // create a map for event look up
        const eventsMap = {};
        for (let event of events) {
            eventsMap[event.id] = { title: event.title, date: event.dateStart };
        }

        const athleteData = {};
        // loop through each athlete and create data for graphs
        for (let athlete of athletes) {
            let athleteObj = {
                id: athlete.id,
                firstName: athlete.firstName,
                lastName: athlete.lastName,
                country: athlete.CountryCode,
                rankings: []
            };
            athleteData[athlete.id] = athleteObj;
        }

        for (let ranking of rankings) {
            let rankingObj = {
                rank: ranking.rank,
                type: ranking.SubEvent.type,
                eventId: ranking.SubEvent.Event.id
            }

            athleteData[ranking.AthleteId].rankings.push(rankingObj);
        }

        return res.json({ events: eventsMap, athletes: athleteData });
    } catch (err) {
        return next(err);
    }


});

module.exports = router;