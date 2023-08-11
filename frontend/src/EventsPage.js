import React, { useEffect, useState } from "react";
import IFSCScraperAPI from "./Api";
import EventItem from "./EventItem";
import { AccordionItem, AccordionHeader, AccordionBody, UncontrolledAccordion } from "reactstrap";

function EventsPage() {

    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState();

    useEffect(() => {
        async function getEvents() {
            const events = await IFSCScraperAPI.getEvents();
            setEvents(events);
            setIsLoading(false);
        }

        getEvents();
    }, []);

    if (isLoading) {
        return "Loading...";
    }

    let accordionItems = [];
    let eventsList = [];
    let currentYear = null;
    let firstYear = null;
    // assume events are already ordered

    for (let e of events.events) {
        const date = new Date(e.dateStart);
        const year = date.getFullYear();
        // if we have events create accordion item
        if (currentYear !== year) {
            if (!firstYear)
                firstYear = year;

            if (eventsList.length !== 0) {
                accordionItems.push(createAccordionItem(eventsList, currentYear));
                // reset events list since it's been processed
                eventsList = [];
            }

            currentYear = year;
        }

        eventsList.push(e);
    }

    // get the rest
    if (eventsList.length !== 0) {
        accordionItems.push(createAccordionItem(eventsList, currentYear));
    }

    const list =
        <UncontrolledAccordion defaultOpen={[firstYear.toString()]} stayOpen>
            {accordionItems}
        </UncontrolledAccordion>

    return (
        <div className="container mt-5">
            <h1>Events</h1>
            <p>Events are listed by year and ordered by most recent first. Click on a subevent to see overall results for that event.</p>
            {list}
        </div>
    )
}

function createEvent(eventInput) {
    const date = new Date(eventInput.dateStart);
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    const event = {
        id: eventInput.id,
        name: eventInput.title,
        date: date.toLocaleDateString("en-US", options),
        subevents: eventInput.SubEvents
    }
    const eventItem = <EventItem key={event.id} event={event} />
    return eventItem;
}

function createAccordionItem(eventsList, currentYear) {
    const accordionBody = [];
    for (let e2 of eventsList) {
        accordionBody.push(createEvent(e2));
    }

    const id = currentYear.toString();
    const accordionItem =
        <AccordionItem key={id}>
            <AccordionHeader targetId={id}>{currentYear}</AccordionHeader>
            <AccordionBody accordionId={id}>
                {accordionBody}
            </AccordionBody>
        </AccordionItem>

    return accordionItem;
}


export default EventsPage;