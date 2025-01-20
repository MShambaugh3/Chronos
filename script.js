// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, get, remove, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoSGJAFJkkq-EGvT3Zky6hR2_KEWO-Sw8",
  authDomain: "chronos-a67ec.firebaseapp.com",
  databaseURL: "https://chronos-a67ec-default-rtdb.firebaseio.com",
  projectId: "chronos-a67ec",
  storageBucket: "chronos-a67ec.appspot.com",
  messagingSenderId: "900789594969",
  appId: "1:900789594969:web:37ebbc328fb7bb3f3bba48",
  measurementId: "G-JYZMTS9ZKH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
const db = getFirestore(app);          // Firestore Database
const auth = getAuth(app);             // Authentication
const database = getDatabase(app);     // Realtime Database
const storage = getStorage(app);       // Storage

// Example 1: Add a document to Firestore
async function addTaskToFirestore(taskId, taskData) {
  try {
    await setDoc(doc(db, "tasks", taskId), taskData);
    console.log("Task added to Firestore successfully!");
  } catch (error) {
    console.error("Error adding task to Firestore:", error);
  }
}

// Example 2: Save data to Realtime Database
async function saveDataToRealtimeDB(path, data) {
  try {
    await set(ref(database, path), data);
    console.log("Data saved to Realtime Database successfully!");
  } catch (error) {
    console.error("Error saving data to Realtime Database:", error);
  }
}

// Example 3: Authentication (Sign Up and Sign In)
async function signUp(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User signed up successfully!", userCredential.user);
  } catch (error) {
    console.error("Error signing up:", error.message);
  }
}

async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in successfully!", userCredential.user);
  } catch (error) {
    console.error("Error signing in:", error.message);
  }
}

// Example 4: Upload a file to Firebase Storage
async function uploadFileToStorage(filePath, file) {
  try {
    const storageReference = storageRef(storage, filePath);
    await uploadBytes(storageReference, file);
    console.log("File uploaded to Firebase Storage successfully!");
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

// Example Usage
// Uncomment and replace with your test data to test each function

// Add a task to Firestore
// addTaskToFirestore("task1", { title: "Learn Firebase", completed: false, createdAt: new Date() });

// Save data to Realtime Database
// saveDataToRealtimeDB("notes/note1", { content: "This is a test note.", createdAt: new Date() });

// Sign up a new user
// signUp("testuser@example.com", "password123");

// Sign in an existing user
// signIn("testuser@example.com", "password123");

// Upload a file to Firebase Storage
// const file = new File(["Hello, Firebase!"], "hello.txt", { type: "text/plain" });
// uploadFileToStorage("uploads/hello.txt", file);

document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskList = document.getElementById('task-list');
  const taskCategory = document.getElementById('task-category');
  const customCategory = document.getElementById('custom-category');

  taskCategory.addEventListener('change', () => {
    if (taskCategory.value === 'other') {
      customCategory.style.display = 'block';
      customCategory.required = true;
    } else {
      customCategory.style.display = 'none';
      customCategory.required = false;
    }
  });

  // Fetch and display tasks from Firebase Realtime Database
  async function fetchTasks() {
    const tasksRef = ref(database, 'tasks');
    const snapshot = await get(tasksRef);
    taskList.innerHTML = ''; // Clear the current task list
    snapshot.forEach((childSnapshot) => {
      const task = childSnapshot.val();
      const taskId = childSnapshot.key;
      if (!task.completed) {
        const li = document.createElement('li');
        li.textContent = `${task.title} (${task.category})`;
        
        // Add a checkbox to mark the task as complete
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(taskId, checkbox.checked));
        li.appendChild(checkbox);
        
        taskList.appendChild(li);
      }
    });
  }

  fetchTasks(); // Initial fetch to load tasks from Firebase

  // Add task form submission
  taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('task-title').value;
    let category = taskCategory.value;

    if (category === 'other') {
      category = customCategory.value;
    }

    // Add task to Realtime Database
    const tasksRef = ref(database, 'tasks');
    const newTaskRef = ref(tasksRef);

    try {
      await set(newTaskRef, {
        title: title,
        category: category,
        completed: false,
        createdAt: new Date().toISOString()
      });
      alert('Task added successfully!');
      fetchTasks(); // Refresh task list after adding

      // Reset the form
      taskForm.reset();
      customCategory.style.display = 'none';
      customCategory.required = false;
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    }
  });

  // Toggle task completion
  async function toggleTaskCompletion(taskId, completed) {
    const taskRef = ref(database, 'tasks/' + taskId);
    if (completed) {
      // Mark task as completed and remove from UI
      await update(taskRef, { completed: true });
      fetchTasks(); // Refresh task list after completion
    } else {
      // Update task to incomplete
      await update(taskRef, { completed: false });
    }
  }
});
