const express = require("express");
const router = new express.Router();
const Event = require("../models/event");
const SubEvent = require("../models/subevent");
const OverallResult = require("../models/overall_result");
const Athlete = require("../models/athlete");
const ScrapeTracker = require("../models/scrape_tracker");
const { sequelize } = require("../db");
const ExpressError = require("../expressError");

// list all events in date descending order
router.get("/", async function(req, res, next) {
    try {
        const events = await Event.findAll({
            order: [['dateStart', 'DESC']],
            include: [{
                model: SubEvent,
                attributes: ['type', 'dCatId']
            }, {
                attributes: [],
                model: ScrapeTracker,
                where: {
                    type: "overall_result",
                    ifscId2: sequelize.literal("\"ScrapeTracker\".\"ifscId2\" = \"SubEvents\".\"dCatId\"") // couldn't figure out how to reference another column so using this weird workaround
                    // joining with ifscId2 so we only show events that completed
                }
            }]
        });


        const processedEvents = [];

        for ( let event of events) {
            // skip events with no subevents
            if (event.SubEvents.length === 0)
                continue;

            processedEvents.push({
                id: event.id,
                title: event.title,
                dateStart: event.dateStart,
                dateEnd: event.dateEnd,
                SubEvents: event.SubEvents
            })
        }
        
        return res.json({events: processedEvents});
    } catch (err) {
        return next(err);
    }
});

router.get("/:eventId/:catId", async function(req, res, next) {
    try {
        const event = await Event.findOne({
            where: {
                id: req.params.eventId
            }
        });

        if (!event) {
            throw new ExpressError("Event not found", 404);
        }

        const overallResults = await OverallResult.findAll({
            include: [{
                model: SubEvent,
                where: {
                    dCatId: req.params.catId,
                    EventId: req.params.eventId
                },
                order: [['rank', 'ASC']]
            }, Athlete],
            order: [['rank', 'ASC']]
        });

        if (overallResults.length === 0) {
            throw new ExpressError("Results not found", 404);
        }

        return res.json({title: event.title, subtitle:overallResults[0].SubEvent.type ,overallResults});
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

module.exports = router;