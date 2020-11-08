# Lec2Notes
![Image of Website](/readmepic.png)
**Lec2Notes** takes in an audio of your lecture and makes personalized and concise notes for you that you can read on a Google Doc. 


Team members: Harishguna S., Abdulrahman S., Saumik K and Arjun Sharma

## Instructions
pip3 install --user --upgrade tensorflow 
pip3 install transformers

## Code Example
Long audio files (i.e. longer than a minnute) are first transcribed using Google CLous's Speech-to-Text Library. 
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
The transcribed text is later used to make a summary of the lecture using Pytorch and TensorFlow 2.0's Natural Language Processing, Transformers. 
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
* NodeJS 
* Express
* Tensorflow 
* Python
* HTML/CSS

# Credit
Thanks to all the TAs who volunteered for the hackathon and was there to answer any questions we had regarding Google Cloud Services. 
