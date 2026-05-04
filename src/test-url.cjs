const https = require('https');
https.get('https://unpkg.com/emoji-datasource-apple@15.0.1/img/apple/64/1f339.png', (res) => {
  console.log('STATUS:', res.statusCode);
  if (res.statusCode >= 300 && res.statusCode < 400) {
    console.log('LOCATION:', res.headers.location);
  }
});
