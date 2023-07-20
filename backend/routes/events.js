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
        return res.json({events});
    } catch (err) {
        return next(err);
    }
});

router.get("/:eventId/:catId", async function(req, res, next) {
    try {
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

        return res.json({overallResults});
    } catch (err) {
        return next(err);
    }
});

module.exports = router;