import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import IFSCScraperAPI from "./Api";

function Athletes() {
    const [isLoading, setIsLoading] = useState(true);
    const [athletes, setAthletes] = useState();


    useEffect(() => {
        async function getAthletes() {
            const result = await IFSCScraperAPI.getAthletes();
            setAthletes(result.athletes);
            setIsLoading(false);
        }

        getAthletes();
    }, []);

    if (isLoading) {
        return "Loading...";
    }

    const columns = [
        {name: "Name", options: { filter: false}}, 
        {name: "Gender", options: { filter: true}}, 
        {name: "Country", options: {filter: true}}, 
        {name: "Gold", options: { filter: true}},  
        {name: "Silver", options: { filter: true}}, 
        {name: "Bronze", options: { filter: true}}, 
        {name: "Total", options: { filter: true}} ];

    const data = [];
    for (let athlete of athletes) {
        data.push([`${athlete.lastName} ${athlete.firstName}`, athlete.gender.toUpperCase(), athlete.country.code, athlete.medals.gold, athlete.medals.silver, athlete.medals.bronze, athlete.medals.total]);
    };

    const options = {
        filter: true,
        print: false,
        download: false,
        viewColumns: false,
        rowsPerPage: 100,
        selectableRows: 'none',
        sortOrder: {
            name: 'Total',
            direction: 'desc'
        }
    };

    return <MUIDataTable
        className="m-5"
        title={"Athletes"}
        data={data}
        columns={columns}
        options={options}
    />
}

export default Athletes;