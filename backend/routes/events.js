const express = require("express");
const router = new express.Router();
const Event = require("../models/event");
const SubEvent = require("../models/subevent");
const OverallResult = require("../models/overall_result");
const Athlete = require("../models/athlete");
const ScrapeTracker = require("../models/scrape_tracker");

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
                    type: "event"
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

        return res.json({title: event.title, overallResults});
    } catch (err) {
        return next(err);
    }
});

module.exports = router;