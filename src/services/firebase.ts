import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDlHZz16yZQojgN38anStfp7wt993vKxhs",
    authDomain: "diagram-assessment.firebaseapp.com",
    projectId: "diagram-assessment",
    storageBucket: "diagram-assessment.firebasestorage.app",
    messagingSenderId: "30220159838",
    appId: "1:30220159838:web:cc3113c3278d6a8ae7ddcf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
