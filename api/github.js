// api/github.js
export default async function handler(req, res) {
    const token = process.env.GITHUB_TOKEN;
    const response = await fetch('https://api.github.com/repos/slewis7796/barcelona-itinerary/contents/items.json', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      return res.status(500).json({ message: 'Failed to fetch items from GitHub' });
    }
  
    const data = await response.json();
    res.status(200).json(data);  // Return data to the frontend
  }
  