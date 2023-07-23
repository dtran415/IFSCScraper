import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import IFSCScraperAPI from "./Api";

function Countries() {
    const [isLoading, setIsLoading] = useState(true);
    const [countries, setCountries] = useState();


    useEffect(() => {
        async function getCountries() {
            const result = await IFSCScraperAPI.getCountries();
            setCountries(result.countries);
            setIsLoading(false);
        }

        getCountries();
    }, []);

    if (isLoading) {
        return "Loading...";
    }

    const columns = [
        {name: "Country", options: { filter: true}}, 
        {name: "Athletes", options: { filter: true}}, 
        {name: "Gold", options: { filter: true}},  
        {name: "Silver", options: { filter: true}}, 
        {name: "Bronze", options: { filter: true}}, 
        {name: "Total", options: { filter: true}} ];

    const data = [];
    for (let country of countries) {
        data.push([country.code, country.numAthletes, country.medals.gold, country.medals.silver, country.medals.bronze, country.medals.total]);
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
        title={"Countries"}
        data={data}
        columns={columns}
        options={options}
    />
}

export default Countries;