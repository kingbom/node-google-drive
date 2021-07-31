const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const CLIENT_ID = 'your client ID';
const CLIENT_SECRET = 'your client secret';
const REDRIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = 'your YOUR REFRESH TOKEN GENERATED FROM oauthplayground';

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDRIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
    version : 'v3',
    auth : oauth2Client
});

const filePath = path.join(__dirname, 'img1.jpeg');

const uploadFile = async () => {
   try {
       const response = await drive.files.create({
           requestBody: {
               name :'img1.jpeg',
               mimeType : 'image/jpeg'
           },
           media: {
               mimeType : 'image/jpeg',
               body: fs.createReadStream(filePath)
           }
       });

       console.log(response.data);
   } catch (error) {
       console.error(error.message);
   }
}

const deleteFile = async () => {
    try {
        const response = await drive.files.delete({
            fileId: 'fileId from response uploadFile'
        });
        console.log(response.data, response.status);
    } catch (error) {
        console.error(error.message);
    }
}

const generatePublicUrl = async () => {
    try {
        const fileId = 'fileId from response uploadFile';
        await drive.permissions.create({
            fileId : fileId,
            requestBody : {
                role : 'reader',
                type : 'anyone'
            }
        });

        const response = await drive.files.get({
            fileId : fileId,
            fields : "webViewLink, webContentLink"
        });

        console.log(response.data);
    } catch (error) {
        console.error(error.message);
    }
}

//Test upload file 
//uploadFile();

//Test delete file 
//deleteFile();

//Test generate public url
//uploadFile();
//generatePublicUrl();
