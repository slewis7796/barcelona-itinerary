let savedPlan = null;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (savedPlan) {
      return res.status(200).json(savedPlan);
    } else {
      return res.status(200).json({});
    }
  }

  if (req.method === 'POST') {
    try {
      savedPlan = await req.json(); // Parse the request body
      return res.status(200).json({ message: 'Plan saved successfully' });
    } catch (error) {
      return res.status(400).json({ message: 'Invalid JSON body' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
