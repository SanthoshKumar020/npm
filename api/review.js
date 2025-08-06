export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST supported' });
  }

  const { code, prompt } = req.body;

  if (!code && !prompt) {
    return res.status(400).json({ error: 'Missing code or prompt' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://npm-theta.vercel.app' // Update to your actual domain
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a full-stack AI code reviewer. Review code thoroughly and give suggestions.'
          },
          {
            role: 'user',
            content: prompt || `Review the following code:\n\n${code}`
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: await response.text() });
    }

    const data = await response.json();

    // 👇 Return in expected format
    return res.status(200).json({ review: data.choices[0].message.content });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
