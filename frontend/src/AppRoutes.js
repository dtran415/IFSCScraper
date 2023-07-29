import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EventsPage from "./EventsPage";
import Rankings from "./Rankings";
import NavBar from "./NavBar";
import Athletes from "./Athletes";
import Countries from "./Countries";
import CompareAthletes from "./CompareAthletes";
import Athlete from "./Athlete";

function AppRoutes() {
    return (
        <BrowserRouter>
            <NavBar />
            <Routes>
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:eventId/:catId" element={<Rankings />} />
                <Route path="/athletes" element={<Athletes />} />
                <Route path="/countries" element={<Countries />} />
                <Route path="/compare/athletes" element={<CompareAthletes />} />
                <Route path="/athletes/:athleteId" element={<Athlete />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;