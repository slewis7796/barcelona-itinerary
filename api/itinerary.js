let itineraryData = {}; // In-memory store

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(itineraryData);
  } else if (req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        itineraryData = JSON.parse(body);
        res.status(200).json({ message: 'Itinerary saved' });
      } catch (err) {
        console.error('❌ Failed to parse JSON:', err);
        res.status(400).json({ message: 'Invalid JSON' });
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
