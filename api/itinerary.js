// api/itinerary.js

export default async function handler(req, res) {
    const token = process.env.GITHUB_TOKEN;
    const owner = 'slewis7796';
    const repo = 'barcelona-itinerary';
    const path = 'itinerary.json';
  
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
    if (req.method === 'GET') {
      const response = await fetch(apiUrl, {
        headers: { Authorization: `token ${token}` },
      });
  
      if (!response.ok) {
        return res.status(500).json({ error: 'Failed to fetch itinerary.' });
      }
  
      const data = await response.json();
      const content = atob(data.content);
      res.status(200).json(JSON.parse(content));
    }
  
    else if (req.method === 'POST') {
      const getResponse = await fetch(apiUrl, {
        headers: { Authorization: `token ${token}` },
      });
  
      const existing = await getResponse.json();
      const newContent = Buffer.from(JSON.stringify(req.body, null, 2)).toString('base64');
  
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Update itinerary.json',
          content: newContent,
          sha: existing.sha,
        }),
      });
  
      if (!response.ok) {
        const err = await response.json();
        return res.status(500).json({ error: 'Failed to save itinerary', details: err });
      }
  
      res.status(200).json({ message: 'Itinerary saved to GitHub!' });
    }
  
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  