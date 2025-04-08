// /api/itinerary.js

export default async function handler(req, res) {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO = 'barcelona-itinerary'; // Replace if different
    const USERNAME = 'slewis7796';
    const FILE_PATH = 'itinerary.json';
    const BRANCH = 'main';
  
    const fileUrl = `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${FILE_PATH}`;
  
    if (req.method === 'GET') {
      // Fetch the latest itinerary from GitHub
      const response = await fetch(`https://raw.githubusercontent.com/${USERNAME}/${REPO}/${BRANCH}/${FILE_PATH}`);
      const data = await response.json();
      return res.status(200).json(data);
    }
  
    if (req.method === 'POST') {
      const plan = req.body;
  
      // Get the current file SHA for updating
      const getFile = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
  
      const fileData = await getFile.json();
      const sha = fileData.sha;
  
      // Now send the updated file
      const response = await fetch(fileUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Update itinerary',
          content: Buffer.from(JSON.stringify(plan, null, 2)).toString('base64'),
          sha: sha,
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        return res.status(200).json({ message: 'Itinerary saved successfully', result });
      } else {
        return res.status(500).json({ message: 'Failed to save itinerary', result });
      }
    }
  
    // Fallback
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  