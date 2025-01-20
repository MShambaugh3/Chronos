// Firebase imports
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, update } from "firebase/database";

// Firebase configuration
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
const database = getDatabase(app);

// Function to toggle between light and dark modes
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark-mode'); // Toggles the dark mode class on the body
  localStorage.setItem('mode', body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// Check if dark mode was previously saved in localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedMode = localStorage.getItem('mode');
  if (savedMode === 'dark') {
    document.body.classList.add('dark-mode');
  }

  // Add event listener for dark mode button
  const darkModeButton = document.querySelector('.dark-mode-button');
  darkModeButton.addEventListener('click', toggleDarkMode);
});


// Task form submission logic
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

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = document.getElementById('task-title').value;
  let category = taskCategory.value;

  if (category === 'other') {
    category = customCategory.value;
  }

  // Add task to Realtime Database
  const tasksRef = ref(database, 'tasks');
  const newTaskRef = push(tasksRef);

  try {
    await set(newTaskRef, {
      title: title,
      category: category,
      completed: false,
      createdAt: new Date().toISOString()
    });
    alert('Task added successfully!');

    // Add task to the task list in the UI
    addTaskToUI(newTaskRef.key, title, category, false);

    // Reset the form
    taskForm.reset();
    customCategory.style.display = 'none';
    customCategory.required = false;
  } catch (error) {
    console.error('Error adding task:', error);
    alert('Failed to add task. Please try again.');
  }
});

// Fetch tasks on page load and display them
function fetchTasks() {
  const tasksRef = ref(database, 'tasks');
  onValue(tasksRef, (snapshot) => {
    const tasks = snapshot.val();
    taskList.innerHTML = ''; // Clear the existing list
    for (let key in tasks) {
      const task = tasks[key];
      if (!task.completed) {
        addTaskToUI(key, task.title, task.category, task.completed);
      }
    }
  });
}

// Add task to the UI
function addTaskToUI(taskId, title, category, completed) {
  const li = document.createElement('li');
  li.textContent = `${title} (${category})`;

  if (completed) {
    li.classList.add('completed');
  }

  // Add checkbox to mark completion
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = completed;
  checkbox.addEventListener('change', () => toggleTaskCompletion(taskId, checkbox.checked));

  li.appendChild(checkbox);
  taskList.appendChild(li);
}

// Toggle task completion in Firebase
function toggleTaskCompletion(taskId, completed) {
  const taskRef = ref(database, 'tasks/' + taskId);
  update(taskRef, { completed: completed });
  fetchTasks(); // Refresh task list after completion
}

// Notes Page - Drawing & Typing
const notesForm = document.getElementById('notes-form');
const drawingCanvas = document.getElementById('drawing-canvas');
const ctx = drawingCanvas.getContext('2d');
let isDrawing = false;

// Set up drawing canvas
drawingCanvas.addEventListener('mousedown', () => isDrawing = true);
drawingCanvas.addEventListener('mouseup', () => isDrawing = false);
drawingCanvas.addEventListener('mousemove', draw);

function draw(event) {
  if (!isDrawing) return;
  
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#000000';

  ctx.beginPath();
  ctx.moveTo(event.offsetX, event.offsetY);
  ctx.lineTo(event.offsetX, event.offsetY);
  ctx.stroke();
}

// Save drawing and notes to Firebase
notesForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const drawingData = drawingCanvas.toDataURL(); // Save the canvas drawing as a base64 image
  const noteContent = document.getElementById('note-content').value;

  const notesRef = ref(database, 'notes');
  const newNoteRef = push(notesRef);

  try {
    await set(newNoteRef, {
      content: noteContent,
      drawing: drawingData,
      createdAt: new Date().toISOString()
    });
    alert('Note saved successfully!');

    // Clear the form after saving
    notesForm.reset();
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  } catch (error) {
    console.error('Error saving note:', error);
    alert('Failed to save note. Please try again.');
  }
});

// Initial fetch for tasks
fetchTasks();
