const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Parse JSON data from POST requests
app.use(express.json());

// Serve static files (like your HTML, CSS, and JS)
app.use(express.static('public'));

// Load itinerary from JSON file
app.get('/itinerary', (req, res) => {
  fs.readFile('itinerary.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error loading data');
    }
    res.json(JSON.parse(data));
  });
});

// Save itinerary to JSON file
app.post('/itinerary', (req, res) => {
  const itinerary = req.body; // Get itinerary data from the request
  fs.writeFile('itinerary.json', JSON.stringify(itinerary), (err) => {
    if (err) {
      return res.status(500).send('Error saving data');
    }
    res.send('Itinerary saved successfully');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
