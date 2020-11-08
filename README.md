# Lec2Notes
![Image of Website](/readmepic.png)
**Lec2Notes** takes in the audio of your lecture and makes personalized and concise notes for you that you can read on a Google Doc. 

![Image of TheThing](/process.png)

Team members: Harishguna S., Abdulrahman S., Saumik K and Arjun Sharma

## Instructions
This guide assumes that you have python3, pip, node, and npm installed.
```shell
git clone https://github.com/arshar2411/Lecture-Summarizer.git
cd Lecture-Summarizer
pip3 install -r python/requirements.txt --upgrade
```
Download credentials.json from [here](https://developers.google.com/docs/api/quickstart/python). Click "Enable the Google Docs API", choose a project name (irrelevant), click next, stay on Desktop, click next, then DOWNLOAD CLIENT CONFIGURATION. Place this file into the python folder. 
```shell
python3 python/initial_authenticate.py
```
The next step is to create a Google Cloud Platform account with billing setup and a project created, with the necessary permissions, roles, storage bucket, etc. The account we used to test doesn't have enough credit to support all our users/testers. Download the service key json file to your computer.
```shell
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service_key.json
cd interfaces
npm install
node app.js
```
Now just open localhost:3000 on your preferred browser and upload a .wav file containing your lecture. The whole process will take some time, especially if the file is as large as a full lecture. You may leave your computer unattended at this point. A new browser tab with a Google Doc containing the summary will open when the program is finished. At this point you may quit app.js from terminal.



## Code Example
Long audio files (i.e. longer than a minute) are first transcribed using Google Cloud's Speech-to-Text Library. 
Speech is detected in the audio file using the `longRunningRecognize` function. A `Promise` representation of the final result is then obtained. 
```javascript

const [operation] = await client.longRunningRecognize(request);
    const [response] = await operation.promise();
    const transcription = response.results.map(result =>
        result.alternatives[0].transcript).join('\n');
    fs.writeFileSync('../full_transcriptions/' + "input.txt", transcription, 'ascii', function (err) {
        if (err) return console.log(err);
        console.log("Transcription written to "+  "input.txt");


    });
```
The transcribed text is later used to make a summary of the lecture using Pytorch/TensorFlow 2.0 based Natural Language Processing using the Transformers library. 
```python3

from transformers import pipeline
import sys
if (len(sys.argv) > 1):
    summarizer = pipeline("summarization")
    with open("../full_transcriptions/" + str(sys.argv[1])) as file:
        input_string = file.read().strip()
        length = len(input_string.split())
        summary = ((summarizer(input_string, min_length=int(0.2*length), max_length=int(0.25*length)))[0]["summary_text"])
    with open("../summaries/" + str(sys.argv[1]), "w") as file:
        file.write(summary)


```

## How to use?
Just upload an audio file of your lecture and you will be able to view the notes for your lecture on a Google Doc. 

## Tech/framework used
* @google-cloud/speech
* @google-cloud/storage 
* REST APIs
* NodeJS 
* Express
* Tensorflow 
* Python
* HTML/CSS

# Credit
Thanks to all the TAs who volunteered for the hackathon and was there to answer any questions we had regarding Google Cloud Services. 
