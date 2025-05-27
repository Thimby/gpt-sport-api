export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

  const { age, activity, personality, preference, strength, limitations } = req.body;

  const prompt = `
You are a friendly assistant helping parents discover beginner sports for their child.

Here is the child's profile:
- Age: ${age}
- Activity level: ${activity}
- Personality: ${personality}
- Preference: ${preference}
- Natural strengths: ${strength || 'Not specified'}
- Limitations: ${limitations || 'None'}

Use this profile to suggest 3 beginner-friendly sports that are a good match.

Each suggestion must include:
- A bold sport name using <strong> tags (e.g. <strong>Archery</strong>)
- A link: https://growletics.com/sports/{sport-name}

Respond only in HTML using <ul> and <li>. Keep it short, friendly, and under 100 words total.
Avoid repeating the same sports unless they are truly the best match.
`;

  try {
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        temperature: 1.2,
        messages: [{ role: 'system', content: prompt }]
      })
    });

    const data = await gptRes.json();
    const html = data.choices?.[0]?.message?.content || 'No response.';

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err) {
    console.error('Error from OpenAI:', err);
    res.status(500).send('Something went wrong.');
  }
}
