// В utils/api.js перевірте, чи правильно обробляється відповідь:
export const predictEEG = async (formData) => {
    try {
        const response = await fetch('http://localhost:5000/api/predict', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json(); // Спробуйте отримати JSON помилки
            throw new Error(errorData.message || 'Failed to get prediction');
        }

        return await response.json();
    } catch (err) {
        console.error('API Error:', err); // Додайте логування
        throw err;
    }
};