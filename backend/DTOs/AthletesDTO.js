class AthletesDTO {
    id;
    firstName;
    lastName;
    gender;
    medals;
    country;

    constructor() {
        this.medals = {
            bronze: 0,
            silver: 0,
            gold: 0,
            total: 0
        };
        this.country = {
            code: null
        }
    }

    addAthleteData(athleteData) {
        this.id = athleteData.athleteId;
        this.firstName = athleteData.firstName;
        this.lastName = athleteData.lastName;
        this.gender = athleteData.gender;
        this.country.code = athleteData.Country.code;
    }

    addMedalData(medalData) {
        this.medals.bronze = +medalData.bronze;
        this.medals.silver = +medalData.silver;
        this.medals.gold = +medalData.gold;
        this.medals.total = this.medals.bronze + this.medals.silver + this.medals.gold;
    }
}

module.exports = AthletesDTO;