// api/itinerary.js — API endpoint for saving/loading itinerary via GitHub

export default async function handler(req, res) {
    const GITHUB_REPO = 'slewis7796/barcelona-itinerary';
    const FILE_PATH = 'itinerary.json'; // Can be 'api/itinerary.json' if preferred
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
    if (!GITHUB_TOKEN) {
      return res.status(500).json({ error: 'Missing GitHub token' });
    }
  
    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    };
  
    if (req.method === 'GET') {
      try {
        const fetchRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
          headers,
        });
        const data = await fetchRes.json();
        const content = Buffer.from(data.content, 'base64').toString();
        res.status(200).json(JSON.parse(content));
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch itinerary', details: err });
      }
    } else if (req.method === 'POST') {
      try {
        // First, get current file SHA
        const currentRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
          headers,
        });
        const current = await currentRes.json();
        const sha = current.sha;
  
        // Prepare new content
        const newContent = Buffer.from(JSON.stringify(req.body, null, 2)).toString('base64');
  
        // Push new version
        const saveRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: 'Update itinerary.json',
            content: newContent,
            sha,
          }),
        });
  
        if (!saveRes.ok) {
          const errRes = await saveRes.json();
          return res.status(500).json({ error: 'GitHub save failed', details: errRes });
        }
  
        res.status(200).json({ message: 'Saved successfully' });
      } catch (err) {
        res.status(500).json({ error: 'Failed to save itinerary', details: err });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  
  