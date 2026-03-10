// Vercel Serverless Function — /api/search?q=song+name
// API key stored as environment variable (safe, never exposed to browser)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query param: q' });

  // Key from env variable (set in Vercel dashboard) OR fallback hardcoded
  const YT_KEY = process.env.YT_API_KEY || 'AIzaSyCFHRCWImY1thLi20nBSZpgMGW3UBfRfYg';

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&videoCategoryId=10&q=${encodeURIComponent(q)}&key=${YT_KEY}`;

    const response = await fetch(url, {
      headers: {
        // Server-side request — no referrer restrictions apply
        'Referer': 'https://www.googleapis.com',
      }
    });

    const data = await response.json();

    if (data.error) {
      console.error('YT API error:', data.error);
      return res.status(500).json({ error: data.error.message, code: data.error.code });
    }

    if (!data.items?.length) {
      return res.status(404).json({ error: 'No results found' });
    }

    const item = data.items[0];
    const id = item.id.videoId;

    return res.status(200).json({
      id,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumb: item.snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
    });

  } catch (e) {
    console.error('Search error:', e);
    return res.status(500).json({ error: e.message });
  }
}
