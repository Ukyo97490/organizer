// Données initiales (avec notes)
let tasks = JSON.parse(localStorage.getItem('tasks')) || [
    { id: 1, name: "Créer le design du plugin", date: "2025-09-25", desc: "Utiliser Figma pour le prototype.", note: "Vérifier les couleurs avec le client." },
    { id: 2, name: "Réunion avec l'équipe", date: "2025-09-26", desc: "Présenter le prototype.", note: "Prévoir un rétroprojecteur." },
];

let selectedDate = new Date();
let selectedTaskId = null;
let isPostitEditable = false;

// DOM Elements
const calendarDays = document.getElementById('calendar-days');
const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const formTitle = document.getElementById('form-title');
const taskIdInput = document.getElementById('task-id');
const taskNameInput = document.getElementById('task-name');
const taskDateInput = document.getElementById('task-date');
const taskDescInput = document.getElementById('task-desc');
const postitContent = document.getElementById('postit-content');
const editPostitButton = document.getElementById('edit-postit');
const savePostitButton = document.getElementById('save-postit');
const themeButton = document.getElementById('theme-button');
const selectedDateSpan = document.getElementById('selected-date');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);

    renderCalendar();
    renderTasks();
    updateSelectedDate();

    // Événements
    document.getElementById('prev-month').addEventListener('click', () => {
        selectedDate.setMonth(selectedDate.getMonth() - 1);
        renderCalendar();
        renderTasks();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        selectedDate.setMonth(selectedDate.getMonth() + 1);
        renderCalendar();
        renderTasks();
    });

    taskForm.addEventListener('submit', saveTask);
    document.getElementById('cancel-task').addEventListener('click', resetForm);
    editPostitButton.addEventListener('click', togglePostitEdit);
    savePostitButton.addEventListener('click', savePostit);
    themeButton.addEventListener('click', toggleTheme);
});

// Fonctions
function renderCalendar() {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let days = [];

    // Jours du mois précédent
    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ day: daysInPrevMonth - i, month: month - 1, year: year, currentMonth: false });
    }

    // Jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, month: month, year: year, currentMonth: true });
    }

    document.getElementById('month-year').textContent =
        new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(selectedDate);

    calendarDays.innerHTML = '';
    days.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        if (!day.currentMonth) dayElement.style.color = '#aaa';

        const dateStr = `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
        const hasTasks = tasks.some(task => task.date === dateStr);

        if (hasTasks) dayElement.classList.add('has-tasks');
        if (dateStr === formatDate(selectedDate)) dayElement.classList.add('selected');

        dayElement.innerHTML = `<div class="day-number">${day.day}</div>`;
        dayElement.addEventListener('click', () => {
            selectedDate = new Date(day.year, day.month, day.day);
            renderCalendar();
            renderTasks();
            updateSelectedDate();
        });

        calendarDays.appendChild(dayElement);
    });
}

function renderTasks() {
    const dateStr = formatDate(selectedDate);
    const daysTasks = tasks.filter(task => task.date === dateStr);

    taskList.innerHTML = '';
    if (daysTasks.length === 0) {
        taskList.innerHTML = '<li class="task-item">Aucune tâche pour ce jour.</li>';
        showPostit(null);
        return;
    }

    daysTasks.forEach(task => {
        const taskElement = document.createElement('li');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-name">${task.name}</div>
                <div class="task-actions">
                    <button onclick="editTask(${task.id})"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
                    <button onclick="showPostit(${task.id})"><i class="fas fa-sticky-note"></i></button>
                </div>
            </div>
            <div class="task-desc">${task.desc}</div>
        `;
        taskList.appendChild(taskElement);
    });

    if (daysTasks.length > 0) showPostit(daysTasks[0].id);
    else showPostit(null);
}

function updateSelectedDate() {
    selectedDateSpan.textContent = new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
    }).format(selectedDate);
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function saveTask(e) {
    e.preventDefault();
    const id = taskIdInput.value;
    const name = taskNameInput.value;
    const date = taskDateInput.value;
    const desc = taskDescInput.value;

    if (id) {
        const index = tasks.findIndex(task => task.id == id);
        tasks[index] = { ...tasks[index], name, date, desc };
    } else {
        const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        tasks.push({ id: newId, name, date, desc, note: "" });
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
    resetForm();
    renderCalendar();
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        formTitle.textContent = "Modifier la tâche";
        taskIdInput.value = task.id;
        taskNameInput.value = task.name;
        taskDateInput.value = task.date;
        taskDescInput.value = task.desc;
    }
}

function deleteTask(id) {
    if (confirm("Supprimer cette tâche ?")) {
        tasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        renderCalendar();
    }
}

function showPostit(taskId) {
    selectedTaskId = taskId;
    const task = tasks.find(t => t.id === taskId);
    postitContent.textContent = task ? (task.note || "Aucune note.") : "Sélectionnez une tâche.";
}

function togglePostitEdit() {
    isPostitEditable = !isPostitEditable;
    postitContent.contentEditable = isPostitEditable;
    savePostitButton.style.display = isPostitEditable ? 'inline-block' : 'none';
    editPostitButton.innerHTML = isPostitEditable ? '<i class="fas fa-times"></i>' : '<i class="fas fa-edit"></i>';
    if (isPostitEditable) postitContent.focus();
}

function savePostit() {
    if (selectedTaskId === null) return;
    const taskIndex = tasks.findIndex(t => t.id === selectedTaskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].note = postitContent.textContent;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    togglePostitEdit();
}

function resetForm() {
    formTitle.textContent = "Ajouter une tâche";
    taskForm.reset();
    taskIdInput.value = '';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    themeButton.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Exposer les fonctions globales
window.editTask = editTask;
window.deleteTask = deleteTask;
window.showPostit = showPostit;
