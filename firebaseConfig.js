// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjY68DBd8pojH0eGJSiYh52EcZ_Dm1Xfg",
  authDomain: "chronos-tool.firebaseapp.com",
  databaseURL: "https://chronos-tool-default-rtdb.firebaseio.com",
  projectId: "chronos-tool",
  storageBucket: "chronos-tool.firebasestorage.app",
  messagingSenderId: "181069376031",
  appId: "1:181069376031:web:878970e61dd957880dc32a",
  measurementId: "G-DK35X8H4H2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };
