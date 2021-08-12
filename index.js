const { google } = require('googleapis');
const express = require('express');
const fileupload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(fileupload({
    limits: { fileSize: 30 * 1024 * 1024 }
}));


const KEY_FILE = 'credentials.json';
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile : KEY_FILE,
    scopes : SCOPES
}
);

const drive = google.drive({
    version : 'v3',
    auth : auth
});

const uploadFile = async (name, mimeType, filePath) => {
   try {
       return await drive.files.create({
           requestBody: {
               name ,
               mimeType 
           },
           media: {
               mimeType ,
               body: fs.createReadStream(filePath)
           }
       });
   } catch (error) {
       console.error(error.message);
   }
}

const deleteFile = async (fileId) => {
    try {
        return await drive.files.delete( { fileId } );
    } catch (error) {
        console.error(error.message);
    }
}

const generatePublicUrl = async (fileId) => {
    try {
        await drive.permissions.create({
            fileId ,
            requestBody : {
                role : 'reader',
                type : 'anyone'
            }
        });

        return await drive.files.get({
            fileId ,
            fields : "webViewLink, webContentLink"
        });
    } catch (error) {
        console.error(error.message);
    }
}

app.post('/upload', async (req, res) => {
    if (req.files) {
        const { file } = req.files;
        const { name , mimetype } = file;

        await file.mv(`${__dirname}/tmp/${name}`, (err) => {
            if (err) {
                console.log(err)
                res.send('There is error')
            }
        });

        const filePath = path.join(`${__dirname}/tmp`, name);
        const response = await uploadFile(name, mimetype, filePath);
        
        fs.unlinkSync(filePath);

        res.json(response.data);

    } else {
        res.send('There are no files')
    }
});

app.get('/file/:fileId', async (req, res) => {
    const { fileId } = req.params;
    if (fileId) {
        const response = await generatePublicUrl(fileId);
        res.json(response.data);
    } else {
        res.send('Require params')
    }
});

app.delete('/file/:fileId', async (req, res) => {
    const { fileId } = req.params;
    if (fileId) {
        const response = await deleteFile(fileId);
        res.json(response);
    } else {
        res.send('Require params')
    }
})


app.listen(3000, () => console.log('running on port 3000'));
