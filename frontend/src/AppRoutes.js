import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EventsPage from "./EventsPage";
import Rankings from "./Rankings";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:eventId/:catId" element={<Rankings />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;