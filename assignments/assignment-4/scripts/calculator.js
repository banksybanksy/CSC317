let displayElement;
let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;
let calculationComplete = false;
let currentEquation = '';

// Theme handling
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.classList.contains('dark-mode') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Toggle the dark-mode class
    html.classList.toggle('dark-mode');
    
    // Update the stylesheet link
    const themeStyle = document.getElementById('theme-style');
    themeStyle.href = `styles/${newTheme}-mode.css`;
    
    // Save theme preference to localStorage
    localStorage.setItem('calculator-theme', newTheme);
    
    // Update button text to indicate current theme
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.textContent = newTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
    
    console.log('Theme switched to:', newTheme);
}

// Memory handling
let memoryValue = parseFloat(localStorage.getItem('calculator-memory')) || 0;
const memoryIndicator = document.getElementById('memory-indicator');
// Define memoryLogList globally; will be assigned in DOMContentLoaded
let memoryLogList;

// Function to add an entry to the memory log
function logMemoryOperation(message) {
    if (!memoryLogList) return; // Exit if log list element isn't available yet

    const listItem = document.createElement('li');
    listItem.textContent = message;
    // Prepend the new log entry to show the latest at the top
    memoryLogList.insertBefore(listItem, memoryLogList.firstChild);

    // Optional: Limit the number of log entries (e.g., keep last 15)
    const maxLogEntries = 15;
    while (memoryLogList.children.length > maxLogEntries) {
        memoryLogList.removeChild(memoryLogList.lastChild);
    }
}

function updateMemoryIndicator() {
    memoryIndicator.style.display = memoryValue !== 0 ? 'block' : 'none';
}

function handleMemory(action) {
    const currentValue = parseFloat(displayElement.value) || 0;
    let logMessage = ''; // Initialize log message

    switch(action) {
        case 'mc':
            memoryValue = 0;
            logMessage = 'Memory Cleared';
            if (memoryLogList) memoryLogList.innerHTML = ''; // Clear visual log
            break;
        case 'mr':
            // Update display and internal state
            displayElement.value = memoryValue;
            displayValue = String(memoryValue); // Update internal displayValue
            logMessage = `Recalled: ${memoryValue}`;
            
            // Reset calculator state after MR to treat recalled value as a new input
            waitingForSecondOperand = false;
            calculationComplete = false;
            // If an operation was pending, keep it, otherwise clear operator
            // currentEquation = displayValue; // Start new equation history? Or keep old? Let's reset.
            firstOperand = parseFloat(displayValue); // Set the recalled value as the start
            operator = null; // Clear pending operator
            currentEquation = displayValue; // Reset equation history
            break;
        case 'mplus':
            memoryValue += currentValue;
            logMessage = `${currentValue} Added | Mem: ${memoryValue}`;
            waitingForSecondOperand = true; // Allow starting new number after M+
            break;
        case 'mminus':
            memoryValue -= currentValue;
            logMessage = `${currentValue} Subtracted | Mem: ${memoryValue}`;
            waitingForSecondOperand = true; // Allow starting new number after M-
            break;
    }

    localStorage.setItem('calculator-memory', memoryValue);
    updateMemoryIndicator();
    if (logMessage) { // Log the operation if a message was generated
        logMemoryOperation(logMessage);
    }
    updateDisplay(); // Update display after memory operation, especially MR
}

document.addEventListener('DOMContentLoaded', () => {
    // Set up theme based on localStorage or default to dark
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
    
    // Add event listener for the theme toggle button
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    displayElement = document.getElementById('display');
    const historyElement = document.getElementById('history');
    const buttonsContainer = document.querySelector('.calculator-grid');
    const memoryButtons = document.querySelector('.memory-buttons');

    // Setup memory value and indicator
    memoryValue = parseFloat(localStorage.getItem('calculator-memory')) || 0;
    updateMemoryIndicator();

    // Make sure we have proper references to the calculator buttons
    const acButton = document.querySelector('button[data-action="clear"]');

    // Assign memoryLogList here since DOM is loaded
    memoryLogList = document.getElementById('memory-log-list');
    updateMemoryIndicator(); // Show memory indicator if there's a stored value

    // Set up memory buttons
    document.querySelectorAll('.memory-button').forEach(btn => {
        const action = btn.dataset.memory;
        btn.addEventListener('click', () => handleMemory(action));
    });

  // Calculator state variables
  let displayValue = '0';           // Current value shown in the display
  let firstOperand = null;          // First number in an operation
  let waitingForSecondOperand = false; // Whether we're waiting for the second number
  let operator = null;              // Current operation (+, -, ×, ÷)
  let currentEquation = '';        // Full equation being built
  let calculationComplete = false; // Whether calculation has been completed

// Adjusts the font size based on the length of the display text
  function updateFontSize() {
    const maxLength = 11;            // Maximum characters at full size
    const baseSize = 48;            // Default font size (in pixels)
    const minSize = 24;             // Minimum font size (in pixels)
    const currentLength = displayElement.value.length;
    
    if (currentLength <= maxLength) {
      displayElement.style.fontSize = `${baseSize}px`;
    } else {
      // Calculate a new size proportional to text length
      const newSize = Math.max(baseSize * (maxLength / currentLength), minSize);
      displayElement.style.fontSize = `${newSize}px`;
    }
  }

// Updates the calculator display based on current state
  function updateDisplay() {
    // Determine what to show in the main display
    let mainDisplay;
    if (calculationComplete) {
      // After equals is pressed, show result in main display and equation in history
      mainDisplay = displayValue;
      historyElement.textContent = currentEquation;
    } else if (operator) {
      // While building an equation with operators, show the full equation
      mainDisplay = currentEquation + (waitingForSecondOperand ? '' : displayValue);
      historyElement.textContent = '';
    } else {
      // Just showing a number with no operators yet
      mainDisplay = displayValue;
      historyElement.textContent = '';
    }

    // Dynamic font sizing based on content length
    const baseSize = 48;  // Default font size
    const minSize = 24;   // Smallest allowable font size
    const maxCharacters = 11;  // Maximum characters at full size
    let textLength = mainDisplay.length;
    let newSize = baseSize;

    if (textLength > maxCharacters) {
      newSize = baseSize * (maxCharacters / textLength);
      newSize = Math.max(newSize, minSize);  // Don't go smaller than minSize
    }
    displayElement.style.fontSize = `${newSize}px`;
    displayElement.value = mainDisplay;

    // Show AC when at initial state, C when there's something to clear
    const showAC = (displayValue === '0' && !currentEquation) || calculationComplete;
    acButton.textContent = showAC ? 'AC' : 'C';
  }

// Resets the calculator to its initial state
  function resetCalculator() {
    displayValue = '0';                // Reset display to zero
    firstOperand = null;               // Clear first operand
    operator = null;                   // Clear current operator
    waitingForSecondOperand = false;   // Not waiting for second operand
    currentEquation = '';             // Clear the equation
    calculationComplete = false;      // No calculation has been completed
    updateDisplay();                  // Update the display
  }

  // Handles clear entry (C button)
  function clearEntry() {
    handleDelete();  // Delegate to handleDelete for consistent behavior
  }

  // Handles digit button presses (0-9)
  function inputDigit(digit) {
    if (calculationComplete) {
      // If we just completed a calculation, start a new one
      displayValue = digit;
      currentEquation = '';
      firstOperand = null;
      operator = null;
      calculationComplete = false;
    } else if (waitingForSecondOperand) {
      // Start entering the second number
      displayValue = digit;
      waitingForSecondOperand = false;
    } else {
      // Continue entering a number (first or second)
      // Replace 0 if it's the only digit, otherwise append
      displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
    updateDisplay();
  }

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

  function toggleSign() {
    const currentValue = parseFloat(displayValue);
    if (currentValue !== 0) {
      displayValue = String(-currentValue);
      if (!waitingForSecondOperand) {
        if (calculationComplete) {
          currentEquation = displayValue;
        } else if (currentEquation) {
          const lastSpace = currentEquation.lastIndexOf(' ');
          currentEquation = lastSpace !== -1 ?
            currentEquation.slice(0, lastSpace + 1) + displayValue :
            displayValue;
        }
      }
      updateDisplay();
    }
  }

  function inputPercentage() {
    const currentValue = parseFloat(displayValue);
    if (currentValue !== 0) {
      const percentValue = currentValue / 100;
      displayValue = String(percentValue);
      if (!waitingForSecondOperand) {
        if (calculationComplete) {
          currentEquation = displayValue;
        } else if (currentEquation) {
          const lastSpace = currentEquation.lastIndexOf(' ');
          currentEquation = lastSpace !== -1 ?
            currentEquation.slice(0, lastSpace + 1) + displayValue :
            displayValue;
        }
      }
      updateDisplay();
    }
  }

  function getOperatorSymbol(op) {
    const symbols = {
      add: ' + ',
      subtract: ' - ',
      multiply: ' × ',
      divide: ' ÷ '
    };
    return symbols[op] || '';
  }

  // Returns the precedence of an operator (1 for addition and subtraction, 2 for multiplication and division)
  function getOperatorPrecedence(op) {
    const precedence = {
      add: 1,
      subtract: 1,
      multiply: 2,
      divide: 2
    };
    return precedence[op] || 0;
  }

  function performCalculation(operand1, operand2, operator) {
    switch (operator) {
      case 'add':
        return operand1 + operand2;
      case 'subtract':
        return operand1 - operand2;
      case 'multiply':
        return operand1 * operand2;
      case 'divide':
        if (operand2 === 0) {
          return 'Error';
        }
        return operand1 / operand2;
      default:
        return operand2; // Fallback case (should not occur)
    }
  }

  // Evaluate an expression array using PEMDAS operator precedence
  function evaluateExpression(expression) {
    // Use the Shunting Yard algorithm to convert infix expression to Reverse Polish Notation (RPN)
    let outputQueue = [];
    let operatorStack = [];
    // Define operator precedence: multiplication and division have higher precedence than addition and subtraction
    const precedence = { 'add': 1, 'subtract': 1, 'multiply': 2, 'divide': 2 };
    
    // Process each token from the expression array
    for (let token of expression) {
      if (typeof token === 'number') {
        // Numbers are directly added to the output queue
        outputQueue.push(token);
      } else {
        // For operators, pop from operatorStack to outputQueue if top of the stack has greater or equal precedence
        while (operatorStack.length && precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
          outputQueue.push(operatorStack.pop());
        }
        // Push the current operator onto the stack
        operatorStack.push(token);
      }
    }
    // Append any remaining operators from the stack to the output queue
    while (operatorStack.length) {
      outputQueue.push(operatorStack.pop());
    }
    
    // Evaluate the RPN expression using a stack
    let evaluationStack = [];
    for (let token of outputQueue) {
      if (typeof token === 'number') {
        evaluationStack.push(token);
      } else {
        let operand2 = evaluationStack.pop();
        let operand1 = evaluationStack.pop();
        let result = performCalculation(operand1, operand2, token);
        // Return 'Error' immediately if a calculation error occurs (e.g., division by zero)
        if (result === 'Error') {
          return 'Error';
        }
        evaluationStack.push(result);
      }
    }
    return evaluationStack[0];
  }

  // Handles operator button press without immediate evaluation
  function handleOperator(nextOperator) {
    if (displayValue === 'Error') return;

    const inputValue = parseFloat(displayValue);
    if (calculationComplete) {
      firstOperand = inputValue;
      currentEquation = displayValue;
      calculationComplete = false;
    } else if (operator && waitingForSecondOperand) {
      // Just change the operator
      operator = nextOperator;
      currentEquation = currentEquation.slice(0, -3);
    } else if (operator) {
      // Just store the number, don't calculate yet
      firstOperand = parseFloat(currentEquation);
      currentEquation = currentEquation + displayValue;
    } else {
      firstOperand = inputValue;
      currentEquation = displayValue;
    }

    operator = nextOperator;
    waitingForSecondOperand = true;
    currentEquation += getOperatorSymbol(nextOperator);
    updateDisplay();
  }

  // Handles equals button press
  function handleEquals() {
    // Don't do anything if we're in an error state, have no operator,
    if (displayValue === 'Error' || !operator || waitingForSecondOperand) return;

    // Build the complete equation
    const fullEquation = currentEquation + displayValue;

    // Parse the equation into numbers and operators
    const parts = fullEquation.split(/\s*[+×÷-]\s*/);  // Split by operators with spaces
    const operators = fullEquation.match(/[+×÷-]/g);      // Get all operators

    // Calculate the result following order of operations
    let result = parseFloat(parts[0]);  // Start with first number
    
    // Process each operator and number in sequence
    for (let i = 0; i < operators.length; i++) {
      const nextNum = parseFloat(parts[i + 1]);
      switch (operators[i]) {
        case '+': result += nextNum; break;
        case '-': result -= nextNum; break;
        case '×': result *= nextNum; break;
        case '÷': 
          // Handle division by zero
          if (nextNum === 0) {
            result = 'Error';
          } else {
            result = result / nextNum;
          }
          break;
      }
      
      // Stop if we hit an error
      if (result === 'Error') break;
    }

    // Update the calculator state based on result
    if (result === 'Error') {
      displayValue = 'Error';
      currentEquation = fullEquation + ' =';
    } else {
      // Format the result to avoid unnecessary decimal places
      displayValue = String(parseFloat(result.toFixed(10)));
      currentEquation = fullEquation + ' =';  // Add equals sign to equation
      firstOperand = result;  // Store result for potential follow-up operations
    }

    // Reset state for next calculation
    operator = null;
    waitingForSecondOperand = false;
    calculationComplete = true;
    updateDisplay();
  }

  // Toggle the sign of the current number
  function toggleSign() {
    if (displayValue === 'Error') return;
    const currentNumber = parseFloat(displayValue);
    if (currentNumber === 0) return;
    displayValue = String(currentNumber * -1);
    updateDisplay();
  }

  // Convert the current number to a percentage
  function inputPercentage() {
    if (displayValue === 'Error') return;
    const currentNumber = parseFloat(displayValue);
    displayValue = String(currentNumber / 100);
    updateDisplay();
  }

// Handles backspace/delete functionality with digit-by-digit deletion
  function handleDelete() {
    if (calculationComplete || displayValue === 'Error') {
      resetCalculator();
      return;
    }
 
    // Handle operator deletion when no second number entered
    if (waitingForSecondOperand) {
      operator = null;
      waitingForSecondOperand = false;
      currentEquation = String(firstOperand);
      displayValue = currentEquation;
    }
    // Handle first number deletion
    else if (operator === null) {
      if (displayValue.length === 1) {
        displayValue = '0';
      } else {
        displayValue = displayValue.slice(0, -1);
      }
      currentEquation = displayValue;
    }
    // Handle second number deletion
    else {
      if (displayValue === "") {
        operator = null;
        waitingForSecondOperand = false;
        currentEquation = String(firstOperand);
        displayValue = currentEquation;
      } else {
        if (displayValue.length === 1) {
          displayValue = "";
        } else {
          displayValue = displayValue.slice(0, -1);
        }
        currentEquation = String(firstOperand) + getOperatorSymbol(operator) + displayValue;
      }
    }
 
    updateDisplay();
  }

  function updateDisplay() {
    if (!displayElement) return;

    if (displayValue === 'Error') {
        displayElement.value = displayValue;
        if (acButton) acButton.textContent = 'AC';
        return;
    }

    // Format number for display
    let formattedValue = displayValue;
    if (displayValue !== '' && !isNaN(parseFloat(displayValue))) {
        const number = parseFloat(displayValue);
        formattedValue = number.toString();
        // Handle large numbers and decimals
        if (formattedValue.length > 9) {
            if (formattedValue.includes('e')) {
                formattedValue = number.toPrecision(6);
            } else if (formattedValue.includes('.')) {
                formattedValue = number.toFixed(
                    Math.max(0, 9 - formattedValue.split('.')[0].length - 1)
                );
            } else {
                formattedValue = number.toPrecision(9);
            }
        }
    }

    displayElement.value = formattedValue || '0';
    if (acButton) {
        acButton.textContent = displayValue === '' || displayValue === '0' ? 'AC' : 'C';
    }

    // Update font size based on length
    updateFontSize();

    // Update equation display
    if (historyDisplay) {
        historyDisplay.textContent = currentEquation || '';
    }
}

  // Set up event listeners for button clicks
  buttonsContainer.addEventListener('click', (event) => {
    // Only process button clicks (ignore clicks on container)
    if (!event.target.matches('button')) return;
    
    // Don't allow most actions when in error state except clear
    if (displayValue === 'Error' && event.target.dataset.action !== 'clear') return;

    const button = event.target;
    const action = button.dataset.action;  // The button action (clear, add, etc.)
    const value = button.dataset.value;    // For number buttons (0-9)

    // Map of actions to their handler functions
    const actions = {
      add: () => handleOperator('add'),
      subtract: () => handleOperator('subtract'),
      multiply: () => handleOperator('multiply'),
      divide: () => handleOperator('divide'),
      decimal: () => inputDecimal('.'),
      clear: () => acButton.textContent === 'C' ? handleDelete() : resetCalculator(),  // C or AC behavior
      calculate: () => handleEquals(),
      'toggle-sign': () => toggleSign(),
      percentage: () => inputPercentage()
    };

    // Call the appropriate handler based on the button pressed
    if (action in actions) {
      actions[action]();  // Call the appropriate function from our map
    } else if (button.classList.contains('number')) {
      inputDigit(value);  // Handle number button presses
    }
  });

  // Keyboard support for the calculator
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

    // Visual feedback for key presses
    let targetButton = null;
    if (keyAction === 'number') {
      targetButton = document.querySelector(`.button[data-value="${keyValue}"]`);
    } else if (keyAction === 'operator') {
      const opMap = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide' };
      targetButton = document.querySelector(`.button[data-action="${opMap[event.key]}"]`);
    } else if (keyAction === 'calculate') {
      targetButton = document.querySelector(`.button[data-action="calculate"]`);
    } else if (keyAction === 'decimal') {
      targetButton = document.querySelector(`.button[data-action="decimal"]`);
    } else if (keyAction === 'clear') {
      targetButton = document.querySelector(`.button[data-action="clear"]`);
    }

    if (targetButton) {
      targetButton.classList.add('active-key');
      setTimeout(() => targetButton.classList.remove('active-key'), 100);
    }
  });

    // Initialize display on load
    updateDisplay();
});