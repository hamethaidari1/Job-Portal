import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAbK5ohP2ml-uvuE6iNSqyJh6dKvGUR4XM",
    authDomain: "isbul-98273.firebaseapp.com",
    projectId: "isbul-98273",
    storageBucket: "isbul-98273.firebasestorage.app",
    messagingSenderId: "1047890068256",
    appId: "1:1047890068256:web:f03a20768946b702ca0d45",
    measurementId: "G-5766N2J9XF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.firebaseAuth = auth;
window.createUser = createUserWithEmailAndPassword;
window.signInUser = signInWithEmailAndPassword;