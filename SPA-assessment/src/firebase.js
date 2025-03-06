// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDocs, collection, addDoc, setDoc, doc, getDoc, updateDoc, deleteDoc, query, where, limit } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQFgNMU9uXDgW7tWtQ0gtS0g3tiljGJm0",
  authDomain: "flight-management-3f213.firebaseapp.com",
  projectId: "flight-management-3f213",
  storageBucket: "flight-management-3f213.firebasestorage.app",
  messagingSenderId: "329732591228",
  appId: "1:329732591228:web:6682dabad12fd7e52fc3f9",
  measurementId: "G-KZHMSQQ5HD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, getDocs, collection, addDoc, setDoc, doc, getDoc, updateDoc, deleteDoc, query, where, limit };