// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, get, update } from "firebase/database";
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

// Fetch and display tasks from Firebase Realtime Database
async function fetchTasks() {
  const tasksRef = ref(database, 'tasks');
  const snapshot = await get(tasksRef);
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = ''; // Clear the current task list
  snapshot.forEach((childSnapshot) => {
    const task = childSnapshot.val();
    const taskId = childSnapshot.key;
    const li = document.createElement('li');
    li.textContent = `${task.title} (${task.category})`;

    if (task.completed) {
      li.classList.add('completed'); // Add 'completed' class if the task is marked as completed
    }

    // Add a checkbox to mark the task as complete
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskCompletion(taskId, checkbox, li));
    li.appendChild(checkbox);

    taskList.appendChild(li);
  });
}

// Task form submission
document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
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

  // Add task to Realtime Database
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
  async function toggleTaskCompletion(taskId, checkbox, taskElement) {
    const taskRef = ref(database, 'tasks/' + taskId);
    
    if (checkbox.checked) {
      taskElement.classList.add('completed'); // Add 'completed' class to visually cross out the task
      await update(taskRef, { completed: true });
    } else {
      taskElement.classList.remove('completed'); // Remove 'completed' class when unchecked
      await update(taskRef, { completed: false });
    }
  }

  fetchTasks(); // Initial fetch to load tasks from Firebase
});
