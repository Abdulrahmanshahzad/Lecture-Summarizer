let express = require('express');
let bodyParser = require('body-parser');
let multer = require('multer');

let app = express();
app.use(bodyParser.urlencoded({extended: true}))

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
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

app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
    const file = req.file;
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    res.send(file)

})




app.listen(3000, () => console.log('Server started on port 3000'));
