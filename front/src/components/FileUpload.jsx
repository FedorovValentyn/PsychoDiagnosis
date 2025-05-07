import { useState, useRef } from 'react';
import './FileUpload.css';

export function FileUpload({ onUpload, disabled }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'text/csv') {
            setSelectedFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    return (
        <div className="upload-section">
            <p className="upload-instructions">
                Натисніть для завантаження або перетягніть файл CSV з даними EEG
            </p>

            <div
                className="drag-drop-area"
                onClick={() => fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="drag-drop-icon">📁</div>
                <p className="drag-drop-text">Завантажте CSV файл з даними EEG</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden-file-input"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={disabled}
                />
            </div>

            {selectedFile && (
                <div className="file-display">
                    <span className="file-name">{selectedFile.name}</span>
                    <button
                        className="remove-btn"
                        onClick={handleRemoveFile}
                        disabled={disabled}
                    >
                        Видалити
                    </button>
                </div>
            )}

            <button
                className="analyze-btn"
                onClick={() => onUpload(selectedFile)}
                disabled={!selectedFile || disabled}
            >
                Аналізувати
            </button>
        </div>
    );
}