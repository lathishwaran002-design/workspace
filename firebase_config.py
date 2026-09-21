import firebase_admin
from firebase_admin import credentials, firestore
import os

# Path to your Firebase service account key
SERVICE_ACCOUNT_KEY_PATH = os.path.join(os.path.dirname(__file__), "firebase-adminsdk.json")

def initialize_firebase():
    if not firebase_admin._apps:
        try:
            if os.path.exists(SERVICE_ACCOUNT_KEY_PATH):
                cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin initialized successfully using service account key.")
            else:
                # If you want to use Default Credentials or another method
                print(f"Warning: Service account key not found at {SERVICE_ACCOUNT_KEY_PATH}. Attempting to use default credentials...")
                firebase_admin.initialize_app()
        except Exception as e:
            print(f"Error initializing Firebase: {e}")
            # Do not raise the exception so the app can still start without Firebase

initialize_firebase()

try:
    db = firestore.client()
except Exception as e:
    print(f"Error initializing Firestore client: {e}")
    db = None
