import axios from "axios";

const BASE_API_URL = "http://localhost:5000";

class IFSCScraperAPI {
    static async getEvents() {
        const result = await axios.get(`${BASE_API_URL}/events`);
        return result.data;
    }

    static async getEvent(id, catId) {
        const result = await axios.get(`${BASE_API_URL}/events/${id}/${catId}`);
        return result.data;
    }

    static async getAthletes() {
        const result = await axios.get(`${BASE_API_URL}/athletes`);
        return result.data;
    }

    static async getCountries() {
        const result = await axios.get(`${BASE_API_URL}/countries`);
        return result.data;
    }

    static async getAthleteComparison(ids) {
        const result = await axios.get(`${BASE_API_URL}/compare/athletes`, { params: {ids: ids}});
        return result.data;
    }

    static async getAthlete(id) {
        const result = await axios.get(`${BASE_API_URL}/athletes/${id}`);
        return result.data;
    }
}

export default IFSCScraperAPI;