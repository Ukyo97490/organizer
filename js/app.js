// Données simulées
let tasks = [
    { id: 1, name: "Créer le design du plugin", date: "2025-09-25", desc: "Utiliser Figma pour le prototype.", history: ["25/09 - Début du design", "26/09 - Ajout des couleurs"] },
    { id: 2, name: "Réunion avec l'équipe", date: "2025-09-26", desc: "Présenter le prototype.", history: ["26/09 - Réunion reportée au 27"] },
];

let selectedDate = new Date();
let selectedTaskId = null;

// DOM Elements
const calendarDays = document.getElementById('calendar-days');
const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const formTitle = document.getElementById('form-title');
const taskIdInput = document.getElementById('task-id');
const taskNameInput = document.getElementById('task-name');
const taskDateInput = document.getElementById('task-date');
const taskDescInput = document.getElementById('task-desc');
const historyList = document.getElementById('history-list');
const selectedDateSpan = document.getElementById('selected-date');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
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

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTask();
    });

    document.getElementById('cancel-task').addEventListener('click', () => {
        resetForm();
    });
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
        days.push({ day: daysInPrevMonth - i, month: month - 1, year: month === 0 ? year - 1 : year, currentMonth: false });
    }

    // Jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, month: month, year: year, currentMonth: true });
    }

    // Mise à jour de l'affichage
    document.getElementById('month-year').textContent = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(selectedDate);

    calendarDays.innerHTML = '';
    days.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        if (!day.currentMonth) {
            dayElement.style.color = '#aaa';
        }

        const dateStr = `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
        const hasTasks = tasks.some(task => task.date === dateStr);

        if (hasTasks) {
            dayElement.classList.add('has-tasks');
        }

        if (dateStr === formatDate(selectedDate)) {
            dayElement.classList.add('selected');
        }

        dayElement.textContent = day.day;
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
        taskList.innerHTML = '<li>Aucune tâche pour ce jour.</li>';
        return;
    }

    daysTasks.forEach(task => {
        const taskElement = document.createElement('li');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <strong>${task.name}</strong>
            <p>${task.desc}</p>
            <div>
                <button onclick="editTask(${task.id})">Modifier</button>
                <button onclick="deleteTask(${task.id})">Supprimer</button>
                <button onclick="showHistory(${task.id})">Historique</button>
            </div>
        `;
        taskList.appendChild(taskElement);
    });
}

function updateSelectedDate() {
    selectedDateSpan.textContent = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(selectedDate);
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function saveTask() {
    const id = taskIdInput.value;
    const name = taskNameInput.value;
    const date = taskDateInput.value;
    const desc = taskDescInput.value;

    if (id) {
        // Mise à jour
        const index = tasks.findIndex(task => task.id == id);
        tasks[index] = { ...tasks[index], name, date, desc };
    } else {
        // Nouveau
        const newId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
        tasks.push({ id: newId, name, date, desc, history: [] });
    }

    resetForm();
    renderCalendar();
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        formTitle.textContent = 'Modifier la tâche';
        taskIdInput.value = task.id;
        taskNameInput.value = task.name;
        taskDateInput.value = task.date;
        taskDescInput.value = task.desc;
    }
}

function deleteTask(id) {
    if (confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
        tasks = tasks.filter(task => task.id !== id);
        renderTasks();
        renderCalendar();
    }
}

function showHistory(id) {
    const task = tasks.find(task => task.id === id);
    if (task && task.history) {
        historyList.innerHTML = '';
        if (task.history.length === 0) {
            historyList.innerHTML = '<div class="history-item">Aucun historique pour cette tâche.</div>';
        } else {
            task.history.forEach(entry => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.textContent = entry;
                historyList.appendChild(historyItem);
            });
        }
    }
}

function resetForm() {
    formTitle.textContent = 'Ajouter une tâche';
    taskForm.reset();
    taskIdInput.value = '';
}

// Exposer les fonctions au global pour les boutons
window.editTask = editTask;
window.deleteTask = deleteTask;
window.showHistory = showHistory;