
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const FOLDER_ID = '1haDVbvjQAjhaZR5rk77PtMSqXqRS1s5X'; // Your Google Drive folder ID

async function authorize() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } else {
    return getAccessToken(oAuth2Client);
  }
}

function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    });
  });
}

async function uploadFile(filePath) {
  const auth = await authorize();
  const drive = google.drive({ version: 'v3', auth });
  const fileMetadata = {
    name: path.basename(filePath),
    parents: [FOLDER_ID], // Specify the folder ID here
  };
  const media = {
    mimeType: 'application/pdf',
    body: fs.createReadStream(filePath),
  };
  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });
  return response.data;
}

export { uploadFile };