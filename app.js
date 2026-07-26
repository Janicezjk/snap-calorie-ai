// SnapCalorie AI App Logic

// Default State & Configuration
const DEFAULT_TARGETS = {
  dailyCalories: 2400,
  protein: 150,
  carbs: 250,
  fats: 70
};

let mealCombos = JSON.parse(localStorage.getItem('snapcalorie_combos')) || [
  {
    id: 'c1',
    name: 'Standard Breakfast Combo',
    calories: 450,
    protein: 24,
    carbs: 52,
    fats: 16
  },
  {
    id: 'c2',
    name: 'High-Protein Gym Meal',
    calories: 680,
    protein: 55,
    carbs: 60,
    fats: 18
  },
  {
    id: 'c3',
    name: 'Light Salad & Protein Shake',
    calories: 320,
    protein: 30,
    carbs: 22,
    fats: 8
  }
];

let selectedCombo = null;

let userTargets = JSON.parse(localStorage.getItem('snapcalorie_targets')) || DEFAULT_TARGETS;
let mealLogs = JSON.parse(localStorage.getItem('snapcalorie_meals')) || [
  {
    id: 1,
    name: 'Grilled Salmon & Quinoa Bowl',
    calories: 520,
    protein: 42,
    carbs: 48,
    fats: 18,
    time: '8:30 AM',
    thumb: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 2,
    name: 'Greek Yogurt & Berry Parfait',
    calories: 280,
    protein: 18,
    carbs: 35,
    fats: 6,
    time: '12:15 PM',
    thumb: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=150&q=80'
  }
];

// Sample AI Recognition Presets for Demonstration & Image Detection Simulation
const AI_FOOD_PRESETS = [
  {
    name: 'Avocado Toast with Poached Egg',
    totalCalories: 410,
    protein: 16,
    carbs: 32,
    fats: 24,
    items: [
      { name: 'Sourdough Bread', portion: '2 slices (80g)', kcal: 180 },
      { name: 'Fresh Avocado', portion: '1/2 medium (75g)', kcal: 120 },
      { name: 'Poached Eggs', portion: '2 large (100g)', kcal: 110 }
    ],
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Chicken Caesar Salad',
    totalCalories: 480,
    protein: 38,
    carbs: 14,
    fats: 30,
    items: [
      { name: 'Grilled Chicken Breast', portion: '150g', kcal: 240 },
      { name: 'Romaine Lettuce & Dressing', portion: '2 cups (120g)', kcal: 190 },
      { name: 'Parmesan & Croutons', portion: '30g', kcal: 50 }
    ],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Ribeye Steak & Roasted Vegetables',
    totalCalories: 680,
    protein: 52,
    carbs: 18,
    fats: 42,
    items: [
      { name: 'Grilled Ribeye Steak', portion: '200g', kcal: 500 },
      { name: 'Roasted Asparagus & Carrots', portion: '150g', kcal: 110 },
      { name: 'Garlic Herb Butter', portion: '15g', kcal: 70 }
    ],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  }
];

let pendingAnalysisResult = null;

// DOM Elements
const scanArea = document.getElementById('scanArea');
const fileInput = document.getElementById('fileInput');
const scanPlaceholder = document.getElementById('scanPlaceholder');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const scanLine = document.getElementById('scanLine');
const captureBtn = document.getElementById('captureBtn');
const reanalyzeBtn = document.getElementById('reanalyzeBtn');

const analysisModal = document.getElementById('analysisModal');
const modalImage = document.getElementById('modalImage');
const detectedItemsList = document.getElementById('detectedItemsList');
const modalTotalCalories = document.getElementById('modalTotalCalories');
const modalTotalP = document.getElementById('modalTotalP');
const modalTotalC = document.getElementById('modalTotalC');
const modalTotalF = document.getElementById('modalTotalF');

const closeModalBtn = document.getElementById('closeModalBtn');
const cancelLogBtn = document.getElementById('cancelLogBtn');
const confirmLogBtn = document.getElementById('confirmLogBtn');

const settingsModal = document.getElementById('settingsModal');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsForm = document.getElementById('settingsForm');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  setupEventListeners();
});

// Render Dashboard Metrics
function renderDashboard() {
  const totals = mealLogs.reduce((acc, meal) => {
    acc.calories += meal.calories;
    acc.protein += meal.protein;
    acc.carbs += meal.carbs;
    acc.fats += meal.fats;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const remainingKcal = userTargets.dailyCalories - totals.calories;
  const progressPercent = Math.min(1, totals.calories / userTargets.dailyCalories);

  // Update Gauge Numbers
  document.getElementById('caloriesRemaining').textContent = remainingKcal.toLocaleString();
  document.getElementById('caloriesTarget').textContent = userTargets.dailyCalories.toLocaleString();

  // SVG Radial Progress (Circumference ~ 515)
  const gaugeProgress = document.getElementById('gaugeProgress');
  const dashOffset = 515 * (1 - progressPercent);
  gaugeProgress.style.strokeDashoffset = dashOffset;

  // Status Pill & Ring Colors based on threshold
  const statusPill = document.getElementById('statusPill');
  if (remainingKcal < 0) {
    statusPill.textContent = 'EXCEEDED';
    statusPill.className = 'status-pill status-exceeded';
    gaugeProgress.style.stroke = 'var(--accent-danger)';
  } else if (remainingKcal < 300) {
    statusPill.textContent = 'NEAR LIMIT';
    statusPill.className = 'status-pill status-warning';
    gaugeProgress.style.stroke = 'var(--accent-warning)';
  } else {
    statusPill.textContent = 'ON TRACK';
    statusPill.className = 'status-pill status-on-track';
    gaugeProgress.style.stroke = 'var(--accent-primary)';
  }

  // Update Macro Progress Bars
  updateMacroBar('protein', totals.protein, userTargets.protein, 'P');
  updateMacroBar('carbs', totals.carbs, userTargets.carbs, 'C');
  updateMacroBar('fats', totals.fats, userTargets.fats, 'F');

  // Render Meal Timeline
  renderMealTimeline();
  // Render Combo Estimator Grid
  renderMealCombos();
}

function renderMealCombos() {
  const comboGrid = document.getElementById('comboGrid');
  comboGrid.innerHTML = mealCombos.map(combo => `
    <div class="combo-box ${selectedCombo && selectedCombo.id === combo.id ? 'selected' : ''}" data-id="${combo.id}">
      <span class="combo-title">${combo.name}</span>
      <div class="combo-macros">
        <span class="combo-kcal">${combo.calories} kcal</span>
        <span class="combo-split">P:${combo.protein}g C:${combo.carbs}g F:${combo.fats}g</span>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.combo-box').forEach(box => {
    box.addEventListener('click', () => {
      const comboId = box.dataset.id;
      const found = mealCombos.find(c => c.id === comboId);
      if (selectedCombo && selectedCombo.id === comboId) {
        selectedCombo = null;
        document.getElementById('comboEstimateBar').classList.add('hidden');
      } else {
        selectedCombo = found;
        document.getElementById('selectedComboTitle').textContent = found.name;
        document.getElementById('selectedComboCalories').textContent = `${found.calories} kcal`;
        document.getElementById('comboEstimateBar').classList.remove('hidden');
      }
      renderMealCombos();
    });
  });
}

function updateMacroBar(macro, current, target) {
  const percent = Math.min(100, Math.round((current / target) * 100));
  document.getElementById(`${macro}Text`).textContent = `${current} / ${target}g`;
  document.getElementById(`${macro}Bar`).style.width = `${percent}%`;
}

function renderMealTimeline() {
  const mealList = document.getElementById('mealList');
  const mealCount = document.getElementById('mealCount');

  mealCount.textContent = `${mealLogs.length} Meals`;
  mealList.innerHTML = mealLogs.map(meal => `
    <div class="meal-item">
      <div class="meal-left">
        <img class="meal-thumb" src="${meal.thumb}" alt="${meal.name}">
        <div class="meal-info">
          <h4>${meal.name}</h4>
          <span>${meal.time} • P: ${meal.protein}g C: ${meal.carbs}g F: ${meal.fats}g</span>
        </div>
      </div>
      <span class="meal-calories">+${meal.calories} kcal</span>
    </div>
  `).join('');
}

// Event Listeners
function setupEventListeners() {
  scanArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);

  captureBtn.addEventListener('click', () => {
    if (fileInput.files.length > 0) {
      processPhotoAnalysis();
    } else {
      fileInput.click();
    }
  });

  reanalyzeBtn.addEventListener('click', () => {
    resetScanner();
    fileInput.click();
  });

  // Modal Controls
  closeModalBtn.addEventListener('click', () => analysisModal.classList.add('hidden'));
  cancelLogBtn.addEventListener('click', () => analysisModal.classList.add('hidden'));
  confirmLogBtn.addEventListener('click', confirmMealLog);

  // Settings Controls
  openSettingsBtn.addEventListener('click', () => {
    document.getElementById('dailyTargetInput').value = userTargets.dailyCalories;
    document.getElementById('proteinTargetInput').value = userTargets.protein;
    document.getElementById('carbsTargetInput').value = userTargets.carbs;
    document.getElementById('fatsTargetInput').value = userTargets.fats;
    settingsModal.classList.remove('hidden');
  });

  closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userTargets = {
      dailyCalories: parseInt(document.getElementById('dailyTargetInput').value, 10),
      protein: parseInt(document.getElementById('proteinTargetInput').value, 10),
      carbs: parseInt(document.getElementById('carbsTargetInput').value, 10),
      fats: parseInt(document.getElementById('fatsTargetInput').value, 10)
    };
    localStorage.setItem('snapcalorie_targets', JSON.stringify(userTargets));
    settingsModal.classList.add('hidden');
    renderDashboard();
  });

// USDA / Open Nutrition Basic Food Ingredients Database (per 100g)
const INGREDIENT_DATABASE = [
  { id: 'chicken_breast', name: 'Chicken Breast (Raw/Cooked)', kcalPer100g: 165, pPer100g: 31, cPer100g: 0, fPer100g: 3.6 },
  { id: 'beef_ribeye', name: 'Beef Ribeye Steak', kcalPer100g: 250, pPer100g: 26, cPer100g: 0, fPer100g: 16 },
  { id: 'salmon_fillet', name: 'Atlantic Salmon Fillet', kcalPer100g: 208, pPer100g: 20, cPer100g: 0, fPer100g: 13 },
  { id: 'egg_whole', name: 'Whole Egg', kcalPer100g: 143, pPer100g: 12.6, cPer100g: 0.7, fPer100g: 9.5 },
  { id: 'egg_white', name: 'Egg Whites', kcalPer100g: 52, pPer100g: 11, cPer100g: 0.7, fPer100g: 0.2 },
  { id: 'brown_rice', name: 'Brown Rice (Cooked)', kcalPer100g: 123, pPer100g: 2.7, cPer100g: 25.6, fPer100g: 1 },
  { id: 'white_rice', name: 'White Rice (Cooked)', kcalPer100g: 130, pPer100g: 2.7, cPer100g: 28, fPer100g: 0.3 },
  { id: 'oats', name: 'Rolled Oats (Raw)', kcalPer100g: 389, pPer100g: 16.9, cPer100g: 66, fPer100g: 6.9 },
  { id: 'bread_sourdough', name: 'Sourdough Bread', kcalPer100g: 230, pPer100g: 8, cPer100g: 45, fPer100g: 1.5 },
  { id: 'sweet_potato', name: 'Sweet Potato (Cooked)', kcalPer100g: 86, pPer100g: 1.6, cPer100g: 20, fPer100g: 0.1 },
  { id: 'potato_white', name: 'White Potato (Boiled)', kcalPer100g: 87, pPer100g: 1.9, cPer100g: 20, fPer100g: 0.1 },
  { id: 'broccoli', name: 'Broccoli (Steamed)', kcalPer100g: 35, pPer100g: 2.4, cPer100g: 7, fPer100g: 0.4 },
  { id: 'spinach', name: 'Fresh Spinach', kcalPer100g: 23, pPer100g: 2.9, cPer100g: 3.6, fPer100g: 0.4 },
  { id: 'avocado', name: 'Fresh Avocado', kcalPer100g: 160, pPer100g: 2, cPer100g: 8.5, fPer100g: 14.7 },
  { id: 'apple', name: 'Apple (Fresh)', kcalPer100g: 52, pPer100g: 0.3, cPer100g: 13.8, fPer100g: 0.2 },
  { id: 'banana', name: 'Banana (Fresh)', kcalPer100g: 89, pPer100g: 1.1, cPer100g: 22.8, fPer100g: 0.3 },
  { id: 'greek_yogurt', name: 'Greek Yogurt (Plain 0%)', kcalPer100g: 59, pPer100g: 10, cPer100g: 3.6, fPer100g: 0.4 },
  { id: 'whey_protein', name: 'Whey Protein Powder', kcalPer100g: 370, pPer100g: 80, cPer100g: 6, fPer100g: 3 },
  { id: 'olive_oil', name: 'Olive Oil', kcalPer100g: 884, pPer100g: 0, cPer100g: 0, fPer100g: 100 },
  { id: 'peanut_butter', name: 'Peanut Butter (Natural)', kcalPer100g: 588, pPer100g: 25, cPer100g: 20, fPer100g: 50 },
  { id: 'almonds', name: 'Almonds (Raw)', kcalPer100g: 579, pPer100g: 21, cPer100g: 22, fPer100g: 50 },
  { id: 'cheddar_cheese', name: 'Cheddar Cheese', kcalPer100g: 403, pPer100g: 25, cPer100g: 1.3, fPer100g: 33 }
];

  // Combo Estimator Modal Listeners
  const createComboBtn = document.getElementById('createComboBtn');
  const comboModal = document.getElementById('comboModal');
  const closeComboModalBtn = document.getElementById('closeComboModalBtn');
  const comboForm = document.getElementById('comboForm');
  const logComboBtn = document.getElementById('logComboBtn');
  const addIngredientRowBtn = document.getElementById('addIngredientRowBtn');
  const ingredientRows = document.getElementById('ingredientRows');

  createComboBtn.addEventListener('click', () => {
    comboModal.classList.remove('hidden');
    // Initialize modal with default ingredient dropdowns
    ingredientRows.innerHTML = '';
    addIngredientRow('chicken_breast', 150);
    addIngredientRow('brown_rice', 120);
    updateLiveComboTotals();
  });

  closeComboModalBtn.addEventListener('click', () => comboModal.classList.add('hidden'));

  addIngredientRowBtn.addEventListener('click', () => {
    addIngredientRow('chicken_breast', 100);
  });

  function addIngredientRow(selectedId = 'chicken_breast', grams = 100) {
    const row = document.createElement('div');
    row.className = 'ingredient-input-row';
    
    // Build <select> options from INGREDIENT_DATABASE
    const optionsHtml = INGREDIENT_DATABASE.map(ing => `
      <option value="${ing.id}" ${ing.id === selectedId ? 'selected' : ''}>${ing.name}</option>
    `).join('');

    row.innerHTML = `
      <select class="ing-select">${optionsHtml}</select>
      <div class="gram-input-wrapper">
        <input type="number" placeholder="Weight" value="${grams}" class="ing-grams" min="1" required>
        <span class="unit-label">g</span>
      </div>
      <div class="row-calculated-badge">
        <span class="row-kcal-val">0 kcal</span>
      </div>
      <button type="button" class="remove-ing-btn" title="Remove ingredient">&times;</button>
    `;

    const selectEl = row.querySelector('.ing-select');
    const gramsInput = row.querySelector('.ing-grams');
    const kcalBadge = row.querySelector('.row-kcal-val');

    const recalculateRow = () => {
      const ingId = selectEl.value;
      const weightGrams = parseFloat(gramsInput.value) || 0;
      const ingData = INGREDIENT_DATABASE.find(item => item.id === ingId) || INGREDIENT_DATABASE[0];

      const multiplier = weightGrams / 100;
      const calculatedKcal = Math.round(ingData.kcalPer100g * multiplier);
      const calculatedP = Math.round(ingData.pPer100g * multiplier);
      const calculatedC = Math.round(ingData.cPer100g * multiplier);
      const calculatedF = Math.round(ingData.fPer100g * multiplier);

      row.dataset.kcal = calculatedKcal;
      row.dataset.p = calculatedP;
      row.dataset.c = calculatedC;
      row.dataset.f = calculatedF;

      kcalBadge.textContent = `${calculatedKcal} kcal`;
      updateLiveComboTotals();
    };

    selectEl.addEventListener('change', recalculateRow);
    gramsInput.addEventListener('input', recalculateRow);

    row.querySelector('.remove-ing-btn').addEventListener('click', () => {
      if (ingredientRows.children.length > 1) {
        row.remove();
        updateLiveComboTotals();
      }
    });

    ingredientRows.appendChild(row);
    recalculateRow();
  }

  function updateLiveComboTotals() {
    let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;
    const rows = ingredientRows.querySelectorAll('.ingredient-input-row');
    rows.forEach(r => {
      totalKcal += parseInt(r.dataset.kcal, 10) || 0;
      totalP += parseInt(r.dataset.p, 10) || 0;
      totalC += parseInt(r.dataset.c, 10) || 0;
      totalF += parseInt(r.dataset.f, 10) || 0;
    });

    document.getElementById('liveComboKcal').textContent = `${totalKcal} kcal`;
    document.getElementById('liveComboMacros').textContent = `P: ${totalP}g | C: ${totalC}g | F: ${totalF}g`;
  }

  comboForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rows = ingredientRows.querySelectorAll('.ingredient-input-row');
    let totalKcal = 0, totalP = 0, totalC = 0, totalF = 0;
    const ingredients = [];

    rows.forEach(r => {
      const ingId = r.querySelector('.ing-select').value;
      const ingData = INGREDIENT_DATABASE.find(item => item.id === ingId) || INGREDIENT_DATABASE[0];
      const ingGrams = parseInt(r.querySelector('.ing-grams').value, 10) || 0;
      
      const multiplier = ingGrams / 100;
      const kcal = Math.round(ingData.kcalPer100g * multiplier);
      const p = Math.round(ingData.pPer100g * multiplier);
      const c = Math.round(ingData.cPer100g * multiplier);
      const f = Math.round(ingData.fPer100g * multiplier);

      totalKcal += kcal;
      totalP += p;
      totalC += c;
      totalF += f;

      ingredients.push({ name: ingData.name, portion: `${ingGrams}g`, kcal, p, c, f });
    });

    const newCombo = {
      id: 'c_' + Date.now(),
      name: document.getElementById('comboNameInput').value,
      calories: totalKcal,
      protein: totalP,
      carbs: totalC,
      fats: totalF,
      ingredients
    };

    mealCombos.push(newCombo);
    localStorage.setItem('snapcalorie_combos', JSON.stringify(mealCombos));
    comboForm.reset();
    comboModal.classList.add('hidden');
    renderMealCombos();
  });

  logComboBtn.addEventListener('click', () => {
    if (!selectedCombo) return;
    const newMeal = {
      id: Date.now(),
      name: `[Combo] ${selectedCombo.name}`,
      calories: selectedCombo.calories,
      protein: selectedCombo.protein,
      carbs: selectedCombo.carbs,
      fats: selectedCombo.fats,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      thumb: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=150&q=80'
    };
    mealLogs.unshift(newMeal);
    localStorage.setItem('snapcalorie_meals', JSON.stringify(mealLogs));
    selectedCombo = null;
    document.getElementById('comboEstimateBar').classList.add('hidden');
    renderDashboard();
  });
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    imagePreview.src = event.target.result;
    scanPlaceholder.classList.add('hidden');
    previewContainer.classList.remove('hidden');
    processPhotoAnalysis(event.target.result);
  };
  reader.readAsDataURL(file);
}

function processPhotoAnalysis(customImageDataUrl) {
  scanLine.classList.remove('hidden');
  captureBtn.disabled = true;
  captureBtn.textContent = 'AI Analyzing Meal...';

  // Simulate AI Vision recognition latency & preset pick
  setTimeout(() => {
    scanLine.classList.add('hidden');
    captureBtn.disabled = false;
    captureBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
      </svg> Snap & Analyze Meal`;
    reanalyzeBtn.classList.remove('hidden');

    // Pick random food preset or build customized entry
    const preset = AI_FOOD_PRESETS[Math.floor(Math.random() * AI_FOOD_PRESETS.length)];
    pendingAnalysisResult = {
      ...preset,
      image: customImageDataUrl || preset.image,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    showAnalysisModal(pendingAnalysisResult);
  }, 1800);
}

function showAnalysisModal(data) {
  modalImage.src = data.image;
  modalTotalCalories.textContent = data.totalCalories;
  modalTotalP.textContent = `${data.protein}g`;
  modalTotalC.textContent = `${data.carbs}g`;
  modalTotalF.textContent = `${data.fats}g`;

  detectedItemsList.innerHTML = data.items.map(item => `
    <div class="food-row">
      <span class="food-name">${item.name}</span>
      <span class="food-portion">${item.portion}</span>
      <span class="food-kcal">${item.kcal} kcal</span>
    </div>
  `).join('');

  analysisModal.classList.remove('hidden');
}

function confirmMealLog() {
  if (!pendingAnalysisResult) return;

  const newMeal = {
    id: Date.now(),
    name: pendingAnalysisResult.name,
    calories: pendingAnalysisResult.totalCalories,
    protein: pendingAnalysisResult.protein,
    carbs: pendingAnalysisResult.carbs,
    fats: pendingAnalysisResult.fats,
    time: pendingAnalysisResult.time,
    thumb: pendingAnalysisResult.image
  };

  mealLogs.unshift(newMeal);
  localStorage.setItem('snapcalorie_meals', JSON.stringify(mealLogs));
  analysisModal.classList.add('hidden');
  resetScanner();
  renderDashboard();
}

function resetScanner() {
  fileInput.value = '';
  scanPlaceholder.classList.remove('hidden');
  previewContainer.classList.add('hidden');
  reanalyzeBtn.classList.add('hidden');
  pendingAnalysisResult = null;
}
