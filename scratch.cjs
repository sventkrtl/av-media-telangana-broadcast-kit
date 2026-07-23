const https = require('https');
https.get('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/pub?html', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    require('fs').writeFileSync('scratch.html', data);
    console.log('Done');
  });
});
