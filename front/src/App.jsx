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
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">EEG Аналізатор</h1>

            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Завантажте CSV файл з даними EEG</h2>
                <FileUpload onUpload={handleFileUpload} disabled={loading} />

                {loading && (
                    <div className="mt-4 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-2">Обробка даних...</p>
                    </div>
                )}

                {error && (
                    <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {results && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Результати аналізу</h2>
                    <ResultsTable data={results} />
                </div>
            )}
        </div>
    );
}

export default App;