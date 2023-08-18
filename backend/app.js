const express = require('express');

const ExpressError = require("./expressError.js");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const eventRoutes = require("./routes/events.js");
const athleteRoutes = require("./routes/athletes.js");
const countryRoutes = require("./routes/countries.js");
const comparisonRoutes = require("./routes/comparisons.js");

const { parseAll } = require("./helpers/parsers.js");

app.use("/events", eventRoutes);
app.use("/athletes", athleteRoutes);
app.use("/countries", countryRoutes);
app.use("/compare", comparisonRoutes);

/** 404 handler */

app.get("/", (req, res, next) => {
    return res.json({msg: "Go to /parse to scrape for data"})
});

app.get("/parse", async (req, res, next) => {
    const output = await parseAll();
    return res.json(output);
});

app.use(function (req, res, next) {
    const err = new ExpressError("Not Found", 404);
    return next(err);
});


/** general error handler */

app.use(function (err, req, res, next) {
    res.status(err.status || 500);

    return res.json({
        error: err,
        message: err.message
    });
});

module.exports = app;