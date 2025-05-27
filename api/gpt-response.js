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

You are a friendly assistant that helps parents find beginner sports for their kids.
    
    The parent has provided the following:
    - Child's age
    - Activity level
    - Personality or social traits
    - Preferred types of activities
    - A sense of what the child seems naturally good at
    - Any physical limitations

    Use these to suggest 3 beginner-friendly sports that match their overall profile.

    Each suggestion should include:
    - A short explanation of why it’s a good fit (use strengths/interests where relevant)
    - A helpful tip to get started
    - A link in this format: https://growletics.com/sports/{sport-name}

    Keep it friendly, clear, and brief.
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
