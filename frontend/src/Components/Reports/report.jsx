import React, { useState, useEffect } from 'react';
import { login, getreports } from '../../api';
import { jwtDecode } from 'jwt-decode';
const Report = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getreports();
                setReports(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch reports');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);
    return (
        <div className="report-container">
            <h1>Reports</h1>

            {loading && <p>Loading reports...</p>}
            {error && <p className="error">{error}</p>}

            <ul>
                {reports.map((report) => (
                    <li key={report.id}>
                        <strong>{report.name}</strong>
                        {report.file_path && (
                            <a href={`${BACKEND_URL}${report.file_path}`}  target="_blank" rel="noopener noreferrer">
                                Download
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Report;