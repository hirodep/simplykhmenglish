
const https = require('https');

exports.handler = async (event) => {
  const q  = (event.queryStringParameters || {}).q  || '';
  const tl = (event.queryStringParameters || {}).tl || 'km';

  if (!q) {
    return { statusCode: 400, body: 'Missing q parameter' };
  }

  const url =
    `https://translate.googleapis.com/translate_tts` +
    `?ie=UTF-8&q=${encodeURIComponent(q)}&tl=${encodeURIComponent(tl)}&client=gtx`;

  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer':    'https://translate.google.com/'
      }
    }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          statusCode: 200,
          headers: {
            'Content-Type':                'audio/mpeg',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control':               'public, max-age=86400'
          },
          body: buffer.toString('base64'),
          isBase64Encoded: true
        });
      });
    });

    req.on('error', (err) => {
      resolve({ statusCode: 500, body: 'TTS fetch error: ' + err.message });
    });

    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ statusCode: 504, body: 'TTS timeout' });
    });
  });
};
