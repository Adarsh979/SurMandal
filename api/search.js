// Vercel Serverless Function — /api/search?q=song+name
// Runs on server, no CORS issues, API key never exposed to browser

const YT_KEY = 'AIzaSyCFHRCWImY1thLi20nBSZpgMGW3UBfRfYg';

export default async function handler(req, res) {
  // Allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&videoCategoryId=10&q=${encodeURIComponent(q)}&key=${YT_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) return res.status(500).json({ error: data.error.message });
    if (!data.items?.length) return res.status(404).json({ error: 'No results' });

    const item = data.items[0];
    const id = item.id.videoId;

    res.status(200).json({
      id,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumb: item.snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
