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
}

export default IFSCScraperAPI;