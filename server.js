const express = require('express');
const app = express();
const port = 4000;
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const multer = require('multer');

const multerImage = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'ImageToUpload/'),
        filename: (req, file, cb) => cb(null, file.originalname)
    })
});

const multerMusic = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'MusicToUpload/'),
        filename: (req, file, cb) => cb(null, file.originalname)
    })
});

require("dotenv").config();
app.use(express.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    const url = `https://api.pinata.cloud/data/testAuthentication`;

    return axios.get(url, {
        headers: {
            pinata_api_key: process.env.PinataApiKey,
            pinata_secret_api_key: process.env.PinataSecretKey
        }
    }).then(function (response) {
        console.log(response.data.message);
        res.send(response.data.message);
        //handle your response here
    }).catch(function (error) {
        console.log(error);
        //handle error here
    });
});

app.post('/pinMusicSourceToIPFS', multerMusic.single("music"), (req, res) => {
    console.log("welcome to music source!");
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    let data = new FormData();
    let fsData = fs.createReadStream('./MusicToUpload/' + req.file.filename);
    data.append('file', fsData);
    console.log("let me start music process..");
    return axios.post(url, data, {
        maxBodyLength: 'Infinity',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            pinata_api_key: process.env.PinataApiKey,
            pinata_secret_api_key: process.env.PinataSecretKey
        }
    }).then(function (response) {
        console.log(response.data);
        fs.unlink('./MusicToUpload/' + req.file.filename, (err) => err ? console.log(err) : console.log("deleted mp3 file."));
        res.send(response.data.IpfsHash);
    }).catch(function (error) {
        console.log(error);
    });
});

app.post('/pinAlbumCoverToIPFS', multerImage.single("image"), (req, res) => {
    console.log("welcome to image source!");
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    let data = new FormData();
    let fsData = fs.createReadStream('./ImageToUpload/' + req.file.filename);
    data.append('file', fsData);
    console.log("let me start image process..");
    return axios.post(url, data, {
        maxBodyLength: 'Infinity',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            pinata_api_key: process.env.PinataApiKey,
            pinata_secret_api_key: process.env.PinataSecretKey
        }
    }).then(function (response) {
        console.log(response.data);
        fs.unlink('./ImageToUpload/' + req.file.filename, (err) => err ? console.log(err) : console.log("deleted image file."));
        res.send(response.data.IpfsHash);
    }).catch(function (error) {
        console.log(error);
    });
});

app.post('/pinJsonFileToIPFS', (req, res) => {
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    
    return axios.post(url, req.body, {
        maxBodyLength: 'Infinity',
        headers: {
            pinata_api_key: process.env.PinataApiKey,
            pinata_secret_api_key: process.env.PinataSecretKey
        }
    }).then(function (response) {
        console.log(response.data);
        res.send(response.data.IpfsHash);
    }).catch(function (error) {
        console.log(error);
    });
});

app.post('/pinFileToIPFS', (req, res) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    data.append('file', fs.createReadStream('./axol.jpeg'));

    //You'll need to make sure that the metadata is in the form of a JSON object that's been convered to a string
    //metadata is optional
    const metadata = JSON.stringify({
        name: 'testname',
        keyvalues: {
            exampleKey: 'exampleValue'
        }
    });
    data.append('pinataMetadata', metadata);

    //pinataOptions are optional
    const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
            regions: [
                {
                    id: 'FRA1',
                    desiredReplicationCount: 1
                },
                {
                    id: 'NYC1',
                    desiredReplicationCount: 2
                }
            ]
        }
    });
    data.append('pinataOptions', pinataOptions);


    axios.post(url, data, {
        maxBodyLength: 'Infinity',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            pinata_api_key: process.env.PinataApiKey,
            pinata_secret_api_key: process.env.PinataSecretKey
        }
    }).then(function (response) {
        console.log(response.data);
        res.send();
        //handle your response here
    }).catch(function (error) {
        console.log(error);
        //handle error here
    });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})