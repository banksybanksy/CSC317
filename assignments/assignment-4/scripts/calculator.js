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
let calculationComplete = false; // Track if the last action was '=' calculation
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
    // Use styles.css for dark, light-mode.css for light
    themeStyle.href = newTheme === 'dark' ? 'styles/styles.css' : 'styles/light-mode.css';
    localStorage.setItem('calculator-theme', newTheme);

    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.textContent = newTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
    console.log('Theme switched to:', newTheme);
  }

  // Set up initial theme from localStorage
  const savedTheme = localStorage.getItem('calculator-theme') || 'dark'; // Default to dark
  const html = document.documentElement;
  if (savedTheme === 'light') {
    html.classList.remove('dark-mode');
    document.getElementById('theme-style').href = 'styles/light-mode.css'; // Ensure correct light mode path
    document.getElementById('theme-toggle').textContent = 'Switch to Dark Mode';
  } else {
    html.classList.add('dark-mode');
    document.getElementById('theme-style').href = 'styles/styles.css'; // Ensure correct dark mode path
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
  // Calculator Core Logic Functions
  // ----------------------

  // Updates the display element and AC/C button text
  function updateDisplay() {
    // For displaying the equation in progress or result
    if (currentEquation && !calculationComplete) {
      // Show equation in progress
      displayElement.value = displayValue;
      if (historyDisplay) historyDisplay.textContent = currentEquation;
    } else {
      // Show just the value (after calculation or at start)
      displayElement.value = displayValue;
      // If calculation is complete, show the full equation in history
      if (historyDisplay && calculationComplete) {
        historyDisplay.textContent = currentEquation;
      }
    }
    
    // Change AC to C if there's input other than '0' or after an error
    if (acButton) {
      if (displayValue !== '0' && displayValue !== 'Error') {
        acButton.textContent = 'C';
      } else {
        acButton.textContent = 'AC';
      }
    }
    
    // Adjust font size if needed based on length
    if (displayElement.value.length > 10) {
      displayElement.style.fontSize = '40px';
    } else {
      displayElement.style.fontSize = 'var(--display-font-size)';
    }
    
    console.log(`Display Updated: ${displayValue}, waiting: ${waitingForSecondOperand}, op1: ${firstOperand}, op: ${operator}, eq: ${currentEquation}`);
  }

  // Handles digit input
  function inputDigit(digit) {
    if (calculationComplete) {
      displayValue = digit;
      calculationComplete = false;
    } else if (waitingForSecondOperand) {
      displayValue = digit;
      waitingForSecondOperand = false;
    } else {
      displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
    // Limit display length (optional)
    // if (displayValue.length > 15) displayValue = displayValue.substring(0, 15);
    updateDisplay();
  }

  // Handles decimal point input
  function inputDecimal() {
    if (calculationComplete) {
      displayValue = '0.';
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

  // Handles operator input (+, -, *, /)
  function handleOperator(nextOperator) {
    const inputValue = parseFloat(displayValue);

    // Map operators to their display symbols for better user experience
    const displayOperator = nextOperator === '/' ? '÷' : 
                         nextOperator === '*' ? '×' : 
                         nextOperator === '-' ? '−' : 
                         nextOperator;

    // If an operator is already pending, just change the operator
    if (operator && waitingForSecondOperand) {
      operator = nextOperator; // Update the operator if user changes their mind
      // Update equation display with new operator
      currentEquation = `${firstOperand} ${displayOperator}`;
      updateDisplay();
      return;
    }

    // If there's no first operand yet, store the current value as the first operand
    if (firstOperand === null) {
      firstOperand = inputValue;
    } else if (operator) {
      // If there is an operator, perform the calculation
      const secondOperand = inputValue;
      const result = calculate(firstOperand, secondOperand, operator);
      if (result === 'Error') {
          displayValue = 'Error';
          firstOperand = null;
          operator = null;
          waitingForSecondOperand = false;
          calculationComplete = true;
          currentEquation = ''; // Clear equation on error
          updateDisplay();
          return;
      }
      // Update variables with the result of this calculation
      displayValue = String(result);
      firstOperand = result;
      // This calculation becomes our new 'first operand' for the next operation
      // Example: User enters 3 + 4 * ... should show 7 * ... after this
      currentEquation = `${result} ${displayOperator}`;
    } else {
      // First operation - display equation with the first operand and operator
      currentEquation = `${inputValue} ${displayOperator}`;
    }

    waitingForSecondOperand = true;
    operator = nextOperator;
    calculationComplete = false;
    
    // Now update the display to show the current state
    updateDisplay();
    console.log(`Operator: ${operator}, Operand1: ${firstOperand}, Waiting: ${waitingForSecondOperand}, Equation: ${currentEquation}`);
  }

  // Performs the calculation
  function calculate(operand1, operand2, op) {
    switch (op) {
      case '+': return operand1 + operand2;
      case '-': return operand1 - operand2;
      case '*': return operand1 * operand2;
      case '/':
        if (operand2 === 0) {
          return 'Error'; // Handle division by zero
        }
        return operand1 / operand2;
      default: return operand2; // Should not happen with proper operator handling
    }
  }

  // Resets the calculator state (AC button)
  function resetCalculator() {
    displayValue = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    calculationComplete = false;
    currentEquation = '';
    if (historyDisplay) historyDisplay.textContent = '';
    updateDisplay();
    console.log('Calculator Reset (AC)');
  }

  // Clears the current entry (C button)
  function clearEntry() {
    displayValue = '0';
    // If C is pressed when waiting for the second operand, it shouldn't clear the first operand or operator
    if (waitingForSecondOperand) {
        waitingForSecondOperand = false; // Allow re-entry of second operand
    }
    // If C is pressed right after a calculation, behave like AC
    if(calculationComplete) {
        resetCalculator();
    } else {
        updateDisplay();
    }
    console.log('Entry Cleared (C)');
  }

  // Deletes the last digit entered (Backspace)
  function deleteLastDigit() {
    if (waitingForSecondOperand || calculationComplete || displayValue === 'Error') {
      return; // Do nothing if waiting for op2, after calculation, or on error
    }
    if (displayValue.length > 1) {
      displayValue = displayValue.slice(0, -1);
    } else {
      displayValue = '0'; // If only one digit, reset to 0
    }
    updateDisplay();
  }

  // Toggles the sign of the current display value
  function toggleSign() {
    if (displayValue === '0' || displayValue === 'Error' || calculationComplete) {
      return; // Cannot change sign of 0, Error, or immediately after calculation
    }
    const numericValue = parseFloat(displayValue);
    displayValue = String(numericValue * -1);
    // If the sign change happens after an operator was pressed, update the first operand
    if (operator && !waitingForSecondOperand && firstOperand !== null) {
        firstOperand = parseFloat(displayValue);
    }
    updateDisplay();
  }

  // Add event listeners on calculator buttons
  if (buttonsContainer) {
    buttonsContainer.addEventListener('click', (event) => {
      if (!event.target.matches('button')) return;

      const button = event.target;
      const action = button.dataset.action;
      const buttonContent = button.textContent.trim(); // Use textContent for digits/operators

      console.log(`Button Clicked: ${buttonContent}, Action: ${action}`);

      switch (action) {
        case 'digit':
          inputDigit(buttonContent);
          break;
        case 'operator':
          // Map visual symbols to calculation symbols
          let op = buttonContent;
          if (op === '÷') op = '/';
          if (op === '×') op = '*';
          if (op === '−') op = '-'; // Ensure correct minus sign
          handleOperator(op);
          break;
        case 'decimal':
          inputDecimal();
          break;
        case 'clear':
          // Differentiate between AC and C
          if (acButton && acButton.textContent === 'AC') {
            resetCalculator();
          } else {
            clearEntry();
          }
          break;
        case 'calculate': // Equals button
          if (operator && firstOperand !== null && !waitingForSecondOperand) {
            const secondOperand = parseFloat(displayValue);
            
            // Map operators to display symbols for better readability
            const displayOperator = operator === '/' ? '÷' : 
                                  operator === '*' ? '×' : 
                                  operator === '-' ? '−' : 
                                  operator;
            
            // Build and store the full equation first (before calculating result)
            const fullEquation = `${firstOperand} ${displayOperator} ${secondOperand} =`;
            
            // Calculate the result
            const result = calculate(firstOperand, secondOperand, operator);
             
            if (result === 'Error') {
                displayValue = 'Error';
                currentEquation = ''; // Clear history on error
            } else {
                // Update equation and result
                currentEquation = fullEquation; // Store the full equation with =
                displayValue = String(result);  // Display just the result
                lastResult = result; // Store result for potential chaining
            }
            
            // Update state variables
            firstOperand = null; // Ready for new calculation
            operator = null;
            waitingForSecondOperand = false;
            calculationComplete = true; // Mark that calculation was just done
            
            // Update both displays (equation in history, result in main display)
            updateDisplay();
          } else if (operator && waitingForSecondOperand && lastResult !== null) {
            // Allow repeating the last operation with the result (iOS style)
            const result = calculate(lastResult, parseFloat(displayValue), operator);
            if (result === 'Error') {
                displayValue = 'Error';
            } else {
                displayValue = String(result);
                currentEquation = `${lastResult} ${operator} ${displayValue.endsWith('.') ? displayValue.slice(0, -1) : displayValue} =`; // Adjust if needed
                lastResult = result;
            }
            if (historyDisplay) historyDisplay.textContent = currentEquation;
            calculationComplete = true;
            updateDisplay();
          }
          break;
        case 'delete': // Backspace
          deleteLastDigit();
          break;
        case 'negate': // +/- button
          toggleSign();
          break;
        case 'percentage': // Add placeholder for percentage
          console.log('Percentage action not yet implemented.');
          // Optional: Implement percentage logic here
          break;
        default:
          // Handle memory buttons if not handled separately
          if (button.classList.contains('memory-button')) {
            handleMemory(button.dataset.memory);
          } else {
             console.warn('Unhandled button action:', action || buttonContent);
          }
      }
      // Ensure display updates after every action if not already done
      // updateDisplay(); // Might be redundant if called within handlers
    });
  }

  // Add keyboard event listener
  document.addEventListener('keydown', (event) => {
    const key = event.key;
    console.log('Key Pressed:', key);

    if (!isNaN(key)) { // Digit
      inputDigit(key);
    } else if (key === '.') { // Decimal
      inputDecimal();
    } else if (['+', '-', '*', '/'].includes(key)) { // Operator
      handleOperator(key);
    } else if (key === 'Enter' || key === '=') { // Equals
      event.preventDefault(); // Prevent default form submission if inside one
      // Simulate click on equals button
      const equalsButton = document.querySelector('[data-action="calculate"]');
      if (equalsButton) equalsButton.click();
    } else if (key === 'Escape') { // Clear (AC/C)
       // Simulate click on clear button
       if (acButton) acButton.click();
    } else if (key === 'Backspace') { // Delete last digit
      deleteLastDigit();
    } else if (key === '%') { // Percent (if implemented)
      // handlePercent();
    } else if (key === '_') { // Negate (Shift + Hyphen typically)
        // This mapping might be tricky, consider if +/- button is sufficient
        toggleSign();
    }
    // Add more mappings as needed (e.g., memory keys)
  });

  // Initialize the display on load
  updateDisplay();

  console.log('Calculator initialization complete');
});