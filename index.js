const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/results.json', (req, res) => {
  fs.readFile('results.json', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'File not found or unreadable' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
