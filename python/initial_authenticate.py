from __future__ import print_function
import pickle
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

if not os.path.exists('../python/token.pickle'):
    print("place Google API credentials.json in the python folder!")
flow = InstalledAppFlow.from_client_secrets_file(
        'credentials.json', ['https://www.googleapis.com/auth/documents'])
creds = flow.run_local_server(port=0)
# Save the credentials for the next run
with open('token.pickle', 'wb') as token:
    pickle.dump(creds, token)