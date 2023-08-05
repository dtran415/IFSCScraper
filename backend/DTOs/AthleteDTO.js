// data for single athlete
class AthleteDTO {
    id;
    firstName;
    lastName;
    gender;
    country;
    medals;
    results; // {rank, eventTitle, date, type, qualifierScore, semifinalScore, finalScore}

    constructor(athlete) {
        this.id = athlete.id;
        this.firstName = athlete.firstName;
        this.lastName = athlete.lastName;
        this.gender = athlete.gender;
        this.country = athlete.CountryCode;

        this.medals = {
            boulder: {
                bronze: 0,
                silver: 0,
                gold: 0
            },
            lead: {
                bronze: 0,
                silver: 0,
                gold: 0
            }
        }
        this.results = [];
    }

    addRankings(rankings) {
        for (let ranking of rankings) {
            const rankingObj = {
                rank: ranking.rank,
                eventId: ranking.SubEvent.Event.id,
                dCatId: ranking.SubEvent.dCatId,
                eventTitle: ranking.SubEvent.Event.title,
                date: ranking.SubEvent.Event.dateStart,
                type: ranking.SubEvent.type,
                qualifierScore: ranking.qualifierScore,
                semifinalScore: ranking.semifinalScore,
                finalScore: ranking.finalScore 
            }

            this.#checkMedal(ranking.rank, ranking.SubEvent.type);
            this.results.push(rankingObj);
        }
    }

    #checkMedal(rank, type) {
        type = type.toUpperCase();
        if (rank === 1) {
            if (type.includes("BOULDER"))
                this.medals.boulder.gold++;
            else if (type.includes("LEAD"))
                this.medals.lead.gold++;
        } else if (rank === 2) {
            if (type.includes("BOULDER"))
                this.medals.boulder.silver++;
            else if (type.includes("LEAD"))
                this.medals.lead.silver++;
        } if (rank === 3) {
            if (type.includes("BOULDER"))
                this.medals.boulder.bronze++;
            else if (type.includes("LEAD"))
                this.medals.lead.bronze++;
        }
    }
}

module.exports = AthleteDTO;