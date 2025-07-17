const { google } = require('googleapis');

// OAuth2 configuration
const CLIENT_ID = '68294995111-fqqfq544phqnv6t3k2qtrqvr8rhon751.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Generate the URL for authorization
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://mail.google.com/']
});

console.log('🔐 Gmail OAuth2 Token Generator');
console.log('================================');
console.log('');
console.log('Step 1: Visit this URL to authorize the application:');
console.log(authUrl);
console.log('');
console.log('Step 2: After authorization, you will get a code.');
console.log('Step 3: Run this script with the code as an argument:');
console.log('       node generate-oauth-tokens.js YOUR_AUTHORIZATION_CODE');
console.log('');

// If authorization code is provided, exchange it for tokens
if (process.argv[2]) {
  const code = process.argv[2];
  
  oauth2Client.getToken(code)
    .then(({ tokens }) => {
      console.log('✅ Tokens generated successfully!');
      console.log('');
      console.log('Add these to your .env file:');
      console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
      console.log('GOOGLE_ACCESS_TOKEN=' + tokens.access_token);
      console.log('');
      console.log('Your .env file should look like:');
      console.log('EMAIL_USER=hkkhan074@gmail.com');
      console.log('GOOGLE_CLIENT_ID=' + CLIENT_ID);
      console.log('GOOGLE_CLIENT_SECRET=' + CLIENT_SECRET);
      console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
      console.log('GOOGLE_ACCESS_TOKEN=' + tokens.access_token);
    })
    .catch(error => {
      console.error('❌ Error getting tokens:', error);
    });
} 