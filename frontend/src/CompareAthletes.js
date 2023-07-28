import { useEffect, useState } from "react";
import IFSCScraperAPI from "./Api";
import { useSearchParams } from "react-router-dom";
import 'chart.js/auto';
import {Chart as ChartJS} from "chart.js";
import { Chart } from 'react-chartjs-2';
import { plugins, scales } from "chart.js/auto";
import autocolors from 'chartjs-plugin-autocolors';

function CompareAthletes() {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState();

    const [params] = useSearchParams();
    const ids = params.get("ids");

    useEffect(() => {
        async function getCompareData() {
            const result = await IFSCScraperAPI.getAthleteComparison(ids);
            setData(result);
            setIsLoading(false);
        }

        getCompareData();
    }, []);

    if (isLoading) {
        return "Loading...";
    }

    const events = [];

    for (let key in data.events) {
        events.push({
            id: key,
            title: data.events[key].title,
            date: data.events[key].date
        })
    }

    // sort by oldest to newest events
    events.sort(function(e1, e2) {
        const d1 = new Date(e1.date);
        const d2 = new Date(e2.date);

        if (d1 < d2)
            return -1;
        else if (d1 > d2)
            return 1;
        else
            return 0;
    });

    // set indices for rank data
    for (let [i, value] of events.entries()) {
        const id = value.id;
        data.events[id].index = i;
    }

    const labels = events.map(event => new Date(event.date).toISOString().split('T')[0]);

    const dataset = [];
    for (let key in data.athletes) {
        const athlete = data.athletes[key];

        // keep track of which ranking type so we can accumulate to the data as we loop though it, ie. BOULDER Men, LEAD Men
        const typeMap = {};

        for (let rank of athlete.rankings) {
            let typeData = typeMap[rank.type];

            if (!typeData) {
                typeMap[rank.type] = {
                    label: `${athlete.lastName} ${athlete.firstName}\n${rank.type}`,
                    data: [],
                    spanGaps: true
                }
                typeData = typeMap[rank.type];
            }

            const index = data.events[rank.eventId].index;
            typeData.data[index] = rank.rank;
        }

        for (let key in typeMap) {
            dataset.push(typeMap[key]);
        }
    }

    ChartJS.register(autocolors);
    return <Chart type='line'
        datasetIdKey='id'
        data={{
            labels: labels,
            datasets: dataset,
        }}
        options={{
            scales: {
                y: {
                    reverse: true
                }
            },
            plugins: {
                autocolors: {
                    mode: 'data'
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return events[context[0].dataIndex].title
                        }
                    }
                }
            }
        }}
    />
}

export default CompareAthletes;