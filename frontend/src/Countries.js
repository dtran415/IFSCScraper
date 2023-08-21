import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import IFSCScraperAPI from "./Api";
import country_codes from "./country_codes";

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
        { name: "Country", options: { 
            filter: true, customBodyRender: (value, tableMeta, updateValue) => {
            const rowIndex = tableMeta.rowIndex;
            const countryIndex = tableMeta.currentTableData[rowIndex].index;
            const country = countries[countryIndex].code;
            return (
                <a href={`/athletes?country=${country}`}>{value}</a>
            )
        } } },
        { name: "Athletes", options: { filter: true } },
        { name: "Gold", options: { filter: true } },
        { name: "Silver", options: { filter: true } },
        { name: "Bronze", options: { filter: true } },
        { name: "Total", options: { filter: true } }];

    const data = [];
    for (let country of countries) {
        data.push([country_codes.get(country.code) || country.code, country.numAthletes, country.medals.gold, country.medals.silver, country.medals.bronze, country.medals.total]);
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

    return <div className="m-5">
        <h1>Countries</h1>
        <MUIDataTable
            data={data}
            columns={columns}
            options={options}
        />
    </div>
}

export default Countries;