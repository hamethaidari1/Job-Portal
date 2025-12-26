// public/js/firebase-config.js

// Firebase SDK'larını CDN üzerinden import ediyoruz (Tarayıcı için)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Senin verdiğin konfigürasyon bilgileri
const firebaseConfig = {
    apiKey: "AIzaSyAbK5ohP2ml-uvuE6iNSqyJh6dKvGUR4XM",
    authDomain: "isbul-98273.firebaseapp.com",
    projectId: "isbul-98273",
    storageBucket: "isbul-98273.firebasestorage.app",
    messagingSenderId: "1047890068256",
    appId: "1:1047890068256:web:f03a20768946b702ca0d45",
    measurementId: "G-5766N2J9XF"
};

// Firebase'i Başlat
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Bu fonksiyonları diğer dosyalarda kullanmak için dışarı aktarıyoruz
export { 
    auth, 
    googleProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification, 
    signOut, 
    onAuthStateChanged 
};

console.log("🔥 Firebase Client Başlatıldı!");