import { useState } from 'react';

export function FileUpload({ onUpload, disabled }) {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedFile) {
            onUpload(selectedFile);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-center w-full">
                <label
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300"
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Натисніть для завантаження</span> або перетягніть файл
                        </p>
                        <p className="text-xs text-gray-500">CSV з даними EEG</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={disabled}
                    />
                </label>
            </div>

            {selectedFile && (
                <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <span className="text-sm truncate max-w-xs">{selectedFile.name}</span>
                    <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => setSelectedFile(null)}
                        disabled={disabled}
                    >
                        Видалити
                    </button>
                </div>
            )}

            <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedFile || disabled}
            >
                Аналізувати
            </button>
        </form>
    );
}