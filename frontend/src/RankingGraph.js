import 'chart.js/auto';
import { Chart as ChartJS } from "chart.js";
import { Chart } from 'react-chartjs-2';
import { plugins, scales } from "chart.js/auto";
import autocolors from 'chartjs-plugin-autocolors';

function RankingGraph({ athletes }) {

    // each event (ie. BOULDER Men, Lead Men) will have its own data
    /* eventMap("BOULDER Men") = {
        events = map(eventId, event) // map of events for look up will then sort it for the graph
        athletes = map( // map of athletes and results
            name,
            result = [{
                rank, eventId
            }]
        ] 
    }*/
    const eventMap = new Map();

    // loop through each athlete
    for (let athlete of athletes) {
        const { id, firstName, lastName } = athlete;
        const name = `${lastName} ${firstName}`;

        // loop through each result
        for (let result of athlete.results) {
            const rank = result.rank;
            const type = result.type;
            const eventId = result.eventId;
            const eventTitle = result.eventTitle;
            const date = result.date;

            // check for event type object
            let eventObj = eventMap.get(type);
            if (!eventObj) {
                eventObj = {
                    events: new Map(), // map of event data
                    athleteResults: new Map() // map of name and array of rank and eventId
                }
                eventMap.set(type, eventObj);
            }

            // add event, overwrite if already there
            eventObj.events.set(eventId, { title: eventTitle, date });

            let results = eventObj.athleteResults.get(id);
            if (!results) {
                eventObj.athleteResults.set(id, { name, results: [] });
                results = eventObj.athleteResults.get(id);
            }

            // add result
            results.results.push({ rank, eventId })
        }
    }

    const chartsArray = [];
    // create a chart for each event type
    for (let [type, eventObj] of eventMap) {
        const eventsData = [...eventObj.events.values()].sort(
            function (e1, e2) {
                const d1 = new Date(e1.date);
                const d2 = new Date(e2.date);

                if (d1 < d2)
                    return -1;
                else if (d1 > d2)
                    return 1;
                else
                    return 0;
            }
        )

        // set indices for event data
        for (let [i, event] of eventsData.entries()) {
            event.index = i;
        }

        const labels = eventsData.map(event => new Date(event.date).toISOString().split('T')[0]);
        const athleteDatasets = new Map(); // map of arrays for the datapoints for the graph

        // loop through each athlete in the event
        for (let [id, athleteResults] of eventObj.athleteResults.entries()) {
            let athleteData = athleteDatasets.get(id);
            if (!athleteData) {
                athleteDatasets.set(id, { name: athleteResults.name, results: [] });
                athleteData = athleteDatasets.get(id);
            }

            // set rank data into athlete data array
            for (let result of athleteResults.results) {
                const event = eventObj.events.get(result.eventId);
                athleteData.results[event.index] = result.rank;
            }
        }

        const datasets = [];
        for (let athleteResult of athleteDatasets.values()) {
            const dataset = {
                label: athleteResult.name,
                data: athleteResult.results,
                spanGaps: true
            }
            datasets.push(dataset);
        }

        // create chart with data
        const data = {
            labels,
            datasets
        };
        const secondaryLabels = eventsData.map(event => event.title);
        chartsArray.push(createRankChart(data, type, secondaryLabels));
    }

    ChartJS.register(autocolors);
    return <div>{chartsArray}</div>
}

/* data = {labels, 
    datasets: [{
    label,
    data: [#,#,#]
}]}
    secondaryLabels: labels used for hover text, should match up indices with labels
    ie. Climbing World Cup (B) - Hachioji (JPN) 2023
*/
function createRankChart(data, title, secondaryLabels) {
    return <Chart
        key={title}
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
                        title: function (context) {
                            return `${context[0].label}\n${secondaryLabels[context[0].dataIndex]}`
                        }
                    }
                },
                title: {
                    display: true,
                    text: title
                }
            }
        }}
    />
}

export default RankingGraph;