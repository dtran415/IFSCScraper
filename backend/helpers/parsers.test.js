process.env.NODE_ENV = "test";
const { connect, sync } = require('../db.js');
const { parseCalendar, parseEvents, parseOverall, parseSubEvent } = require("./parsers");
const ScrapeTracker = require("../models/scrape_tracker.js");
const OverallResult = require('../models/overall_result.js');
const Event = require("../models/event.js");
const SubEvent = require("../models/subevent.js");

beforeEach(async () => {
    await connect();
    await sync({ force: true });
});

describe("parseCalendar", function () {
    it('should return a list of league ids to parse', async () => {
        const seasonsToParse = await parseCalendar();
        expect(seasonsToParse.length).toBeTruthy();
    });

    it('should skip a season that was parsed', async () => {
        // 404 is 2022 season
        await ScrapeTracker.create({
            type: "calendar",
            ifscId: 404
        });

        const seasonsToParse = await parseCalendar();
        expect(seasonsToParse).not.toContain(404);
    });
});

describe("parseEvent", function () {
    it('should return list of subevents of parse', async () => {
        // 418 is 2023 season
        const eventsToparse = await parseEvents(418);
        expect(eventsToparse.length).toBeTruthy();
    });
});

describe("parseOverall", function () {
    it("should parse rankings for an event", async () => {
        const eventId = 1291;
        const dCatId = 3;

        // create Event
        await Event.create({
            id: eventId,
            title: "test event"
        });

        await SubEvent.create({
            type: "boulder",
            dCatId,
            EventId: eventId
        });

        await parseOverall(eventId, dCatId);

        const records = await OverallResult.findAll({
            include: {
                model: SubEvent,
                where: {
                    dCatId
                },
                include: {
                    model: Event,
                    where: {
                        id: eventId
                    }
                }
            }
        });
        expect(records.length).toBeTruthy();
    })
});