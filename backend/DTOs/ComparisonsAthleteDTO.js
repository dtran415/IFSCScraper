class ComparisonsAthleteDTO {
    athletes;

    constructor() {
        this.athletes = [];
    }
}

ComparisonsAthleteDTO.Athlete = class {
    id;
    firstName;
    lastName;
    results;

    constructor() {
        this.results = [];
    }
}

ComparisonsAthleteDTO.Athlete.Result = class {
    rank;
    eventId;
    eventTitle;
    date;
    type;
}

module.exports = ComparisonsAthleteDTO;