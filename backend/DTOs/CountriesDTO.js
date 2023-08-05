class CountriesDTO{
    code;
    numAthletes;
    medals;

    constructor(country) {
        this.code = country["Athlete.Country.code"];
        this.numAthletes = +country.numAthletes;
        this.medals = {
            bronze: +country.bronze,
            silver: +country.gold,
            gold: +country.silver,
            total: +country.total
        };
    }
}

module.exports = CountriesDTO;