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

else:
    print("requires input string argument")