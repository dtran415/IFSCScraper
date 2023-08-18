process.env.NODE_ENV = "test";
const { connect, sync } = require('../db.js');
const ScrapeTracker = require("../models/scrape_tracker.js");
const OverallResult = require('../models/overall_result.js');
const Event = require("../models/event.js");
const SubEvent = require("../models/subevent.js");
const Country = require('../models/country.js');
const Athlete = require('../models/athlete.js');
const request = require('supertest');
const app = require('../app.js');

async function setupDB() {
    await Country.bulkCreate([
        { code: 'USA' },
        { code: 'FRA' }
    ]);

    await Athlete.bulkCreate([
        { id: 1, firstName: 'Brooke', lastName: 'Raboutou', CountryCode: 'USA', gender: 'female' },
        { id: 2, firstName: 'Colin', lastName: 'Duffy', CountryCode: 'USA', gender: 'male' },
        { id: 3, firstName: 'Oriane', lastName: 'Bertone', CountryCode: 'FRA', gender: 'female' },
        { id: 4, firstName: 'Mejdi', lastName: 'Schalck', CountryCode: 'FRA', gender: 'male' },
        { id: 5, firstName: 'Sean', lastName: 'Bailey', CountryCode: 'USA', gender: 'male' }
    ]);

    await Event.bulkCreate([
        { id: 1, title: 'IFSC - Climbing World Cup (B) - Hachioji (JPN) 2023', dateStart: '2023-04-21', dateEnd: '2023-04-23' },
        { id: 2, title: 'IFSC - Climbing World Cup (L,S) - Villars (SUI) 2023', dateStart: '2023-06-30', dateEnd: '2023-07-01' }
    ]);

    await SubEvent.bulkCreate([
        { id: 1, EventId: 1, type: 'BOULDER MEN', dCatId: 3 },
        { id: 2, EventId: 1, type: 'BOULDER WOMEN', dCatId: 7 },
        { id: 3, EventId: 2, type: 'LEAD MEN', dCatId: 1 },
        { id: 4, EventId: 2, type: 'LEAD WOMEN', dCatId: 5 }
    ]);

    await OverallResult.bulkCreate([
        { SubEventId: 1, AthleteId: 4, rank: 1 },
        { SubEventId: 1, AthleteId: 2, rank: 2 },
        { SubEventId: 1, AthleteId: 5, rank: 3 },
        { SubEventId: 2, AthleteId: 3, rank: 1 },
        { SubEventId: 2, AthleteId: 1, rank: 2 },
        { SubEventId: 3, AthleteId: 2, rank: 1 },
        { SubEventId: 3, AthleteId: 4, rank: 2 },
        { SubEventId: 4, AthleteId: 1, rank: 1 },
        { SubEventId: 4, AthleteId: 3, rank: 2 }
    ]);

    await ScrapeTracker.bulkCreate([
        { type: 'overall_result', ifscId: 1, ifscId2: 3 },
        { type: 'overall_result', ifscId: 1, ifscId2: 7 },
        { type: 'overall_result', ifscId: 2, ifscId2: 1 },
        { type: 'overall_result', ifscId: 2, ifscId2: 5 }
    ]);
}

beforeEach(async () => {
    await connect();
    await sync({ force: true });
    await setupDB();
});

describe("GET /events", () => {
    it("should return a list of events ordered by date descending", async () => {
        await request(app)
            .get('/events')
            .expect(200)
            .expect((res) => {
                const events = res.body.events;
                expect(events.length).toBe(2);
                // check the dates are descending
                expect(new Date(events[0].dateStart).getTime()).toBeGreaterThan(new Date(events[1].dateStart).getTime());
                expect(events[0].SubEvents.length).toEqual(2);
            })
    })
});

describe("GET /events/:eventId/:catId", () => {
    it("should return a list of results by rank descending", async () => {
        await request(app)
            .get('/events/2/1')
            .expect(200)
            .expect((res) => {
                const overallResults = res.body.overallResults;
                expect(overallResults.length).toBe(2);
                // check the ranks are descending
                expect(overallResults[0].rank).toBeLessThan(overallResults[1].rank);
            })
    });

    it("should return 404 if event id exists but dCatId doesn't", async () => {
        await request(app)
            .get('/events/2/999')
            .expect(404);
    });

    it("should return 404 both event id and dCatId does not exist", async () => {
        await request(app)
            .get('/events/999/999')
            .expect(404);
    });
});

describe("GET /athletes", () => {
    it("should return a list of all athletes", async () => {
        await request(app)
            .get('/athletes')
            .expect(200)
            .expect((res) => {
                const athletes = res.body.athletes;
                expect(athletes.length).toBe(5);
                // find athlete id 1
                const athlete1 = athletes.find(athlete => athlete.id === 1);
                expect(athlete1.medals.gold).toBe(1);
                expect(athlete1.medals.total).toBe(2);
            })
    })
});

describe("GET /athletes/:athleteId", () => {
    it("should return athlete details", async () => {
        await request(app)
            .get('/athletes/2')
            .expect(200)
            .expect((res) => {
                const athlete = res.body.athlete;
                expect(athlete.id).toBe(2);
                expect(athlete.medals.boulder.silver).toBe(1);
                expect(athlete.medals.boulder.gold).toBe(0);
                expect(athlete.medals.lead.silver).toBe(0);
                expect(athlete.medals.lead.gold).toBe(1);
                expect(athlete.results.length).toBe(2);
                // expect results to be in date descending
                const date1 = new Date(athlete.results[0].date).getTime();
                const date2 = new Date(athlete.results[1].date).getTime();
                expect(date1).toBeGreaterThan(date2);
            })
    });
    it("should return 404 if athlete not found", async () => {
        await request(app)
            .get('/athletes/999')
            .expect(404);
    });
    it("should return 400 if athlete ID is not an integer", async () => {
        await request(app)
            .get('/athletes/aaa')
            .expect(400);
    });
});

describe("GET /compare/athletes", () => {
    it("should return a list of athletes that are being compared", async () => {
        await request(app)
            .get('/compare/athletes?ids=1,2')
            .expect(200)
            .expect((res) => {
                const athletes = res.body.athletes;
                expect(athletes.length).toBe(2);
                expect(athletes[0].results.length).toBe(2);
                expect(athletes[1].results.length).toBe(2);
            })
    });

    it("should skip athlete ids that are not found", async () => {
        await request(app)
            .get('/compare/athletes?ids=1,2,999')
            .expect(200)
            .expect((res) => {
                const athletes = res.body.athletes;
                expect(athletes.length).toBe(2);
                expect(athletes[0].results.length).toBe(2);
                expect(athletes[1].results.length).toBe(2);
            })
    });

    it("should also skip athlete id that are not integers", async () => {
        await request(app)
            .get('/compare/athletes?ids=1,2,abc')
            .expect(200)
            .expect((res) => {
                const athletes = res.body.athletes;
                expect(athletes.length).toBe(2);
                expect(athletes[0].results.length).toBe(2);
                expect(athletes[1].results.length).toBe(2);
            })
    });

    it("should return 400 if no ids supplied", async () => {
        await request(app)
            .get('/compare/athletes?ids=')
            .expect(400);
    });

    it("should return 400 if all non integer ids supplied", async () => {
        await request(app)
            .get('/compare/athletes?ids=a,b,c')
            .expect(400);
    });
});

describe("GET /countries", () => {
    it("should return a list of countries", async () => {
        await request(app)
            .get('/countries')
            .expect(200)
            .expect((res) => {
                const countries = res.body.countries
                expect(countries.length).toBe(2);
                // expect order by total medals descending
                expect(countries[0].medals.total).toBeGreaterThan(countries[1].medals.total);
            })
    })
});