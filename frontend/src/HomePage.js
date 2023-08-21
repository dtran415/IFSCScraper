import React from "react";
import { API_URL } from "./Api";
import { Card, CardBody, CardImg, CardText, CardTitle, Col, Row } from "reactstrap";

function HomePage() {
    return (
        <div className="container my-5">
            <img src="logo-ifsc.png" alt="ifsc_logo" className="mx-auto d-block" />
            <h1 className="text-center">IFSC Data Visualizer</h1>
            <div className="m-5 fs-4">
                <p>This web app takes data scraped from the IFSC website and creates tables and charts that help visualize the data. Currently, only lead and boulder results are scraped. The data scraped is manually triggered so it may not be up to date.</p>
                <p>Use <a href={`${API_URL}/parse`} target="_blank" rel="noreferrer">{API_URL}/parse</a> to trigger the scraper.</p>
            </div>
            <Row>
                <Col sm="4">
                    <Card className="h-100">
                        <CardImg src="events.jpg" />
                        <CardBody>
                            <CardTitle><h3>Events</h3></CardTitle>
                            <CardText>The events page shows the list of all events and their corresponding subevents.</CardText>
                            <a href="/events" className="btn btn-primary">Events</a>
                        </CardBody>
                    </Card>
                </Col>
                <Col sm="4">
                    <Card className="h-100">
                        <CardImg src="athletes.jpg" />
                        <CardBody>
                            <CardTitle><h3>Athletes</h3></CardTitle>
                            <CardText>The athletes page shows the list of all athletes along with their gender, country and medal counts in a sortable table. Athletes can be selected for comparison to see how their rankings have changed over time. </CardText>
                            <a href="/athletes" className="btn btn-primary">Athletes</a>
                        </CardBody>
                    </Card>
                </Col>
                <Col sm="4">
                    <Card className="h-100">
                        <CardImg src="countries.png" />
                        <CardBody>
                            <CardTitle><h3>Countries</h3></CardTitle>
                            <CardText>The countries page shows the list of all countries along with their athlete and medal counts.</CardText>
                            <a href="/countries" className="btn btn-primary">Countries</a>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default HomePage;