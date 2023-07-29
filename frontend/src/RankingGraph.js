import 'chart.js/auto';
import {Chart as ChartJS} from "chart.js";
import { Chart } from 'react-chartjs-2';
import { plugins, scales } from "chart.js/auto";
import autocolors from 'chartjs-plugin-autocolors';

function RankingGraph({events, athletes}) {
    const eventsData = [];

    for (let key in events) {
        eventsData.push({
            id: key,
            title: events[key].title,
            date: events[key].date
        })
    }

    // sort by oldest to newest events
    eventsData.sort(function(e1, e2) {
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
    for (let [i, value] of eventsData.entries()) {
        const id = value.id;
        events[id].index = i;
    }

    const labels = eventsData.map(event => new Date(event.date).toISOString().split('T')[0]);

    const dataset = {}

    for (let key in athletes) {
        const athlete = athletes[key];

        // keep track of which ranking type so we can accumulate to the data as we loop though it, ie. BOULDER Men, LEAD Men
        const typeMap = {};

        for (let rank of athlete.rankings) {
            let typeData = typeMap[rank.type];

            if (!typeData) {
                typeMap[rank.type] = {
                    label: `${athlete.lastName} ${athlete.firstName}`,
                    data: [],
                    spanGaps: true
                }
                typeData = typeMap[rank.type];
            }

            const index = events[rank.eventId].index;
            typeData.data[index] = rank.rank;
        }

        for (let key in typeMap) {
            if (!dataset[key]) {
                dataset[key] = {
                    labels: labels,
                    datasets: []
                }
            }
            dataset[key].datasets.push(typeMap[key]);
        }
    }

    const chartsArray = [];
        for (let key in dataset) {
            const {low, high} = getHighLow(dataset[key]);
            const data = trimData(dataset[key], low, high);
            const eventsData2 = eventsData.slice(low, high);
            chartsArray.push(
                <Chart 
                    className='mt-5'
                    type='line'
                    datasetIdKey='id'
                    data={data}
                    options={{
                        scales: {
                            y: {
                                reverse: true,
                                title: {
                                    display: true,
                                    text: 'Rank'
                                }
                            }
                        },
                        plugins: {
                            autocolors: {
                                mode: 'dataset'
                            },
                            tooltip: {
                                callbacks: {
                                    title: function(context) {
                                        return eventsData2[context[0].dataIndex].title
                                    }
                                }
                            },
                            title: {
                                display: true,
                                text: key
                            }
                        }
                    }}
                />
            )
        }

    ChartJS.register(autocolors);
    return <div>{chartsArray}</div>
}

// find earliest and latest data point so we can trim off excess
function getHighLow(data) {
    let low = data.datasets[0].data.length;
    let high = 0;
    for (let dataset of data.datasets) {
        for (let [i, data] of dataset.data.entries()) {
            if (data) {
                if (i < low) {
                    low = i;
                }

                if (i > high) {
                    high = i;
                }
            }
        }
    }

    high++;

    return {low, high}
    
    
}

function trimData(data, low, high) {
    data.labels = data.labels.slice(low, high);
    for (let dataset of data.datasets) {
        dataset.data = dataset.data.slice(low, high);
    }

    return data;
}

export default RankingGraph;