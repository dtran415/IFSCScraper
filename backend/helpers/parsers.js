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
async function parseEvents(leagueId) {
    if (!leagueId)
        throw Error("No league ID");

    const eventsToParse = [];
    // event is the main event, ie. IFSC - Climbing World Cup (B) - Hachioji (JPN) 2023
    const scrapedEventSet = await getScrapedSet("event");
    // subevent is individual groups, ie. BOULDER Men
    const scrapedSubEventSet = await getScrapedSet("subevent");
    // we'll use eventid_dcatid as identifier for overall result ifsc id
    const scrapedOverallSet = await getScrapedSet("overall_result");

    console.log(scrapedOverallSet);

    const url = `https://components.ifsc-climbing.org/results-api.php?api=season_leagues_calendar&league=${leagueId}`;
    let resp = await axios.get(url);
    const data = resp.data;
    for (let event of data.events) {
        const eventId = event.event_id;
        // skip if already scraped
        if (scrapedEventSet.has(eventId.toString()))
            continue;

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

        const eventData = {
            eventId,
            overall_results: []
        };

        // check all subevents
        for (let subevent of event.d_cats) {
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

        // if no subevents, consider this event fully scraped and put it in the tracking table
        if (eventData.overall_results.length === 0) {
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
async function parseOverall(eventId, dCatId) {
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
    if (record)
        return;

    const url = `https://components.ifsc-climbing.org/results-api.php?api=overall_r_result_complete&event_id=${eventId}&category_id=${dCatId}`;

    let resp = await axios.get(url);
    const data = resp.data;

    // skip if no data
    if (!data.category_rounds)
        return;

    // make sure all rounds are finished before parsing
    let finished = true;
    for (let round of data.category_rounds) {
        if (round.status !== "finished") {
            finished = false;
            break;
        }
    }

    if (!finished) {
        return;
    }

    const subevent = await SubEvent.findOne({
        where: {
            EventId: eventId,
            dCatId
        }
    });

    if (!subevent)
        return;

    console.log("Parse Overall", eventId, dCatId);

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
    const seasonsToParse = (await parseCalendar()).slice(0,2);

    console.log("seasons", seasonsToParse);
    
    for (let leagueId of seasonsToParse) {
        const eventsToParse = await parseEvents(leagueId);
        console.log("events", JSON.stringify(eventsToParse, null, 2));
        for (let event of eventsToParse) {
            const eventId = event.eventId;

            // parse each overall
            for (let dCatId of event.overall_results) {
                await parseOverall(eventId, dCatId)
            }
        }
    }
}

module.exports = {
    parseCalendar,
    parseEvents,
    parseOverall,
    parseAll
};