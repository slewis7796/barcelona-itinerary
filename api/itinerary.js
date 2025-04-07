// api/itinerary.js

const { promises: fs } = require('fs');
const path = require('path');

const itineraryFilePath = path.resolve('./itinerary.json'); // Path to store your JSON file

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Handle GET request to load itinerary
    try {
      const data = await fs.readFile(itineraryFilePath, 'utf-8');
      res.status(200).json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: 'Failed to read itinerary data' });
    }
  } else if (req.method === 'POST') {
    // Handle POST request to save itinerary
    try {
      const data = req.body; // Itinerary data sent from the client
      await fs.writeFile(itineraryFilePath, JSON.stringify(data, null, 2));
      res.status(200).json({ message: 'Itinerary saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save itinerary' });
    }
  } else {
    // Handle unsupported HTTP methods
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
