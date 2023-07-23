import React, { useEffect, useState } from "react";
import IFSCScraperAPI from "./Api";
import EventItem from "./EventItem";

function EventsPage() {

    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState();

    useEffect(() => {
        async function getEvents() {
            const events = await IFSCScraperAPI.getEvents();
            console.log(events);
            setEvents(events);
            setIsLoading(false);
        }

        getEvents();
    }, []);

    if (isLoading) {
        return "Loading...";
    }

    const list = events.events.map(e => {
        const date = new Date(e.dateStart);
        const options = {year: 'numeric', month: 'long', day: 'numeric'}
        const event = {
            id: e.id,
            name: e.title,
            date: date.toLocaleDateString("en-US", options),
            subevents: e.SubEvents
        }
        return <EventItem event={event} />
    });

    return (
        <div>
            {list}
        </div>
    )
}

export default EventsPage;