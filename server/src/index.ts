import express from 'express';
import cors from 'cors';
import db from './db';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.get('/api/fortunes/random', async (_req, res) => {
  try {
    const fortune = await db<{ id: number; text: string }>('fortunes')
      .orderByRaw('RANDOM()')
      .first();
    if (!fortune) return res.status(404).json({ error: 'No fortunes found.' });
    res.json(fortune);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`🪄 Fortune API listening at http://localhost:${PORT}`);
});
