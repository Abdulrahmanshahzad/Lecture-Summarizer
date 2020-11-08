let express = require('express');
let bodyParser = require('body-parser');
let multer = require('multer');
const fs = require('fs');
//var wavFileInfo = require('wav-file-info');
//importing google speech api
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

let app = express();
app.use(bodyParser.urlencoded({extended: true}))

var dir = '../data';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

let storagemulter = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../data')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
    });

let upload = multer({ storage: storagemulter })


//Home page
app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');

});


app.post('/uploadfile', upload.single('myFile'), function (req, res, next) {
    console.log("success");
    console.log(req.file);

//    filename is going to be req.file.path
async function main(){
    const filepath = req.file.path;
    const bucketName = 'newhacks_audio';
//  const fullPath = './practice/Welcome.wav';
//  var filename = fullPath.replace(/^.*[\\\/]/, '');
    const gcsUri = 'gs://newhacks_audio/'+req.file.originalname;
    const fileGoogle = fs.readFileSync(filepath);
    const audioBytes = fileGoogle.toString('base64');
    // var wavinfo = await wavFileInfo.infoByFilename(filepath, function(err, info){
    //     if (err) throw err;
    //     console.log(info.header.sample_rate);
    //     return info;
    // });
    // console.log(wavinfo);
    //
    const audio = {
        uri: gcsUri
    };

    const config = {
        encoding: 'LINEAR16',
        //sampleRateHertz: wavinfo.header.sample_rate,
        languageCode: 'en-US'
    };

    const request = {
        audio: audio,
        config: config
    };

    await storage.bucket(bucketName).upload(filepath, {
        gzip: false,
        metadata: {
            cacheControl: 'no-cache, max-age=0'
        },
    });
    const [operation] = await client.longRunningRecognize(request);
    const [response] = await operation.promise();
    const transcription = response.results.map(result =>
        result.alternatives[0].transcript).join('\n');
    fs.writeFileSync('../full_transcriptions/' + "input.txt", transcription, 'ascii', function (err) {
        if (err) return console.log(err);
        console.log("Transcription written to "+  "input.txt");


    });

// Get a Promise representation of the final result of the job


    console.log("Running python");
    const spawn = require("child_process").spawn;
    //make sure right python is called
    const pythonProcess = spawn('python3',["../python/summarize.py", "input.txt"]);

    fs.unlink(req.file.path, (err) => {
        if (err) return console.error(err);
        console.log("Temporary audio files deleted")
    });

}



    //calling the async function above
    main().catch(console.error);


    res.status(204).end();


});




app.listen(3000, () => console.log('Server started on port 3000'));