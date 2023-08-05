import React from "react";
import { Button, Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";

function EventItem({ event }) {
    return (
        <Card className="m-3">
            <CardBody>
                <CardTitle>
                    <div className="fs-4">{event.name}</div>
                </CardTitle>
                <CardSubtitle>
                    <div className="fs-5">{event.date}</div>
                </CardSubtitle>
                {event.subevents.map(subevent => (
                    <Button key={`${event.id}-${subevent.dCatId}`} color="primary" className="m-1" href={`/events/${event.id}/${subevent.dCatId}`}>{subevent.type}</Button>
                ))}
            </CardBody>
        </Card>
    )
}

export default EventItem;