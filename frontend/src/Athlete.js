import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import IFSCScraperAPI from "./Api";
import { useParams } from "react-router-dom";
import { Card, CardBody, CardTitle } from "reactstrap";
import RankingGraph from "./RankingGraph";

function Athlete() {
    const [isLoading, setIsLoading] = useState(true);
    const [athlete, setAthlete] = useState();
    const { athleteId } = useParams();

    useEffect(() => {
        async function getAthlete() {
            const result = await IFSCScraperAPI.getAthlete(athleteId);
            setAthlete(result.athlete);
            setIsLoading(false);
        }

        getAthlete();
    }, []);

    if (isLoading) {
        return "Loading...";
    }

    const columns = [
        { name: "Rank", options: { filter: false } },
        { name: "Event", options: { filter: true } },
        { name: "Date", options: { filter: true } },
        { name: "Type", options: { filter: true } },
        { name: "Qualifier", options: { filter: true } },
        { name: "Semifinal", options: { filter: true } },
        { name: "Final", options: { filter: true } }
    ];

    const data = [];

    const events = {};
    const athletes =
    {
        [athlete.id]: {
            id: athlete.id,
            firstName: athlete.firstName,
            lastName: athlete.lastName,
            country: athlete.country,
            rankings: []
        }
    };

    for (let result of athlete.results) {
        // graph table
        events[result.eventId] = {
            title: result.eventTitle,
            date: result.date
        }

        athletes[athlete.id].rankings.push({
            rank: result.rank,
            type: result.type,
            eventId: result.eventId
        });

        // table data
        data.push([result.rank, result.eventTitle, new Date(result.date).toISOString().split('T')[0], result.type, result.qualifierScore, result.semifinalScore, result.finalScore]);
    };

    const options = {
        filter: true,
        print: false,
        download: false,
        viewColumns: false,
        rowsPerPage: 100,
        selectableRows: 'none',
        sortOrder: {
            name: 'Date',
            direction: 'desc'
        }
    };

    return <div>
        <div className="m-5">
            <h1>{athlete.lastName} {athlete.firstName}</h1>
            <div>Gender: {athlete.gender.toUpperCase()}</div>
            <div>Country: {athlete.country}</div>
            <div className="mt-3 row">
                <Card className="m-1 col">
                    <CardBody>
                        <CardTitle>
                            <div className="fs-4">Boulder</div>
                        </CardTitle>
                        <div>Gold: {athlete.medals.boulder.gold}</div>
                        <div>Silver: {athlete.medals.boulder.silver}</div>
                        <div>Bronze: {athlete.medals.boulder.bronze}</div>
                    </CardBody>
                </Card>
                <Card className="m-1 col">
                    <CardBody>
                        <CardTitle>
                            <div className="fs-4">Lead</div>
                        </CardTitle>
                        <div>Gold: {athlete.medals.lead.gold}</div>
                        <div>Silver: {athlete.medals.lead.silver}</div>
                        <div>Bronze: {athlete.medals.lead.bronze}</div>
                    </CardBody>
                </Card>
            </div>
        </div>
        <div className="m-5">
            <RankingGraph events={events} athletes={athletes} />
        </div>
        <MUIDataTable
            className="m-5"
            title={"Results"}
            data={data}
            columns={columns}
            options={options}
        />
    </div>
}

export default Athlete;