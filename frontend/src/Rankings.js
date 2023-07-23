import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import IFSCScraperAPI from "./Api";

function Rankings() {
    const { eventId, catId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [rankings, setRankings] = useState();


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
        {name: "Rank", options: { filter: false}}, 
        {name: "Name", options: { filter: false}}, 
        {name: "Country", options: {filter: true}}, 
        {name: "Qualifier", options: { filter: false}},  
        {name: "Semifinal", options: { filter: false}}, 
        {name: "final", options: { filter: false}} ];

    const data = [];
    for (let rank of rankings.overallResults) {
        data.push([rank.rank, `${rank.Athlete.lastName} ${rank.Athlete.firstName}`, rank.Athlete.CountryCode, rank.qualifierScore, rank.semifinalScore, rank.finalScore]);
    };

    const options = {
        filter: true,
        print: false,
        download: false,
        viewColumns: false,
        rowsPerPage: 100,
        selectableRows: 'none'
    };

    return <MUIDataTable
        className="m-5"
        title={rankings.title}
        data={data}
        columns={columns}
        options={options}
    />
}

export default Rankings;