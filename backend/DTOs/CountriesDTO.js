class CountriesDTO{
    code;
    numAthletes;
    medals;

    constructor() {
        this.medals = {
            bronze: 0,
            silver: 0,
            gold: 0,
            total: 0
        };
    }
}