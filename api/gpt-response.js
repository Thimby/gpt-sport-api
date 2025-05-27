export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // or 'https://growletics.com'
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Preflight request
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Only POST allowed');
  }

  const { age, activity, personality, preference } = req.body;

  const prompt = `
You are a friendly assistant that helps parents choose beginner sports for their kids.

Use the information below to suggest 3 beginner-friendly sports. Each suggestion must be 1 sentence on why it’s a fit and include a link: https://growletics.com/sports/{sport-name}

Respond in clean HTML using <ul>, <li>, <strong>, <p>. NO line breaks or newlines.
Total response must be under 100 words. Keep it very concise.

The parent's input includes:
- Age
- Activity level
- Personality
- Preferences
- Skills
- Limitations
`;

  const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [{ role: 'system', content: prompt }]
    })
  });

  const data = await gptRes.json();
  const html = data.choices?.[0]?.message?.content || 'No response.';

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
