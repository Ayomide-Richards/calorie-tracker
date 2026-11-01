/**
 * CalorieTracker - Pure Vanilla JS Client-Side Calorie & Macro Tracker
 * Persistent browser storage via localStorage
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_ENTRIES_KEY = 'calorie_tracker_entries_v1';
  const STORAGE_GOALS_KEY = 'calorie_tracker_goals_v1';

  // Default Daily Goals
  const DEFAULT_GOALS = {
    calories: 2000,
    protein: 120,
    carbs: 220,
    fat: 65
  };

  // Meal Order & Metadata
  const MEAL_CATEGORIES = [
    { id: 'Breakfast', label: 'Breakfast', icon: '🥣' },
    { id: 'Lunch', label: 'Lunch', icon: '🥗' },
    { id: 'Dinner', label: 'Dinner', icon: '🍲' },
    { id: 'Snack', label: 'Snacks', icon: '🍎' }
  ];

  // Application State
  let currentDate = getTodayDateString();
  let entriesData = loadEntries();
  let goalsData = loadGoals();

  // DOM Elements
  const datePicker = document.getElementById('datePicker');
  const dateDisplay = document.getElementById('dateDisplay');
  const currentDateDisplayTitle = document.getElementById('currentDateDisplayTitle');
  const prevDayBtn = document.getElementById('prevDayBtn');
  const nextDayBtn = document.getElementById('nextDayBtn');
  const todayBtn = document.getElementById('todayBtn');

  // Summary Elements
  const consumedCaloriesEl = document.getElementById('consumedCalories');
  const goalCaloriesEl = document.getElementById('goalCalories');
  const remainingCaloriesEl = document.getElementById('remainingCalories');
  const remainingLabelEl = document.getElementById('remainingLabel');
  const calorieProgressBar = document.getElementById('calorieProgressBar');
  const caloriePercentText = document.getElementById('caloriePercentText');
  const calorieStatusBadge = document.getElementById('calorieStatusBadge');

  // Macro Elements
  const proteinStat = document.getElementById('proteinStat');
  const carbsStat = document.getElementById('carbsStat');
  const fatStat = document.getElementById('fatStat');
  const proteinProgressBar = document.getElementById('proteinProgressBar');
  const carbsProgressBar = document.getElementById('carbsProgressBar');
  const fatProgressBar = document.getElementById('fatProgressBar');
  const proteinKcal = document.getElementById('proteinKcal');
  const carbsKcal = document.getElementById('carbsKcal');
  const fatKcal = document.getElementById('fatKcal');

  // List & Form Elements
  const foodForm = document.getElementById('foodForm');
  const mealsContainer = document.getElementById('mealsContainer');
  const emptyState = document.getElementById('emptyState');
  const clearDayBtn = document.getElementById('clearDayBtn');
  const presetChips = document.querySelectorAll('.chip');

  // Modal & Settings Elements
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
  const settingsForm = document.getElementById('settingsForm');
  const goalInputCalories = document.getElementById('goalInputCalories');
  const goalInputProtein = document.getElementById('goalInputProtein');
  const goalInputCarbs = document.getElementById('goalInputCarbs');
  const goalInputFat = document.getElementById('goalInputFat');

  // Data Export / Import / Reset Elements
  const exportDataBtn = document.getElementById('exportDataBtn');
  const importDataInput = document.getElementById('importDataInput');
  const resetAllBtn = document.getElementById('resetAllBtn');

  /* ==========================================================================
     Helper Functions
     ========================================================================== */

  function getTodayDateString() {
    const today = new Date();
    return formatDateKey(today);
  }

  function formatDateKey(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseDateKey(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function formatHumanDate(dateStr) {
    const todayStr = getTodayDateString();
    const targetDate = parseDateKey(dateStr);
    
    // Check for yesterday / tomorrow
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateKey(yesterday);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateKey(tomorrow);

    if (dateStr === todayStr) {
      return 'Today, ' + targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } else if (dateStr === yesterdayStr) {
      return 'Yesterday, ' + targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } else if (dateStr === tomorrowStr) {
      return 'Tomorrow, ' + targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    return targetDate.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: targetDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  }

  function formatCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /* ==========================================================================
     Storage Operations
     ========================================================================== */

  function loadEntries() {
    try {
      const data = localStorage.getItem(STORAGE_ENTRIES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Failed to load calorie entries from localStorage', e);
      return {};
    }
  }

  function saveEntries() {
    try {
      localStorage.setItem(STORAGE_ENTRIES_KEY, JSON.stringify(entriesData));
    } catch (e) {
      console.error('Failed to save entries to localStorage', e);
      alert('Local storage is full or disabled. Changes could not be saved.');
    }
  }

  function loadGoals() {
    try {
      const data = localStorage.getItem(STORAGE_GOALS_KEY);
      return data ? Object.assign({}, DEFAULT_GOALS, JSON.parse(data)) : { ...DEFAULT_GOALS };
    } catch (e) {
      console.error('Failed to load goals from localStorage', e);
      return { ...DEFAULT_GOALS };
    }
  }

  function saveGoals() {
    try {
      localStorage.setItem(STORAGE_GOALS_KEY, JSON.stringify(goalsData));
    } catch (e) {
      console.error('Failed to save goals to localStorage', e);
    }
  }

  /* ==========================================================================
     Render Application State
     ========================================================================== */

  function render() {
    // 1. Sync Date Navigator
    datePicker.value = currentDate;
    const readableDate = formatHumanDate(currentDate);
    dateDisplay.textContent = readableDate;
    currentDateDisplayTitle.textContent = readableDate;

    // 2. Compute Daily Totals
    const dailyItems = entriesData[currentDate] || [];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    dailyItems.forEach(item => {
      totalCalories += Number(item.calories) || 0;
      totalProtein += Number(item.protein) || 0;
      totalCarbs += Number(item.carbs) || 0;
      totalFat += Number(item.fat) || 0;
    });

    // Round macro numbers for clean display
    totalProtein = Math.round(totalProtein * 10) / 10;
    totalCarbs = Math.round(totalCarbs * 10) / 10;
    totalFat = Math.round(totalFat * 10) / 10;

    // 3. Render Calorie Summary Cards
    const goalCal = goalsData.calories;
    const remaining = goalCal - totalCalories;
    const percentCal = goalCal > 0 ? Math.round((totalCalories / goalCal) * 100) : 0;

    consumedCaloriesEl.textContent = totalCalories.toLocaleString();
    goalCaloriesEl.textContent = goalCal.toLocaleString();

    const highlightMetric = document.querySelector('.metric.highlight');

    if (remaining >= 0) {
      remainingLabelEl.textContent = 'Remaining';
      remainingCaloriesEl.textContent = remaining.toLocaleString();
      highlightMetric.classList.remove('over');
    } else {
      remainingLabelEl.textContent = 'Over by';
      remainingCaloriesEl.textContent = Math.abs(remaining).toLocaleString();
      highlightMetric.classList.add('over');
    }

    // Progress Bar & Badges
    const clampedWidth = Math.min(percentCal, 100);
    calorieProgressBar.style.width = clampedWidth + '%';
    calorieProgressBar.className = 'progress-bar-fill';

    if (totalCalories > goalCal) {
      calorieProgressBar.classList.add('exceeded');
      calorieStatusBadge.className = 'badge badge-danger';
      calorieStatusBadge.textContent = 'Goal Exceeded';
    } else if (percentCal >= 90) {
      calorieProgressBar.classList.add('warning');
      calorieStatusBadge.className = 'badge badge-warning';
      calorieStatusBadge.textContent = 'Near Limit';
    } else {
      calorieStatusBadge.className = 'badge badge-normal';
      calorieStatusBadge.textContent = 'On Track';
    }

    caloriePercentText.textContent = `${percentCal}% of daily target (${totalCalories} / ${goalCal} kcal)`;

    // 4. Render Macro Breakdown
    renderMacro(proteinStat, proteinProgressBar, proteinKcal, totalProtein, goalsData.protein, 4);
    renderMacro(carbsStat, carbsProgressBar, carbsKcal, totalCarbs, goalsData.carbs, 4);
    renderMacro(fatStat, fatProgressBar, fatKcal, totalFat, goalsData.fat, 9);

    // 5. Render Meals List Grouped by Category
    renderMealsList(dailyItems);
  }

  function renderMacro(textEl, barEl, kcalEl, currentVal, targetVal, kcalPerGram) {
    textEl.textContent = `${currentVal}g / ${targetVal}g`;
    const percent = targetVal > 0 ? Math.min(Math.round((currentVal / targetVal) * 100), 100) : 0;
    barEl.style.width = percent + '%';
    const kcalValue = Math.round(currentVal * kcalPerGram);
    kcalEl.textContent = `${kcalValue} kcal (${percent}%)`;
  }

  function renderMealsList(items) {
    mealsContainer.innerHTML = '';

    if (!items || items.length === 0) {
      emptyState.classList.add('visible');
      clearDayBtn.style.display = 'none';
      return;
    }

    emptyState.classList.remove('visible');
    clearDayBtn.style.display = 'inline-flex';

    // Group items by category
    MEAL_CATEGORIES.forEach(cat => {
      const categoryItems = items.filter(item => item.meal === cat.id);
      if (categoryItems.length === 0) return;

      const categoryTotalKcal = categoryItems.reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0);

      const categoryCard = document.createElement('div');
      categoryCard.className = 'meal-category-card';

      // Header
      const header = document.createElement('div');
      header.className = 'category-header';
      header.innerHTML = `
        <div class="category-title-group">
          <span class="category-icon">${cat.icon}</span>
          <span class="category-title">${cat.label}</span>
          <span class="category-count">(${categoryItems.length} ${categoryItems.length === 1 ? 'item' : 'items'})</span>
        </div>
        <span class="category-total-kcal">${categoryTotalKcal.toLocaleString()} kcal</span>
      `;
      categoryCard.appendChild(header);

      // Items list
      const list = document.createElement('ul');
      list.className = 'category-item-list';

      categoryItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'food-item';

        // Macro tags
        let macroBadgesHtml = '';
        if (item.protein > 0) macroBadgesHtml += `<span class="macro-badge macro-p">P: ${item.protein}g</span>`;
        if (item.carbs > 0) macroBadgesHtml += `<span class="macro-badge macro-c">C: ${item.carbs}g</span>`;
        if (item.fat > 0) macroBadgesHtml += `<span class="macro-badge macro-f">F: ${item.fat}g</span>`;

        li.innerHTML = `
          <div class="food-item-info">
            <span class="food-item-name">${escapeHtml(item.name)}</span>
            <div class="food-item-meta">
              <span>${item.time || ''}</span>
              ${macroBadgesHtml}
            </div>
          </div>
          <div class="food-item-right">
            <span class="food-item-calories">${Number(item.calories).toLocaleString()} <small>kcal</small></span>
            <button class="btn-delete" title="Delete entry" data-id="${item.id}">&times;</button>
          </div>
        `;

        list.appendChild(li);
      });

      categoryCard.appendChild(list);
      mealsContainer.appendChild(categoryCard);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ==========================================================================
     Item Management
     ========================================================================== */

  function addFoodEntry(meal, name, calories, protein, carbs, fat) {
    const newItem = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      meal: meal,
      name: name.trim(),
      calories: Math.max(0, parseInt(calories, 10) || 0),
      protein: Math.max(0, parseFloat(protein) || 0),
      carbs: Math.max(0, parseFloat(carbs) || 0),
      fat: Math.max(0, parseFloat(fat) || 0),
      time: formatCurrentTime()
    };

    if (!entriesData[currentDate]) {
      entriesData[currentDate] = [];
    }

    entriesData[currentDate].push(newItem);
    saveEntries();
    render();
  }

  function deleteFoodEntry(id) {
    if (!entriesData[currentDate]) return;

    entriesData[currentDate] = entriesData[currentDate].filter(item => item.id !== id);
    if (entriesData[currentDate].length === 0) {
      delete entriesData[currentDate];
    }

    saveEntries();
    render();
  }

  function clearCurrentDay() {
    if (!entriesData[currentDate] || entriesData[currentDate].length === 0) return;

    const readableDate = formatHumanDate(currentDate);
    if (confirm(`Are you sure you want to delete all entries for ${readableDate}?`)) {
      delete entriesData[currentDate];
      saveEntries();
      render();
    }
  }

  /* ==========================================================================
     Event Listeners
     ========================================================================== */

  // Food Form Submission
  foodForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const mealType = document.getElementById('mealType').value;
    const foodName = document.getElementById('foodName').value;
    const calories = document.getElementById('calories').value;
    const protein = document.getElementById('protein').value;
    const carbs = document.getElementById('carbs').value;
    const fat = document.getElementById('fat').value;

    if (!foodName || calories === '') return;

    addFoodEntry(mealType, foodName, calories, protein, carbs, fat);

    // Reset Form Fields
    foodForm.reset();
    document.getElementById('mealType').value = mealType; // Keep selected meal type
    document.getElementById('foodName').focus();
  });

  // Quick Preset Chips Click
  presetChips.forEach(chip => {
    chip.addEventListener('click', function () {
      const name = this.getAttribute('data-name');
      const kcal = this.getAttribute('data-kcal');
      const protein = this.getAttribute('data-protein') || 0;
      const carbs = this.getAttribute('data-carbs') || 0;
      const fat = this.getAttribute('data-fat') || 0;
      const meal = this.getAttribute('data-meal') || 'Snack';

      addFoodEntry(meal, name, kcal, protein, carbs, fat);
    });
  });

  // Event Delegation for Delete Buttons in Meals List
  mealsContainer.addEventListener('click', function (e) {
    const deleteBtn = e.target.closest('.btn-delete');
    if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      if (id) {
        deleteFoodEntry(id);
      }
    }
  });

  // Date Navigation
  datePicker.addEventListener('change', function () {
    if (this.value) {
      currentDate = this.value;
      render();
    }
  });

  prevDayBtn.addEventListener('click', function () {
    const d = parseDateKey(currentDate);
    d.setDate(d.getDate() - 1);
    currentDate = formatDateKey(d);
    render();
  });

  nextDayBtn.addEventListener('click', function () {
    const d = parseDateKey(currentDate);
    d.setDate(d.getDate() + 1);
    currentDate = formatDateKey(d);
    render();
  });

  todayBtn.addEventListener('click', function () {
    currentDate = getTodayDateString();
    render();
  });

  clearDayBtn.addEventListener('click', clearCurrentDay);

  // Settings Modal
  function openSettingsModal() {
    goalInputCalories.value = goalsData.calories;
    goalInputProtein.value = goalsData.protein;
    goalInputCarbs.value = goalsData.carbs;
    goalInputFat.value = goalsData.fat;
    settingsModal.classList.add('open');
    goalInputCalories.focus();
  }

  function closeSettingsModal() {
    settingsModal.classList.remove('open');
  }

  settingsBtn.addEventListener('click', openSettingsModal);
  closeModalBtn.addEventListener('click', closeSettingsModal);
  cancelSettingsBtn.addEventListener('click', closeSettingsModal);

  settingsModal.addEventListener('click', function (e) {
    if (e.target === settingsModal) {
      closeSettingsModal();
    }
  });

  settingsForm.addEventListener('submit', function (e) {
    e.preventDefault();

    goalsData.calories = Math.max(100, parseInt(goalInputCalories.value, 10) || 2000);
    goalsData.protein = Math.max(0, parseInt(goalInputProtein.value, 10) || 0);
    goalsData.carbs = Math.max(0, parseInt(goalInputCarbs.value, 10) || 0);
    goalsData.fat = Math.max(0, parseInt(goalInputFat.value, 10) || 0);

    saveGoals();
    closeSettingsModal();
    render();
  });

  // JSON Data Backup Export
  exportDataBtn.addEventListener('click', function () {
    const exportPayload = {
      version: 1,
      exportDate: new Date().toISOString(),
      goals: goalsData,
      entries: entriesData
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `calorie_tracker_backup_${currentDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // JSON Data Import
  importDataInput.addEventListener('change', function (e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && (imported.entries || imported.goals)) {
          if (confirm('Importing this file will merge existing log entries and update your daily goals. Continue?')) {
            if (imported.goals) {
              goalsData = Object.assign({}, DEFAULT_GOALS, imported.goals);
              saveGoals();
            }
            if (imported.entries) {
              entriesData = Object.assign({}, entriesData, imported.entries);
              saveEntries();
            }
            render();
            alert('Backup data successfully imported!');
          }
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse the backup JSON file.');
      }
      importDataInput.value = '';
    };
    reader.readAsText(file);
  });

  // Reset All Local Storage Data
  resetAllBtn.addEventListener('click', function () {
    if (confirm('WARNING: This will permanently delete ALL logged food entries and reset your goals to defaults. Continue?')) {
      localStorage.removeItem(STORAGE_ENTRIES_KEY);
      localStorage.removeItem(STORAGE_GOALS_KEY);
      entriesData = {};
      goalsData = { ...DEFAULT_GOALS };
      render();
      alert('All local storage data has been cleared.');
    }
  });

  /* ==========================================================================
     Initial Launch
     ========================================================================== */
  render();

})();

