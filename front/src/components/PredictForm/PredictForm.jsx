// src/components/PredictForm/PredictForm.jsx
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { predictEEG } from '../../utils/api';
import './PredictForm.css';

// Реєстрація компонентів ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function PredictForm() {
    const [file, setFile] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('csvFile', file);

            const result = await predictEEG(formData);
            setPrediction(result);
        } catch (err) {
            setError(err.message || 'Prediction failed');
        } finally {
            setLoading(false);
        }
    };

    // Дані для графіка
    const chartData = {
        labels: prediction ? Object.keys(prediction.probabilities) : [],
        datasets: [{
            label: 'Diagnosis Probability',
            data: prediction ? Object.values(prediction.probabilities) : [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }]
    };

    return (
        <div className="predict-form">
            <form onSubmit={handleSubmit} className="upload-form">
                <div className="file-input-wrapper">
                    <label>
                        Choose EEG data file (CSV):
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setFile(e.target.files[0])}
                            disabled={loading}
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={!file || loading}
                    className="predict-button"
                >
                    {loading ? 'Processing...' : 'Analyze EEG'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {prediction && (
                <div className="results-container">
                    <h2>Analysis Results</h2>

                    <div className="diagnosis-result">
                        <h3>Diagnosis: <span>{prediction.prediction}</span></h3>
                    </div>

                    <div className="chart-wrapper">
                        <Bar
                            data={chartData}
                            options={{
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 1,
                                        title: {
                                            display: true,
                                            text: 'Probability'
                                        }
                                    },
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Possible Conditions'
                                        }
                                    }
                                },
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => {
                                                const value = context.parsed.y;
                                                return `${Math.round(value * 100)}% probability`;
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>

                    <div className="features-table">
                        <h3>Input Features</h3>
                        <table>
                            <thead>
                            <tr>
                                <th>Feature</th>
                                <th>Value</th>
                            </tr>
                            </thead>
                            <tbody>
                            {prediction.features && Object.entries(prediction.features).map(([key, value]) => (
                                <tr key={key}>
                                    <td>{key}</td>
                                    <td>{typeof value === 'number' ? value.toFixed(4) : value}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}