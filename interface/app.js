//Importing the necessary libraries/ node packages
let express = require('express');
let bodyParser = require('body-parser');
let multer = require('multer');
const fs = require('fs');
const speech = require('@google-cloud/speech');
const {Storage} = require('@google-cloud/storage');

const client = new speech.SpeechClient();
let app = express();
app.use(bodyParser.urlencoded({extended: true}))

var dir = '../data';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}



// Creates a client for Google Cloud Storage
const storage = new Storage();

//Using Multer's disk storage engine that stores the file being uploaded
//destination is used to determine within which folder the uploaded files should be stored.
//This can also be given as a string (e.g. '/tmp/uploads'). If no destination is given,
// the operating system's default directory for temporary files is used.

let storagemulter = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../data')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
    });

let upload = multer({ storage: storagemulter })


//Setting the GET and POST routes for the homepage

//GET route for the homepage
app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');

});

//POST route that submits the audio file being converted into notes
app.post('/uploadfile', upload.single('myFile'), function (req, res, next) {
    console.log("success");
    console.log(req.file);


async function main(){
    const filepath = req.file.path;
    const bucketName = 'newhacks_audio';
    const gcsUri = 'gs://newhacks_audio/'+req.file.originalname;
    const fileGoogle = fs.readFileSync(filepath);
    const audioBytes = fileGoogle.toString('base64');


    const audio = {
        uri: gcsUri //This is the url of the storage
    };

    const config = {
        encoding: 'LINEAR16', //The audio encoding
        languageCode: 'en-US' //The language of the audio
    };

    const request = {
        audio: audio,
        config: config
    };

    await storage.bucket(bucketName).upload(filepath, {
        gzip: false,
        metadata: {
            cacheControl: 'no-cache, max-age=0' //Disabling cache on Google Cloud Storage
        },
    });
    //Function below Performs asynchronous speech recognition
    // receive results via the google.longrunning.
    const [operation] = await client.longRunningRecognize(request);
    const [response] = await operation.promise();
    const transcription = response.results.map(result =>
        result.alternatives[0].transcript).join('\n');
    fs.writeFileSync('../full_transcriptions/' + "input.txt", transcription, 'ascii', function (err) {
        if (err) return console.log(err);
        console.log("Transcription written to "+  "input.txt");


    });




    console.log("Running python");
    const spawn = require("child_process").spawn;
    //make sure right python is called
    //Calling the python script that uses TensorFlow to summarise lecture
    const pythonProcess = spawn('python3',["../python/summarize.py", "input.txt"]);

    fs.unlink(req.file.path, (err) => {
        if (err) return console.error(err);
        console.log("Temporary audio files deleted")
    });

}



    //Invoking the async function above
    main().catch(console.error);


    res.status(204).end();


});



//Run the server on port 3000 of local machine
app.listen(3000, () => console.log('Server started on port 3000'));