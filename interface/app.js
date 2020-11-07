let express = require('express');
let bodyParser = require('body-parser');
let multer = require('multer');
const fs = require('fs');

//importing google speech api
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();





let app = express();
app.use(bodyParser.urlencoded({extended: true}))

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/home/saumik/audioUpload')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

let upload = multer({ storage: storage })


//Home page
app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');

});

// app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
//     const file = req.file;
//     if (!file) {
//         const error = new Error('Please upload a file')
//         error.httpStatusCode = 400
//         return next(error)
//     }
//     res.send("your file has been uploaded")
//
// })

app.post('/uploadfile', upload.single('myFile'), function (req, res, next) {
    console.log("success");
    console.log(req.file);

//    filename is going to be req.file.path
async function main(){
    const filename = req.file.path;

    const fileGoogle = fs.readFileSync(filename);
    const audioBytes = fileGoogle.toString('base64');

    const audio = {
        content: audioBytes
    };

    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US'
    };

    const request = {
        audio: audio,
        config: config
    };


    const [operation] = client.longRunningRecognize(request);
    const [response] = operation.promise();
    const transcription = response.results.map(result =>
        result.alternatives[0].transcript).join('\n');
    console.log(`Transcription: ${transcription}`);

}

    //calling the async function above
    main().catch(console.error);


    res.status(204).end();


});




app.listen(3000, () => console.log('Server started on port 3000'));
