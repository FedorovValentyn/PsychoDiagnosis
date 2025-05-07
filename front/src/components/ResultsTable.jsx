import './ResultsTable.css';

export function ResultsTable({ data }) {
    if (!data || !data.predictions || data.predictions.length === 0) {
        return (
            <div className="results-table__no-data">
                <p>Немає даних для відображення</p>
            </div>
        );
    }

    return (
        <>
            <div className="results-table__container">
                <table className="results-table">
                    <thead className="results-table__header">
                    <tr>
                        <th className="results-table__cell results-table__cell--header">Індекс</th>
                        <th className="results-table__cell results-table__cell--header">Прогнозований клас</th>
                        <th className="results-table__cell results-table__cell--header">Ймовірність</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.predictions.map((item, index) => (
                        <tr key={index} className={`results-table__row ${index % 2 === 0 ? 'results-table__row--even' : 'results-table__row--odd'}`}>
                            <td className="results-table__cell">{item.index}</td>
                            <td className="results-table__cell">{item.predicted_class}</td>
                            <td className="results-table__cell">
                                {item.probability ? `${(item.probability * 100).toFixed(2)}%` : 'Н/Д'}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {data.summary && (
                <div className="results-table__summary">
                    <h3 className="results-table__summary-title">Статистика аналізу</h3>
                    <p><strong>Загальна кількість записів:</strong> {data.summary.total_records}</p>
                    <p><strong>Розподіл класів:</strong></p>
                    <ul className="results-table__summary-list">
                        {Object.entries(data.summary.class_distribution || {}).map(([cls, count]) => (
                            <li key={cls}>{cls}: {count} ({((count / data.summary.total_records) * 100).toFixed(1)}%)</li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}