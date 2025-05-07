export function ResultsTable({ data }) {
    if (!data || !data.predictions || data.predictions.length === 0) {
        return (
            <div className="text-center py-4">
                <p>Немає даних для відображення</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                <tr>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Індекс</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Прогнозований клас</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Ймовірність</th>
                </tr>
                </thead>
                <tbody>
                {data.predictions.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.index}</td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.predicted_class}</td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">
                            {item.probability ? `${(item.probability * 100).toFixed(2)}%` : 'Н/Д'}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {data.summary && (
                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Статистика</h3>
                    <p><strong>Загальна кількість записів:</strong> {data.summary.total_records}</p>
                    <p><strong>Розподіл класів:</strong></p>
                    <ul className="list-disc pl-5 mt-2">
                        {Object.entries(data.summary.class_distribution || {}).map(([cls, count]) => (
                            <li key={cls}>{cls}: {count} ({((count / data.summary.total_records) * 100).toFixed(1)}%)</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}