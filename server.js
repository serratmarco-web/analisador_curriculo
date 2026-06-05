const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => res.json({ status: 'ok' }));

app.post('/analyze', async (req, res) => {
  const { messages, max_tokens } = req.body;

  if (!messages) return res.status(400).json({ error: 'messages obrigatório' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key não configurada' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 1000,
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message });
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: 'Erro interno no proxy.' });
  }
});

app.listen(PORT, () => console.log(`Proxy na porta ${PORT}`));
