from __future__ import print_function
from transformers import pipeline
import sys
import pickle
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

if __name__ == "__main__":
    if (len(sys.argv) > 1):
        summarizer = pipeline("summarization")
        with open("../full_transcriptions/" + str(sys.argv[1])) as file:
            input_string = file.read().strip()
            length = len(input_string.split())
            summary = ((summarizer(input_string, min_length=int(0.2*length), max_length=int(0.25*length)))[0]["summary_text"])
        with open("../summaries/" + str(sys.argv[1]), "w") as file:
            file.write(summary)
        upload(str(sys.argv[1]), summary)

    else:
        print("requires input string argument")


def upload(title, text):
    """Shows basic usage of the Docs API.
    Prints the title of a sample document.
    """
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', ['https://www.googleapis.com/auth/documents'])
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

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
                'text': text
            }
        }
    ]

    result = service.documents().batchUpdate(
        documentId=doc["documentId"], body={'requests': requests}).execute()