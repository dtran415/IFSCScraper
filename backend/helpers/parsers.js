const axios = require("axios");
const ScrapeTracker = require("../models/scrape_tracker");
const Event = require("../models/event");
const Athlete = require("../models/athlete");
const Country = require("../models/country");
const OverallResult = require("../models/overall_result");
const SubEvent = require("../models/subevent");

/*
        DCat ID:
        1 LEAD Men
        3 BOULDER Men
        5 LEAD Women
        7 BOULDER Women
    */
const dcatMap = {
    1: ["LEAD Men", "male"],
    3: ["BOULDER Men", "male"],
    5: ["LEAD Women", "female"],
    7: ["BOULDER Women", "female"],
}

// gets scraped set
async function getScrapedSet(type) {
    if (!type)
        throw Error("No type supplied");

    // get all scraped of type
    const scraped = await ScrapeTracker.findAll({
        where: {
            type: type
        }
    })

    // create a set of scraped seasons for O(n) runtime and O(1) lookup
    const scrapedSet = new Set();
    for (let result of scraped) {
        let key = result.ifscId.toString();
        if (result.ifscId2)
            key += "_" + result.ifscId2;
        scrapedSet.add(key);
    }

    return scrapedSet;
}

// return list of seasons to parse
async function parseCalendar() {
    const seasonsToParse = [];
    const url = "https://components.ifsc-climbing.org/results-api.php?api=index";
    let resp = await axios.get(url);
    const data = resp.data;

    const scrapedSet = await getScrapedSet("calendar");

    const currentSeasonId = data.current.id;
    for (let season of data.seasons) {
        // assuming first league is world cup or championships always
        const leagueId = season.leagues[0].id;
        // if current season add regardless
        if (season.id === currentSeasonId) {
            seasonsToParse.push(leagueId);
            continue;
        }

        // if season was not parsed already, add to list
        if (!scrapedSet.has(leagueId.toString()))
            seasonsToParse.push(leagueId);
    }

    return seasonsToParse;
}

// return list of event ids to parse
async function parseEvents(leagueId, output) {
    if (!leagueId)
        throw Error("No league ID");

    const eventsToParse = [];
    // event is the main event, ie. IFSC - Climbing World Cup (B) - Hachioji (JPN) 2023
    const scrapedEventSet = await getScrapedSet("event");

    const url = `https://components.ifsc-climbing.org/results-api.php?api=season_leagues_calendar&league=${leagueId}`;
    let resp = await axios.get(url);
    const data = resp.data;
    for (let event of data.events) {
        const eventId = event.event_id;
        // skip if already scraped
        if (scrapedEventSet.has(eventId.toString())) {
            output.push({ type: "event", id: eventId, status: "previously scraped" });
            continue;
        }

        const eventName = event.event;
        const dateStart = new Date(event.starts_at);
        const dateEnd = new Date(event.ends_at);

        // create event
        await Event.upsert({
            id: eventId,
            title: eventName,
            dateStart,
            dateEnd
        });

        const eventData = await getRoundsToScrape(eventId, event.d_cats);

        // if no subevents, consider this event fully scraped and put it in the tracking table
        if (eventData.overall_results.length === 0) {
            output.push({ type: "event", id: eventId, status: "No subevents to scrape" });
            await ScrapeTracker.create({
                type: "event",
                ifscId: eventId
            });
        } else {
            eventsToParse.push(eventData);
        }
    }

    return eventsToParse;
}

// dCatId is a number system that IFSC uses to identify the event type, ie. 3 = BOULDER men, 7 = BOULDER women
// return true if parsed, the return value will be checked to see if it needs to be rechecked for completed scrape
async function parseOverall(eventId, dCatId, output) {
    if (!eventId || !dCatId) {
        throw new Error("Missing eventId, dCatId");
    }

    const event = await Event.findOne({
        where: {
            id: eventId
        }
    });

    if (!event) {
        throw new Error(`Error finding event with id: ${eventId}`)
    }

    const record = await ScrapeTracker.findOne({
        where: {
            ifscId: eventId,
            ifscId2: dCatId
        }
    });

    // don't parse if already exists
    if (record) {
        output.push({ type: "overall", title: data.event, id: eventId, dCatId, status: "Skipped. Already scraped" })
        return true; // true because already scraped
    }

    const url = `https://components.ifsc-climbing.org/results-api.php?api=overall_r_result_complete&event_id=${eventId}&category_id=${dCatId}`;

    let resp = await axios.get(url);
    const data = resp.data;

    // skip if no data
    if (!data.category_rounds) {
        output.push({ type: "overall", title: data.event, id: eventId, dCatId, status: "Skipped. No rounds" })
        return false; // false so we can check back again next time
    }

    // make sure all rounds are finished before parsing
    let finished = true;
    for (let round of data.category_rounds) {
        if (round.status !== "finished") {
            finished = false;
            break;
        }
    }

    if (!finished) {
        output.push({ type: "overall", title: data.event, id: eventId, dCatId, status: "Skipped. Event not finished." })
        return false;
    }

    const subevent = await SubEvent.findOne({
        where: {
            EventId: eventId,
            dCatId
        }
    });

    // if error creating subevent cancel
    if (!subevent)
        return false;

    console.log("Parse Overall", eventId, dCatId, data.event, data.dcat);

    const gender = dcatMap[dCatId][1];

    for (let athlete of data.ranking) {
        const athleteData = {
            athleteId: athlete.athlete_id,
            firstName: athlete.firstname,
            lastName: athlete.lastname,
            country: athlete.country,
            gender
        }

        const athleteRecord = await createAthlete(athleteData);
        await OverallResult.create({
            rank: athlete.rank,
            AthleteId: athleteRecord.id,
            SubEventId: subevent.id,
            qualifierScore: athlete.rounds[0]?.score,
            semifinalScore: athlete.rounds[1]?.score,
            finalScore: athlete.rounds[2]?.score,
        });
    }

    // add to parsed list so it doesn't parse again
    await ScrapeTracker.create({
        type: "overall_result",
        ifscId: eventId,
        ifscId2: dCatId
    });

    output.push({ type: "overall", title: data.event, subtype: subevent.type, id: eventId, dCatId, status: "Completed" })
    return true;
}

async function createAthlete({ athleteId, firstName, lastName, country, gender }) {

    await Country.upsert({
        code: country
    })

    const athlete = await Athlete.upsert({
        id: athleteId,
        firstName,
        lastName,
        CountryCode: country,
        gender
    })

    return athlete[0];
}

async function parseAll() {
    const output = [];
    const seasonsToParse = await parseCalendar();

    console.log("seasons", seasonsToParse);

    for (let leagueId of seasonsToParse) {
        const eventsToParse = await parseEvents(leagueId, output);
        console.log("events", JSON.stringify(eventsToParse, null, 2));

        // if no events to parse this season is completed
        if (eventsToParse.length === 0) {
            await ScrapeTracker.create({
                type: "calendar",
                ifscId: leagueId
            });

            continue;
        }

        for (let event of eventsToParse) {
            const eventId = event.eventId;

            // boolean to decide if we should check to see if all sub rounds completed scraping
            // default to true, if a round was skipped we should not check
            let check = true;
            // parse each overall
            for (let dCatId of event.overall_results) {
                const parsed = await parseOverall(eventId, dCatId, output)
                if (!parsed)
                    check = false;
            }

            if (check) {
                // check after to see if the event has any rounds left to scrape
                const eventData = await getRoundsToScrape(eventId, event.overall_results);

                // if no subevents, consider this event fully scraped and put it in the tracking table
                if (eventData.overall_results.length === 0) {
                    output.push({ type: "event", id: eventId, status: "Completed" });
                    await ScrapeTracker.create({
                        type: "event",
                        ifscId: eventId
                    });
                }
            }
        }
    }
    return output;
}

async function getRoundsToScrape(eventId, dCats) {
    // we'll use eventid_dcatid as identifier for overall result ifsc id
    const scrapedOverallSet = await getScrapedSet("overall_result");

    const eventData = {
        eventId,
        overall_results: []
    };

    // check all subevents
    for (let subevent of dCats) {
        const dCatId = subevent.id;
        const subeventType = subevent.name;

        // only doing lead and boulder
        if (!dcatMap[dCatId]) {
            continue;
        }

        await SubEvent.upsert({
            EventId: eventId,
            type: subeventType,
            dCatId: dCatId
        });

        if (!scrapedOverallSet.has(`${eventId}_${dCatId}`)) {
            eventData.overall_results.push(dCatId);
        }
    }

    return eventData;
}

module.exports = {
    parseCalendar,
    parseEvents,
    parseOverall,
    parseAll
};