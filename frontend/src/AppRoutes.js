import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EventsPage from "./EventsPage";
import Rankings from "./Rankings";
import NavBar from "./NavBar";

function AppRoutes() {
    return (
        <BrowserRouter>
            <NavBar />
            <Routes>
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:eventId/:catId" element={<Rankings />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;