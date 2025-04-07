// Wait for HTML to fully load before running calculator code
document.addEventListener('DOMContentLoaded', () => {
    // Get references to important HTML elements
    const displayElement = document.getElementById('display');
    const buttonsContainer = document.querySelector('.buttons');
    const acButton = document.querySelector('button[data-action="clear"]');

    // Calculator state variables
    let displayValue = '0';              // Current number shown on display
    let firstOperand = null;            // First number in calculation
    let waitingForSecondOperand = false;// True when operator was just pressed
    let operator = null;                // Current operation (+, -, *, /)

    function updateDisplay() {
        displayElement.value = displayValue;
        // Update AC button text to C if there's input, otherwise AC
        if (displayValue !== '0' && !waitingForSecondOperand) {
             acButton.textContent = 'C';
        } else {
             acButton.textContent = 'AC';
        }
    }

    // Initialize display
    updateDisplay();

    // Handles when a number button is pressed
    function inputDigit(digit) {
        if (waitingForSecondOperand) {
            displayValue = digit;
            waitingForSecondOperand = false;
        } else {
            // Prevent multiple leading zeros, replace '0' if it's the only digit
            displayValue = displayValue === '0' ? digit : displayValue + digit;
        }
        // Limit display length (optional, good practice)
        // if (displayValue.length > 9) { displayValue = displayValue.slice(0, 9); }
        updateDisplay();
    }

    function inputDecimal(dot) {
        // If waiting for second operand, start with '0.'
        if (waitingForSecondOperand) {
            displayValue = '0.';
            waitingForSecondOperand = false;
            updateDisplay();
            return;
        }
        // Add decimal point only if it doesn't exist
        if (!displayValue.includes(dot)) {
            displayValue += dot;
        }
        updateDisplay();
    }

    // Handles when an operator (+, -, *, /) is pressed
    function handleOperator(nextOperator) {
        const inputValue = parseFloat(displayValue);

        // Handle case where operator is pressed twice
        if (operator && waitingForSecondOperand) {
            operator = nextOperator;
            return;
        }

        // Set first operand if it's not set
        if (firstOperand === null && !isNaN(inputValue)) {
            firstOperand = inputValue;
        } else if (operator) {
            // Calculate if we have firstOperand, operator, and a new inputValue
            const result = performCalculation(firstOperand, inputValue, operator);

            if (result === 'Error') {
                displayValue = 'Error';
                // Reset state on error? Or just show error until AC? Let's show error.
                // resetCalculator(); // Optional: Reset fully on error
            } else {
                 // Format result if needed (e.g., limit decimals)
                 // displayValue = String(parseFloat(result.toFixed(7)));
                 displayValue = String(result);
                 firstOperand = result; // Use result for chaining
            }
        }

        waitingForSecondOperand = true;
        operator = nextOperator;
        updateDisplay();
         // If an error occurred, stop further operations until cleared
         if (displayValue === 'Error') {
              operator = null; // Prevent further calculations on Error state
              firstOperand = null;
              waitingForSecondOperand = false;
         }
    }

    // Does the actual math calculation
    function performCalculation(operand1, operand2, op) {
        switch (op) {
            case 'add':
                return operand1 + operand2;
            case 'subtract':
                return operand1 - operand2;
            case 'multiply':
                return operand1 * operand2;
            case 'divide':
                if (operand2 === 0) {
                    return 'Error'; // Handle division by zero
                }
                return operand1 / operand2;
            default:
                return operand2; // Should not happen with valid operators
        }
    }

    function resetCalculator() {
        displayValue = '0';
        firstOperand = null;
        waitingForSecondOperand = false;
        operator = null;
        updateDisplay();
    }

    function clearEntry() {
         // If C is pressed, clear the current entry
         displayValue = '0';
         waitingForSecondOperand = false; // Allow entering new second operand if needed
         updateDisplay();
    }


    function toggleSign() {
         if (displayValue === 'Error') return;
        const currentValue = parseFloat(displayValue);
        if (currentValue === 0) return; // Don't toggle zero
        displayValue = String(currentValue * -1);
        updateDisplay();
    }

    function inputPercentage() {
         if (displayValue === 'Error') return;
        const currentValue = parseFloat(displayValue);
        displayValue = String(currentValue / 100);
        updateDisplay();
        // Percentage often finalizes the number entry, like iOS
        // waitingForSecondOperand = true; // Optional: behave like an operator after %
    }

    buttonsContainer.addEventListener('click', (event) => {
         if (displayValue === 'Error' && event.target.dataset.action !== 'clear') {
             return; // Only allow AC when in error state
         }

        if (!event.target.matches('button')) {
            return;
        }

        const button = event.target;
        const action = button.dataset.action;
        const value = button.dataset.value;

        switch (action) {
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                handleOperator(action);
                break;
            case 'decimal':
                inputDecimal('.');
                break;
            case 'clear':
                 // If AC button currently shows 'C', clear entry, otherwise reset fully
                 if (acButton.textContent === 'C') {
                     clearEntry();
                 } else {
                     resetCalculator();
                 }
                break;
            case 'calculate':
                // Check if there's an operation to perform
                if (operator && firstOperand !== null && !waitingForSecondOperand) {
                     const inputValue = parseFloat(displayValue);
                     const result = performCalculation(firstOperand, inputValue, operator);
                     if (result === 'Error') {
                         displayValue = 'Error';
                     } else {
                         // displayValue = String(parseFloat(result.toFixed(7)));
                         displayValue = String(result);
                     }
                     // After '=', reset state for the next calculation, keep result displayed
                     firstOperand = null; // Reset first operand
                     waitingForSecondOperand = false; // Ready for new input
                     operator = null; // Clear operator
                     updateDisplay();
                }
                break;
            case 'toggle-sign':
                toggleSign();
                break;
            case 'percentage':
                inputPercentage();
                break;
            default:
                // Must be a number button
                if (button.classList.contains('number')) {
                    inputDigit(value);
                }
        }
         // console.log('State:', { displayValue, firstOperand, operator, waitingForSecondOperand }); // Debugging
    });

    // Keyboard Support
    // Add keyboard support for calculator
    document.addEventListener('keydown', (event) => {
         if (displayValue === 'Error' && event.key !== 'Escape' && event.key !== 'Delete' && event.key !== 'Backspace') {
             return; // Only allow clear keys in error state
         }

        let keyAction = null;
        let keyValue = null;

        // Numbers
        if (event.key >= '0' && event.key <= '9') {
             inputDigit(event.key);
             keyAction = 'number';
             keyValue = event.key;
        }
        // Decimal
        else if (event.key === '.') {
             inputDecimal('.');
             keyAction = 'decimal';
        }
        // Operators
        else if (event.key === '+') handleOperator('add');
        else if (event.key === '-') handleOperator('subtract');
        else if (event.key === '*') handleOperator('multiply');
        else if (event.key === '/') {
             event.preventDefault(); // Prevent browser find action
             handleOperator('divide');
             keyAction = 'operator';
        }
        // Equals
        else if (event.key === '=' || event.key === 'Enter') {
             event.preventDefault(); // Prevent form submission if inside one
              // Simulate Equals button click logic
             if (operator && firstOperand !== null && !waitingForSecondOperand) {
                 const inputValue = parseFloat(displayValue);
                 const result = performCalculation(firstOperand, inputValue, operator);
                  if (result === 'Error') {
                         displayValue = 'Error';
                     } else {
                         // displayValue = String(parseFloat(result.toFixed(7)));
                         displayValue = String(result);
                     }
                 firstOperand = null;
                 waitingForSecondOperand = false;
                 operator = null;
                 updateDisplay();
             }
             keyAction = 'calculate';
        }
        // Clear (AC/C)
        else if (event.key === 'Escape') { // AC
            resetCalculator();
            keyAction = 'clear';
        }
         else if (event.key === 'Backspace' || event.key === 'Delete') { // C
             // Simulate C button press
             clearEntry();
             keyAction = 'clear-entry';
         }
        // Percentage
        else if (event.key === '%') {
            inputPercentage();
            keyAction = 'percentage';
        }
         // Toggle Sign (e.g., using 'n' key? Not standard, skipping for now)

         // Visual feedback for key presses (optional)
         let targetButton = null;
         if (keyAction === 'number') {
             targetButton = document.querySelector(`.button[data-value="${keyValue}"]`);
         } else if (keyAction === 'operator') {
             const opMap = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide' };
             targetButton = document.querySelector(`.button.operator[data-action="${opMap[event.key]}"]`);
         } else if (keyAction === 'calculate') {
              targetButton = document.querySelector(`.button[data-action="calculate"]`);
         } else if (keyAction === 'decimal') {
              targetButton = document.querySelector(`.button[data-action="decimal"]`);
         } else if (keyAction === 'clear') {
               targetButton = document.querySelector(`.button[data-action="clear"]`);
         } // Add other actions if needed

         if (targetButton) {
             targetButton.classList.add('active-key');
             setTimeout(() => targetButton.classList.remove('active-key'), 100);
         }
    });

     // Add CSS for active-key feedback
     const style = document.createElement('style');
     style.textContent = `
         .button.active-key {
             filter: brightness(1.5) !important; /* Make it brighter */
         }
     `;
     document.head.appendChild(style);

});