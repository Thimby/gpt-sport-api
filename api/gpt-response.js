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
Respond in pure HTML using <p>, <ul>, <li>, and <strong> tags. Avoid line breaks.
Keep the total response under 100 words.

You are a friendly assistant that helps parents find beginner sports for their kids. Based on age: ${age}, activity: ${activity}, personality: ${personality}, and preference: ${preference}, suggest 3 suitable sports. Include a tip and a link like https://growletics.com/sports/{sport-name}.
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
