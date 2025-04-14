// Global state variables
let displayElement;
let historyDisplay;
let buttonsContainer;
let acButton;
let memoryLogList;
let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;
let calculationComplete = false;
let currentEquation = '';
let lastResult = null;
let memoryValue = parseFloat(localStorage.getItem('calculator-memory')) || 0;

// Wait until DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize DOM references
  displayElement = document.getElementById('display');
  historyDisplay = document.getElementById('history');
  // Use appropriate class name (e.g., '.calculator-grid' or '.buttons')
  buttonsContainer = document.querySelector('.calculator-grid');
  acButton = document.querySelector('[data-action="clear"]');
  memoryLogList = document.getElementById('memory-log-list');
  const memoryIndicator = document.getElementById('memory-indicator');

  // Initialize display
  if (displayElement) {
    displayElement.value = displayValue;
    console.log('Display initialized with:', displayValue);
  } else {
    console.error('Display element not found!');
  }

  // ----------------------
  // Theme Handling Section
  // ----------------------
  function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.classList.contains('dark-mode') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    html.classList.toggle('dark-mode');

    const themeStyle = document.getElementById('theme-style');
    themeStyle.href = `styles/${newTheme}-mode.css`;
    localStorage.setItem('calculator-theme', newTheme);

    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.textContent = newTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
    console.log('Theme switched to:', newTheme);
  }

  // Set up initial theme from localStorage
  const savedTheme = localStorage.getItem('calculator-theme') || 'dark';
  const html = document.documentElement;
  if (savedTheme === 'light') {
    html.classList.remove('dark-mode');
    document.getElementById('theme-style').href = 'styles/light-mode.css';
    document.getElementById('theme-toggle').textContent = 'Switch to Dark Mode';
  } else {
    html.classList.add('dark-mode');
    document.getElementById('theme-style').href = 'styles/dark-mode.css';
    document.getElementById('theme-toggle').textContent = 'Switch to Light Mode';
  }
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // ----------------------
  // Memory Handling Section
  // ----------------------
  function updateMemoryIndicator() {
    if (memoryIndicator) {
      memoryIndicator.style.display = memoryValue !== 0 ? 'block' : 'none';
    }
  }
  updateMemoryIndicator();

  function logMemoryOperation(message) {
    if (!memoryLogList) return;
    const listItem = document.createElement('li');
    listItem.textContent = message;
    memoryLogList.insertBefore(listItem, memoryLogList.firstChild);
    const maxLogEntries = 15;
    while (memoryLogList.children.length > maxLogEntries) {
      memoryLogList.removeChild(memoryLogList.lastChild);
    }
  }

  function handleMemory(action) {
    const currentValue = parseFloat(displayElement.value) || 0;
    let logMessage = '';

    switch(action) {
      case 'mc':
        memoryValue = 0;
        logMessage = 'Memory Cleared';
        if (memoryLogList) memoryLogList.innerHTML = '';
        break;
      case 'mr':
        displayElement.value = memoryValue;
        displayValue = String(memoryValue);
        logMessage = `Recalled: ${memoryValue}`;
        waitingForSecondOperand = false;
        calculationComplete = false;
        firstOperand = parseFloat(displayValue);
        operator = null;
        currentEquation = displayValue;
        break;
      case 'mplus':
        memoryValue += currentValue;
        logMessage = `${currentValue} Added | Mem: ${memoryValue}`;
        waitingForSecondOperand = true;
        break;
      case 'mminus':
        memoryValue -= currentValue;
        logMessage = `${currentValue} Subtracted | Mem: ${memoryValue}`;
        waitingForSecondOperand = true;
        break;
    }
    localStorage.setItem('calculator-memory', memoryValue);
    updateMemoryIndicator();
    if (logMessage) logMemoryOperation(logMessage);
    updateDisplay();
  }

  // Attach memory button event listeners
  document.querySelectorAll('.memory-button').forEach(btn => {
    btn.addEventListener('click', () => handleMemory(btn.dataset.memory));
  });

  // ----------------------
  // Calculator Functions and Event Listeners
  // ----------------------

  // Example: Update display function (other functions omitted for brevity)
  function updateDisplay() {
    // Update display logic here
    displayElement.value = displayValue;
    // Optionally update the history display, AC/C button text, font size, etc.
  }

  // Add event listeners on calculator buttons
  if (buttonsContainer) {
    buttonsContainer.addEventListener('click', (event) => {
      if (!event.target.matches('button')) return;
      // Process the button click – map actions, digits, etc.
      // (Your existing code for handling button clicks goes here)
    });
  }

  // Add keyboard event listener
  document.addEventListener('keydown', (event) => {
    // Process keyboard input similar to your original logic
  });

  // Initialize the display on load
  updateDisplay();

  console.log('Calculator initialization complete');
});