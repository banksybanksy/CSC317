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
  // Grab DOM elements
  displayElement = document.getElementById('display');
  historyDisplay = document.getElementById('history');
  // Make sure to use the correct container class (change '.calculator-grid' if needed)
  buttonsContainer = document.querySelector('.calculator-grid');
  acButton = document.querySelector('[data-action="clear"]');
  memoryLogList = document.getElementById('memory-log-list');
  const memoryIndicator = document.getElementById('memory-indicator');

  // Initialize display with the starting value
  if (displayElement) {
    displayElement.value = displayValue;
    console.log('Display initialized with:', displayValue);
  } else {
    console.error('Display element not found!');
  }

  // -------------------
  // Theme Handling
  // -------------------
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

  // Set initial theme based on localStorage (default to dark)
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

  // -------------------
  // Memory Handling
  // -------------------
  function updateMemoryIndicator() {
    if (memoryIndicator) {
      memoryIndicator.style.display = memoryValue !== 0 ? 'block' : 'none';
    }
  }

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

  updateMemoryIndicator();

  // Set up memory buttons
  document.querySelectorAll('.memory-button').forEach(btn => {
    const action = btn.dataset.memory;
    btn.addEventListener('click', () => handleMemory(action));
  });

  // -------------------
  // Calculator Utility Functions
  // -------------------

  // Adjust the font size based on display length
  function updateFontSize() {
    const maxLength = 11;
    const baseSize = 48;
    const minSize = 24;
    const currentLength = displayElement.value.length;
    if (currentLength <= maxLength) {
      displayElement.style.fontSize = `${baseSize}px`;
    } else {
      const newSize = Math.max(baseSize * (maxLength / currentLength), minSize);
      displayElement.style.fontSize = `${newSize}px`;
    }
  }

  // Update the calculator display and history
  function updateDisplay() {
    let mainDisplay;
    if (calculationComplete) {
      mainDisplay = displayValue;
      historyDisplay.textContent = currentEquation;
    } else if (operator) {
      mainDisplay = currentEquation + (waitingForSecondOperand ? '' : displayValue);
      historyDisplay.textContent = '';
    } else {
      mainDisplay = displayValue;
      historyDisplay.textContent = '';
    }

    // Dynamic font sizing
    const baseSize = 48;
    const minSize = 24;
    const maxCharacters = 11;
    let textLength = mainDisplay.length;
    let newSize = baseSize;
    if (textLength > maxCharacters) {
      newSize = baseSize * (maxCharacters / textLength);
      newSize = Math.max(newSize, minSize);
    }
    displayElement.style.fontSize = `${newSize}px`;
    displayElement.value = mainDisplay;

    // Update the AC/C button text
    acButton.textContent = (displayValue === '0' && !currentEquation) || calculationComplete ? 'AC' : 'C';
  }

  // Reset the calculator to its initial state
  function resetCalculator() {
    displayValue = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    currentEquation = '';
    calculationComplete = false;
    updateDisplay();
  }

  // Handle delete/backspace actions
  function handleDelete() {
    if (calculationComplete || displayValue === 'Error') {
      resetCalculator();
      return;
    }
    if (waitingForSecondOperand) {
      operator = null;
      waitingForSecondOperand = false;
      currentEquation = String(firstOperand);
      displayValue = currentEquation;
    } else if (operator === null) {
      displayValue = displayValue.length === 1 ? '0' : displayValue.slice(0, -1);
      currentEquation = displayValue;
    } else {
      if (displayValue === "") {
        operator = null;
        waitingForSecondOperand = false;
        currentEquation = String(firstOperand);
        displayValue = currentEquation;
      } else {
        displayValue = displayValue.length === 1 ? "" : displayValue.slice(0, -1);
        currentEquation = String(firstOperand) + getOperatorSymbol(operator) + displayValue;
      }
    }
    updateDisplay();
  }

  // Handles digit entry
  function inputDigit(digit) {
    if (displayValue === 'Error') return;
    if (lastResult !== null) {
      displayValue = '';
      lastResult = null;
      currentEquation = '';
    }
    if (displayValue === '0' && digit === '0') return;
    displayValue = displayValue === '0' && digit !== '.' ? digit : displayValue + digit;
    updateDisplay();
  }

  // Handles decimal point entry
  function inputDecimal(dot) {
    if (calculationComplete) {
      resetCalculator();
      displayValue = '0.';
    } else if (waitingForSecondOperand) {
      displayValue = '0.';
      waitingForSecondOperand = false;
    } else if (!displayValue.includes(dot)) {
      displayValue += dot;
    }
    updateDisplay();
  }

  // Returns the proper operator symbol with spaces
  function getOperatorSymbol(op) {
    const symbols = {
      add: ' + ',
      subtract: ' - ',
      multiply: ' × ',
      divide: ' ÷ '
    };
    return symbols[op] || '';
  }

  // Handles operator button presses
  function handleOperator(nextOperator) {
    if (displayValue === 'Error') return;
    const inputValue = parseFloat(displayValue);
    if (calculationComplete) {
      firstOperand = inputValue;
      currentEquation = displayValue;
      calculationComplete = false;
    } else if (operator && waitingForSecondOperand) {
      operator = nextOperator;
      currentEquation = currentEquation.slice(0, -3);
    } else if (operator) {
      firstOperand = parseFloat(currentEquation);
      currentEquation += displayValue;
    } else {
      firstOperand = inputValue;
      currentEquation = displayValue;
    }
    operator = nextOperator;
    waitingForSecondOperand = true;
    currentEquation += getOperatorSymbol(nextOperator);
    updateDisplay();
  }

  // Handles the equals (=) button press
  function handleEquals() {
    if (displayValue === 'Error' || !operator || waitingForSecondOperand) return;
    const fullEquation = currentEquation + displayValue;
    const parts = fullEquation.split(/\s*[+×÷-]\s*/);
    const operators = fullEquation.match(/[+×÷-]/g);
    let result = parseFloat(parts[0]);
    for (let i = 0; i < operators.length; i++) {
      const nextNum = parseFloat(parts[i + 1]);
      switch (operators[i]) {
        case '+': result += nextNum; break;
        case '-': result -= nextNum; break;
        case '×': result *= nextNum; break;
        case '÷':
          result = nextNum === 0 ? 'Error' : result / nextNum;
          break;
      }
      if (result === 'Error') break;
    }
    if (result === 'Error') {
      displayValue = 'Error';
      currentEquation = fullEquation + ' =';
    } else {
      displayValue = String(parseFloat(result.toFixed(10)));
      currentEquation = fullEquation + ' =';
      firstOperand = result;
    }
    operator = null;
    waitingForSecondOperand = false;
    calculationComplete = true;
    updateDisplay();
  }

  // Toggle the sign of the current number
  function toggleSign() {
    if (displayValue === 'Error') return;
    const currentNumber = parseFloat(displayValue);
    if (currentNumber !== 0) {
      displayValue = String(-currentNumber);
      updateDisplay();
    }
  }

  // Convert the current number into a percentage
  function inputPercentage() {
    if (displayValue === 'Error') return;
    const currentNumber = parseFloat(displayValue);
    displayValue = String(currentNumber / 100);
    updateDisplay();
  }

  // -------------------
  // Event Listeners
  // -------------------

  // Click events on calculator buttons
  if (buttonsContainer) {
    buttonsContainer.addEventListener('click', (event) => {
      if (!event.target.matches('button')) return;
      if (displayValue === 'Error' && event.target.dataset.action !== 'clear') return;
      const button = event.target;
      const action = button.dataset.action;
      const value = button.dataset.value;
      const actions = {
        add: () => handleOperator('add'),
        subtract: () => handleOperator('subtract'),
        multiply: () => handleOperator('multiply'),
        divide: () => handleOperator('divide'),
        decimal: () => inputDecimal('.'),
        clear: () => acButton.textContent === 'C' ? handleDelete() : resetCalculator(),
        calculate: () => handleEquals(),
        'toggle-sign': () => toggleSign(),
        percentage: () => inputPercentage()
      };
      if (action in actions) {
        actions[action]();
      } else if (button.classList.contains('number')) {
        inputDigit(value);
      }
    });
  }

  // Keyboard support
  document.addEventListener('keydown', (event) => {
    if (displayValue === 'Error' && event.key !== 'Escape' && event.key !== 'Delete' && event.key !== 'Backspace') {
      return;
    }
    let keyAction = null;
    let keyValue = null;
    if (event.key >= '0' && event.key <= '9') {
      inputDigit(event.key);
      keyAction = 'number';
      keyValue = event.key;
    } else if (event.key === '.') {
      inputDecimal('.');
      keyAction = 'decimal';
    } else if (event.key === '+') {
      handleOperator('add');
      keyAction = 'operator';
    } else if (event.key === '-') {
      handleOperator('subtract');
      keyAction = 'operator';
    } else if (event.key === '*') {
      handleOperator('multiply');
      keyAction = 'operator';
    } else if (event.key === '/') {
      event.preventDefault();
      handleOperator('divide');
      keyAction = 'operator';
    } else if (event.key === '=' || event.key === 'Enter') {
      event.preventDefault();
      handleEquals();
      keyAction = 'calculate';
    } else if (event.key === 'Escape') {
      resetCalculator();
      keyAction = 'clear';
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      handleDelete();
      keyAction = 'delete';
    } else if (event.key === '%') {
      inputPercentage();
      keyAction = 'percentage';
    }
    // Visual feedback (if needed)
    let targetButton = null;
    if (keyAction === 'number') {
      targetButton = document.querySelector(`button[data-value="${keyValue}"]`);
    } else if (keyAction === 'operator') {
      const opMap = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide' };
      targetButton = document.querySelector(`button[data-action="${opMap[event.key]}"]`);
    } else if (keyAction === 'calculate') {
      targetButton = document.querySelector(`button[data-action="calculate"]`);
    } else if (keyAction === 'decimal') {
      targetButton = document.querySelector(`button[data-action="decimal"]`);
    } else if (keyAction === 'clear') {
      targetButton = document.querySelector(`button[data-action="clear"]`);
    }
    if (targetButton) {
      targetButton.classList.add('active-key');
      setTimeout(() => targetButton.classList.remove('active-key'), 100);
    }
  });

  // Initialize display on first load
  updateDisplay();

  console.log('Calculator initialization complete');
});