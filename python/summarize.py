from __future__ import print_function
from transformers import pipeline
import sys
import pickle
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import webbrowser

def upload(title, summary, text):
    """Shows basic usage of the Docs API.
    Prints the title of a sample document.
    """
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    
    
    
    if os.path.exists('../python/token.pickle'):
        with open('../python/token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    else:
        print("Run initial_authenticate from python folder!")
        sys.stdout.flush()
        return
    service = build('docs', 'v1', credentials=creds)
    # Retrieve the documents contents from the Docs service.
    body = {
        'title': title
    }
    doc = service.documents().create(body=body).execute()
    
    print('Created document with title: {0}'.format(
        doc.get('title')))
    requests = [
         {
            'insertText': {
                'location': {
                    'index': 1,
                },
                'text': summary
            }
        }
    ]

    result = service.documents().batchUpdate(
        documentId=doc["documentId"], body={'requests': requests}).execute()
    webbrowser.open("https://docs.google.com/document/d/" + doc["documentId"])

if __name__ == "__main__":
    if (len(sys.argv) > 1):
        summarizer = pipeline("summarization")
        with open("../full_transcriptions/" + str(sys.argv[1])) as file:
            input_string = file.read()
            length = len(input_string.strip().split())
            summary = ((summarizer(input_string.strip(), min_length=int(0.2*length), max_length=int(0.25*length)))[0]["summary_text"])
        with open("../summaries/" + str(sys.argv[1]), "w") as file:
            file.write(summary)
        upload(str(sys.argv[1]), summary, input_string)

    else:
        print("requires input string argument")


