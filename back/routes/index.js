// server.js (Express)
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { PythonShell } = require('python-shell');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Ендпоінт для обробки CSV файлу
app.post('/api/predict', upload.single('csvFile'), async (req, res) => {
  try {
    const options = {
      scriptPath: path.join(__dirname, 'models'),
      args: [req.file.path]
    };

    PythonShell.run('predict.py', options, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Prediction failed' });
      }

      const prediction = JSON.parse(results[0]);
      res.json(prediction);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));