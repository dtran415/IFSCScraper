import { useEffect, useState } from "react";
import IFSCScraperAPI from "./Api";
import { useSearchParams } from "react-router-dom";
import 'chart.js/auto';
import RankingGraph from "./RankingGraph";

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

    return <div className="container mt-5">
        <RankingGraph events={data.events} athletes={data.athletes} />
    </div>
}

export default CompareAthletes;