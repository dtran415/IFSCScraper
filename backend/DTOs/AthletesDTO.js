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
            gold: 0
        };
        this.country = {
            code: null
        }
    }
}

module.exports = AthletesDTO;