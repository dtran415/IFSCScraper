import React from "react";
import { useParams } from "react-router-dom";

function Rankings() {
    const { eventId, catId } = useParams();

    return (<div>
        HI: {eventId} {catId}
    </div>)
}

export default Rankings;