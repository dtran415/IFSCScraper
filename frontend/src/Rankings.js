import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import IFSCScraperAPI from "./Api";
import { Button } from "reactstrap";

function Rankings() {
    const { eventId, catId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [rankings, setRankings] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        async function getEvents() {
            const rankings = await IFSCScraperAPI.getEvent(eventId, catId);
            setRankings(rankings);
            setIsLoading(false);
        }

        getEvents();
    }, []);

    if (isLoading) {
        return "Loading...";
    }

    const columns = [
        { name: "Rank", options: { filter: false } },
        {
            name: "Name", options: {
                filter: false,
                customBodyRender: (value, tableMeta, updateValue) => {
                    const rowIndex = tableMeta.rowIndex;
                    const athleteId = rankings.overallResults[rowIndex].AthleteId;
                    return (
                        <a href={`/athletes/${athleteId}`}>{value}</a>
                    )
                }
            }
        },
        { name: "Country", options: { filter: true } },
        { name: "Qualifier", options: { filter: false } },
        { name: "Semifinal", options: { filter: false } },
        { name: "final", options: { filter: false } }];

    const data = [];
    for (let rank of rankings.overallResults) {
        data.push([rank.rank, `${rank.Athlete.lastName} ${rank.Athlete.firstName}`, rank.Athlete.CountryCode, rank.qualifierScore, rank.semifinalScore, rank.finalScore]);
    };

    const CustomToolbar = (data) => {

        function onClickCompare() {
            const selectedAthletes = Object.keys(data.lookup).map(d => rankings.overallResults[d].AthleteId);
            navigate(`/compare/athletes?ids=${selectedAthletes.join(',')}`)
        }

        return (
            <>
                <Button onClick={onClickCompare} className="me-3" color="primary">Compare</Button>
            </>
        );
    }


    const options = {
        filter: true,
        print: false,
        download: false,
        viewColumns: false,
        rowsPerPage: 100,
        customToolbarSelect: CustomToolbar
    };

    return <MUIDataTable
        className="m-5"
        title={`${rankings.title} | ${rankings.subtitle}`}
        data={data}
        columns={columns}
        options={options}
    />
}

export default Rankings;