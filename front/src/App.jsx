import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsTable } from './components/ResultsTable.jsx';
import './App.css';

function App() {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileUpload = async (file) => {
        try {
            setLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:5000/api/predict', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Помилка при обробці файлу');
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            console.error('Помилка:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <h1 className="app-title">EEG Аналізатор</h1>

            <div className="file-upload-container">
                <h2 className="file-upload-title">Завантажте CSV файл з даними EEG</h2>
                <FileUpload onUpload={handleFileUpload} disabled={loading} />

                {loading && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p className="loading-text">Обробка даних...</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {results && !loading && (
                <div className="results-container">
                    <h2 className="results-title">Результати аналізу</h2>
                    <ResultsTable data={results} />
                </div>
            )}
        </div>
    );
}

export default App;