/* calculator.js */
let displayElement;
let historyDisplay;
let clearButton;
let memoryLogList;
let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;
let calculationComplete = false;
let currentEquation = '';
let lastResult = null;
let memoryValue = parseFloat(localStorage.getItem('calculator-memory')) || 0;

document.addEventListener('DOMContentLoaded', function () {
  displayElement = document.getElementById('display');
  historyDisplay = document.getElementById('history');
  clearButton = document.getElementById('clear');
  memoryLogList = document.getElementById('memory-log-list');

  // Initialize displays
  updateDisplay();

  // Theme toggle
  function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    document.getElementById('theme-style').href =
      newTheme === 'dark' ? 'styles/styles.css' : 'styles/light-mode.css';
    localStorage.setItem('calculator-theme', newTheme);
    document.getElementById('theme-toggle').textContent =
      newTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  }
  const savedTheme = localStorage.getItem('calculator-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.getElementById('theme-style').href =
    savedTheme === 'dark' ? 'styles/styles.css' : 'styles/light-mode.css';
  document.getElementById('theme-toggle').textContent =
    savedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Memory handling
  function logMemoryOperation(message) {
    const listItem = document.createElement('li');
    listItem.textContent = message;
    memoryLogList.insertBefore(listItem, memoryLogList.firstChild);
    while (memoryLogList.children.length > 15) {
      memoryLogList.removeChild(memoryLogList.lastChild);
    }
  }

  function handleMemory(action) {
    const currentValue = parseFloat(displayElement.value) || 0;
    let logMessage = '';
    switch (action) {
      case 'mc':
        memoryValue = 0;
        logMessage = 'Memory Cleared';
        memoryLogList.innerHTML = '';
        break;
      case 'mr':
        displayValue = String(memoryValue);
        logMessage = `Recalled: ${memoryValue}`;
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
    if (logMessage) logMemoryOperation(logMessage);
    updateDisplay();
  }

  document.querySelectorAll('.memory-button').forEach((btn) => {
    btn.addEventListener('click', () => handleMemory(btn.dataset.memory));
  });

  // Update display function adjusts clear button text,
  // scales font for longer text, and sets history if calculation complete.
  function updateDisplay() {
    // If calculation is complete, show the full equation in history (small, lower opacity)
    if (calculationComplete) {
      historyDisplay.textContent = currentEquation;
      historyDisplay.classList.add('active-history');
    } else {
      historyDisplay.textContent = '';
      historyDisplay.classList.remove('active-history');
    }
    displayElement.value = (currentEquation && !calculationComplete ? currentEquation + ' ' : '') + displayValue;
    // Set clear button text to C when there is input, else AC.
    clearButton.textContent = (displayValue !== '0' || currentEquation !== '') ? "C" : "AC";
    // Dynamic font sizing (simple algorithm)
    const len = displayElement.value.length;
    if (len > 10) {
      const newSize = Math.max(30, 90 - (len - 10) * 2);
      displayElement.style.fontSize = newSize + "px";
    } else {
      displayElement.style.fontSize = "90px";
    }
  }

  function inputDigit(digit) {
    if (calculationComplete) {
      displayValue = digit;
      currentEquation = '';
      calculationComplete = false;
    } else if (waitingForSecondOperand) {
      displayValue = digit;
      waitingForSecondOperand = false;
    } else {
      displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (calculationComplete) {
      displayValue = '0.';
      currentEquation = '';
      calculationComplete = false;
      waitingForSecondOperand = false;
    } else if (waitingForSecondOperand) {
      displayValue = '0.';
      waitingForSecondOperand = false;
    } else if (!displayValue.includes('.')) {
      displayValue += '.';
    }
    updateDisplay();
  }

  function handleOperator(nextOperator) {
    const inputValue = parseFloat(displayValue);
    const displayOperator =
      nextOperator === '/' ? '÷' :
      nextOperator === '*' ? '×' :
      nextOperator === '-' ? '−' : nextOperator;

    if (operator && waitingForSecondOperand) {
      operator = nextOperator;
      currentEquation = currentEquation.replace(/[\+\-×÷]$/, displayOperator);
      updateDisplay();
      return;
    }

    if (firstOperand === null) {
      firstOperand = inputValue;
      currentEquation = displayValue + ' ' + displayOperator;
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      firstOperand = result;
      currentEquation = String(firstOperand) + ' ' + displayOperator;
      displayValue = String(result);
    }
    operator = nextOperator;
    waitingForSecondOperand = true;
    calculationComplete = false;
    updateDisplay();
  }

  function calculate(operand1, operand2, op) {
    switch (op) {
      case '+': return operand1 + operand2;
      case '-': return operand1 - operand2;
      case '*': return operand1 * operand2;
      case '/': return operand2 === 0 ? 'Error' : operand1 / operand2;
      default: return operand2;
    }
  }

  function resetCalculator() {
    displayValue = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    calculationComplete = false;
    currentEquation = '';
    historyDisplay.textContent = '';
    updateDisplay();
  }

  function clearEntry() {
    displayValue = '0';
    if (waitingForSecondOperand) {
      waitingForSecondOperand = false;
    }
    if (calculationComplete) {
      resetCalculator();
    } else {
      updateDisplay();
    }
  }

  function deleteLastDigit() {
    if (waitingForSecondOperand || calculationComplete || displayValue === 'Error') return;
    displayValue = displayValue.length > 1 ? displayValue.slice(0, -1) : '0';
    updateDisplay();
  }

  function toggleSign() {
    if (displayValue === '0' || displayValue === 'Error' || calculationComplete) return;
    displayValue = String(parseFloat(displayValue) * -1);
    if (operator && !waitingForSecondOperand && firstOperand !== null) {
      firstOperand = parseFloat(displayValue);
    }
    updateDisplay();
  }

  // Button event listener with feedback handled via CSS.
  document.querySelector('.calculator').addEventListener('click', (event) => {
    if (!event.target.matches('button')) return;
    const button = event.target;
    const action = button.dataset.action;
    const buttonContent = button.textContent.trim();

    switch (action) {
      case 'digit':
        inputDigit(buttonContent);
        break;
      case 'operator': {
        let op = buttonContent;
        if (op === '÷') op = '/';
        if (op === '×') op = '*';
        if (op === '−') op = '-';
        handleOperator(op);
        break;
      }
      case 'decimal':
        inputDecimal();
        break;
      case 'clear':
        if (clearButton.textContent === 'AC') {
          resetCalculator();
        } else {
          clearEntry();
        }
        break;
      case 'calculate':
        if (operator && firstOperand !== null && !waitingForSecondOperand) {
          const secondOperand = parseFloat(displayValue);
          const displayOperator =
            operator === '/' ? '÷' :
            operator === '*' ? '×' :
            operator === '-' ? '−' : operator;
          const fullEquation = currentEquation + ' ' + displayValue + ' =';
          const result = calculate(firstOperand, secondOperand, operator);
          displayValue = result === 'Error' ? 'Error' : String(result);
          currentEquation = fullEquation;
          firstOperand = null;
          operator = null;
          waitingForSecondOperand = false;
          calculationComplete = true;
          updateDisplay();
        }
        break;
      case 'delete':
        deleteLastDigit();
        break;
      case 'negate':
        toggleSign();
        break;
      case 'percentage':
        // Percentage not implemented.
        break;
      default:
        // Memory buttons (handled separately)
        if (button.classList.contains('memory-button')) {
          handleMemory(button.dataset.memory);
        }
    }
  });

  document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (!isNaN(key)) {
      inputDigit(key);
    } else if (key === '.') {
      inputDecimal();
    } else if (['+', '-', '*', '/'].includes(key)) {
      handleOperator(key);
    } else if (key === 'Enter' || key === '=') {
      event.preventDefault();
      document.querySelector('[data-action="calculate"]').click();
    } else if (key === 'Escape') {
      clearButton.click();
    } else if (key === 'Backspace') {
      deleteLastDigit();
    } else if (key === '_') {
      toggleSign();
    }
  });

  updateDisplay();
});