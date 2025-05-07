const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Налаштування CORS
app.use(cors());
app.use(express.json());

// Налаштування multer для завантаження файлів
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB ліміт розміру файлу
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Дозволені тільки CSV файли'));
    }
  }
});

// Шлях до файлу, де буде зберігатися модель
const MODEL_PATH = path.join(__dirname, 'models', 'best_eeg_model.joblib');

// Запуск Python-скрипта для обробки даних
function processCsvWithPython(filePath) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['process_eeg.py', filePath, MODEL_PATH]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', error);
        reject(new Error(`Помилка обробки даних: ${error}`));
        return;
      }

      try {
        const resultData = JSON.parse(result);
        resolve(resultData);
      } catch (err) {
        console.error('Failed to parse Python output:', result);
        reject(new Error('Неправильний формат відповіді від скрипта обробки'));
      }
    });
  });
}

// Маршрут для прогнозування
app.post('/api/predict', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не завантажено' });
    }

    // Перевіряємо чи доступна модель
    if (!fs.existsSync(MODEL_PATH)) {
      return res.status(500).json({ message: 'Модель не знайдена на сервері' });
    }

    const filePath = req.file.path;

    try {
      const results = await processCsvWithPython(filePath);

      // Видаляємо тимчасовий файл після обробки
      fs.unlink(filePath, (err) => {
        if (err) console.error('Помилка видалення файлу:', err);
      });

      res.json(results);
    } catch (error) {
      console.error('Помилка обробки файлу:', error);
      res.status(500).json({ message: error.message });
    }
  } catch (error) {
    console.error('Загальна помилка:', error);
    res.status(500).json({ message: 'Серверна помилка при обробці запиту' });
  }
});

// Простий маршрут для перевірки стану API
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', modelAvailable: fs.existsSync(MODEL_PATH) });
});

// Створюємо директорію для завантажень, якщо вона не існує
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Створюємо директорію для моделей, якщо вона не існує
if (!fs.existsSync('models')) {
  fs.mkdirSync('models');
}

app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});