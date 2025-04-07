// api/itinerary.js

export default async function handler(req, res) {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = 'slewis7796';
    const REPO = 'barcelona-itinerary';
    const FILE_PATH = 'itinerary.json';
  
    const headers = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    };
  
    if (req.method === 'GET') {
      // 🔽 Load itinerary
      const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
        headers,
      });
  
      if (!response.ok) {
        return res.status(500).json({ error: 'Failed to load itinerary' });
      }
  
      const data = await response.json();
      const content = Buffer.from(data.content, 'base64').toString();
      return res.status(200).json(JSON.parse(content));
    }
  
    if (req.method === 'POST') {
      const getResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
        headers,
      });
  
      const existing = await getResponse.json();
      const sha = existing.sha || null;
  
      const encodedContent = Buffer.from(JSON.stringify(req.body, null, 2)).toString('base64');
  
      const putResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: 'Update itinerary',
          content: encodedContent,
          sha: sha,
        }),
      });
  
      if (!putResponse.ok) {
        return res.status(500).json({ error: 'Failed to save itinerary' });
      }
  
      return res.status(200).json({ message: 'Itinerary saved!' });
    }
  
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  