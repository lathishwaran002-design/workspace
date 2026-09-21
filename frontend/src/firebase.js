import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBwXmO1f2diDafbuvzG1ma2nwt4HtE5uvE",
  authDomain: "workshop-project-c2c97.firebaseapp.com",
  projectId: "workshop-project-c2c97",
  storageBucket: "workshop-project-c2c97.firebasestorage.app",
  messagingSenderId: "1054300516854",
  appId: "1:1054300516854:android:d65195242ef7a25a3f17d7" // Mocking web app ID using android one
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
