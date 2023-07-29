const express = require("express");
const router = new express.Router();
const Event = require("../models/event");
const SubEvent = require("../models/subevent");
const OverallResult = require("../models/overall_result");
const Athlete = require("../models/athlete");
const Country = require("../models/country");
const ExpressError = require("../expressError");
const { sequelize } = require("../db");
const AthletesDTO = require("../DTOs/AthletesDTO");
const AthleteDTO = require("../DTOs/AthleteDTO");

// list all athletes
router.get("/", async function (req, res, next) {
    try {
        // map to aggregate athlete data, athleteId is the key
        const athletesMap = new Map();

        const athletesResult = await Athlete.findAll({
            order: [['lastName', 'ASC']],
            include: [Country]
        });

        for (let athleteData of athletesResult) {
            const athleteId = athleteData.id;
            const athlete = new AthletesDTO();
            athletesMap.set(athleteId, athlete);
            athlete.addAthleteData(athleteData);
        }

        const medalsResult = await OverallResult.findAll({
            Athlete,
            attributes: [[sequelize.literal('COUNT(CASE WHEN rank=1 THEN 1 END)'), 'gold'], [sequelize.literal('COUNT(CASE WHEN rank=2 THEN 1 END)'), 'silver'],
            [sequelize.literal('COUNT(CASE WHEN rank=3 THEN 1 END)'), 'bronze'],
            [sequelize.literal('COUNT(CASE WHEN rank in (1,2,3) THEN 1 END)'), 'total']
        ],
            raw: true,
            order: [
                ['total', 'DESC']
            ],
            group: ['Athlete.id'],
            include: [Athlete],
        });

        for (let result of medalsResult) {
            const athlete = athletesMap.get(result['Athlete.id']);

            if (!athlete)
                continue;

            athlete.addMedalData(result);
        }

        const athletes = [];

        for (let value of athletesMap.values()) {
            athletes.push(value);
        }

        return res.json({ athletes });
    } catch (err) {
        return next(err);
    }
});

router.get("/:athleteId", async function (req, res, next) {
    try {
        const athleteId = +req.params.athleteId;
        if (!Number.isInteger(athleteId))
            throw new ExpressError("Invalid Athlete");

        const athlete = await Athlete.findOne({
            where: {
                id: athleteId
            }
        });

        if (!athlete) {
            throw new ExpressError("Invalid Athlete");
        }

        // get all event rankings for athlete
        const rankings = await OverallResult.findAll({
            include: [{
                attributes: [],
                model: Athlete,
                where: {
                    id: athleteId
                }
            }, {
                model: SubEvent,
                include: {
                    model: Event
                }
            }],
            order: [[sequelize.col('SubEvent->Event.dateStart'), 'DESC']]
        });

        const athleteData = new AthleteDTO(athlete);
        athleteData.addRankings(rankings);

        return res.json({ athlete: athleteData });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;