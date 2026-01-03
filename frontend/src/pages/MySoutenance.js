import React, { useState, useEffect } from 'react';
import { Card, Table } from 'react-bootstrap';
import { getSoutenances } from '../api';

const MySoutenance = () => {
    const [soutenances, setSoutenances] = useState([]);

    useEffect(() => {
        getSoutenances().then(setSoutenances).catch(console.error);
    }, []);

    if (soutenances.length === 0) {
        return <div className="container mt-4"><h3>No Scheduled Soutenances</h3></div>;
    }

    return (
        <div className="container mt-4">
            <h2>My Soutenances</h2>
            <div className="row">
                {soutenances.map(s => (
                    <div className="col-md-6 mb-4" key={s.id}>
                        <Card>
                            <Card.Header as="h5">{s.internship_title}</Card.Header>
                            <Card.Body>
                                <Card.Title>Student: {s.student_name}</Card.Title>
                                <Card.Text>
                                    <strong>Date:</strong> {s.date} at {s.time}<br/>
                                    <strong>Room:</strong> {s.room}<br/>
                                    <strong>Status:</strong> {s.status}<br/>
                                </Card.Text>
                                <h6>Jury Members:</h6>
                                <ul>
                                    {s.juries.map(j => (
                                        <li key={j.id}>
                                            {j.member_name} ({j.member_email})
                                        </li>
                                    ))}
                                </ul>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MySoutenance;
