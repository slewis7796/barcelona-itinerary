export default async function handler(req, res) {
    const GIST_ID = process.env.GIST_ID;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
    const url = `https://api.github.com/gists/${GIST_ID}`;
  
    if (req.method === 'GET') {
      const response = await fetch(url, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      });
      const gist = await response.json();
      const content = gist.files['itinerary.json']?.content || '{}';
      res.status(200).json(JSON.parse(content));
    }
  
    else if (req.method === 'POST') {
      const content = JSON.stringify(req.body, null, 2);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            'itinerary.json': { content },
          },
        }),
      });
      const result = await response.json();
      res.status(200).json({ ok: true, result });
    }
  
    else {
      res.status(405).end();
    }
  }
  