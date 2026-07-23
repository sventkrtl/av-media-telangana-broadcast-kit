const https = require('https');
https.get('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/pub?html', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data.substring(0, 1000));
    const match = data.match(/gid=(\d+)[^>]*>([^<]+)<\/a>/g);
    console.log(match);
  });
});
