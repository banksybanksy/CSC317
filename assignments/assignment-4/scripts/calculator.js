document.addEventListener("DOMContentLoaded", () => {
  // Calculator state variables:
  // 'fullEquation' holds the already-entered portion (e.g., "6+")
  // 'currentInput' holds the digits being typed for the current operand
  // 'resultDisplayed' flags if a calculation result was just shown
  let fullEquation = "";
  let currentInput = "0";
  let resultDisplayed = false;

  // Memory state variable (initially 0)
  let memoryValue = 0;

  // DOM elements for main calculator display and buttons
  const historyDisplay = document.querySelector(".history-display");
  const mainDisplay = document.querySelector(".display");
  const clearButton = document.getElementById("clear");
  const buttons = document.querySelectorAll(".button");

  // DOM elements for Memory Log
  const memoryButtons = document.querySelectorAll(".memory-button");
  const memoryLogList = document.getElementById("memory-log-list");

  /**
   * Appends a new entry to the Memory Log.
   * @param {string} message - The message to be logged.
   */
  function logMemoryOperation(message) {
    const li = document.createElement("li");
    li.textContent = message;
    memoryLogList.appendChild(li);
  }

  /**
   * Updates the main display and clear button.
   * - If a result is displayed, the main display shows currentInput.
   * - Otherwise, it shows the concatenation of fullEquation and currentInput.
   */
  function updateDisplay() {
    if (resultDisplayed) {
      mainDisplay.value = currentInput;
    } else {
      let displayText = fullEquation + currentInput;
      if (displayText === "") displayText = "0";
      // Replace operators with proper symbols for display
      displayText = displayText.replace(/\//g, '÷').replace(/\*/g, '×');
      mainDisplay.value = displayText;
    }
    if (clearButton) {
      clearButton.textContent =
        resultDisplayed || (fullEquation === "" && currentInput === "0")
          ? "AC"
          : "C";
    }
  }

  /**
   * Appends a digit or decimal point to the current input.
   * Starts a new equation if a result was just displayed.
   * @param {string} digit - The pressed digit or decimal point.
   */
  function appendDigit(digit) {
    if (resultDisplayed) {
      fullEquation = "";
      currentInput = digit;
      resultDisplayed = false;
    } else {
      if (currentInput === "0" && digit !== ".") {
        currentInput = digit;
      } else {
        currentInput += digit;
      }
    }
    updateDisplay();
  }

  /**
   * Appends an operator to the equation.
   * If a result is displayed, the currentInput is used as the starting point.
   * @param {string} op - The operator (e.g., "+", "-", "*", "/").
   */
  function appendOperator(op) {
    if (resultDisplayed) {
      fullEquation = currentInput;
      currentInput = "";
      resultDisplayed = false;
    }
    if (currentInput === "") {
      // If already pressed, replace the last operator.
      if (fullEquation && /[+\-*/.]+$/.test(fullEquation)) {
        fullEquation = fullEquation.slice(0, -1) + op;
      } else {
        fullEquation += op;
      }
    } else {
      // Don't allow operations after an error
      if (currentInput === "Error") {
        currentInput = "0";
      }
      fullEquation += currentInput + op;
      currentInput = "";
    }
    updateDisplay();
  }

  /**
   * Evaluates the complete expression (fullEquation + currentInput).
   * The full expression (without trailing operators) is moved to the history display.
   * The main display shows the computed result.
   */
  function evaluateEquation() {
    let expression = fullEquation + currentInput;
    expression = expression.replace(/[+\-*/.]+$/, "");
    if (expression === "") return;

    // Check for division by zero
    if (expression.includes('/0')) {
      mainDisplay.value = "Error";
      currentInput = "";
      fullEquation = "";
      resultDisplayed = true;
      updateDisplay();
      return;
    }

    try {
      let result = eval(expression);
      if (!isFinite(result)) {
        mainDisplay.value = "Error";
        currentInput = "";
        fullEquation = "";
      } else {
        // Format the expression for display using proper symbols
        let displayExpression = expression.replace(/\//g, '÷').replace(/\*/g, '×');
        historyDisplay.value = displayExpression + " =";
        historyDisplay.classList.add("active-history");
        currentInput = result.toString();
        fullEquation = "";
      }
      resultDisplayed = true;
      updateDisplay();
    } catch (e) {
      mainDisplay.value = "Error";
      currentInput = "";
      fullEquation = "";
      resultDisplayed = true;
      updateDisplay();
    }
  }

  /**
   * Clears the calculator or performs a backspace operation.
   * If a result is shown or nothing is present, performs All Clear; otherwise, backspaces.
   */
  function clearOrBackspace() {
    if (resultDisplayed) {
      fullEquation = "";
      currentInput = "0";
      resultDisplayed = false;
      historyDisplay.value = "";
      historyDisplay.classList.remove("active-history");
    } else {
      if (currentInput !== "") {
        currentInput = currentInput.slice(0, -1);
        if (currentInput === "") currentInput = "0";
      } else if (fullEquation !== "") {
        fullEquation = fullEquation.slice(0, -1);
      }
    }
    updateDisplay();
  }

  /**
   * Handles click/tap events on calculator buttons.
   * Expects buttons to have:
   * - data-type: "number", "operator", "equals", "clear"
   * - data-value: the digit or operator value (if applicable)
   */
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.type;
      const value = button.dataset.value;

      if (type === "number") {
        appendDigit(value);
      } else if (type === "operator") {
        appendOperator(value);
      } else if (type === "equals") {
        evaluateEquation();
      } else if (type === "clear") {
        clearOrBackspace();
      }
    });
  });

  /**
   * Handles keyboard input for digits, operators, evaluation, and clearing.
   */
  document.addEventListener("keydown", (event) => {
    const key = event.key;
    if ("0123456789.".includes(key)) {
      appendDigit(key);
      event.preventDefault();
    } else if (["+", "-", "*", "/"].includes(key)) {
      appendOperator(key);
      event.preventDefault();
    } else if (key === "Enter" || key === "=") {
      evaluateEquation();
      event.preventDefault();
    } else if (key === "Backspace") {
      clearOrBackspace();
      event.preventDefault();
    } else if (key === "Escape") {
      fullEquation = "";
      currentInput = "0";
      resultDisplayed = false;
      historyDisplay.value = "";
      historyDisplay.classList.remove("active-history");
      updateDisplay();
      event.preventDefault();
    }
  });

  // Memory Functionality: Handle Memory Buttons
  memoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.memory;
      // Parse the current input; if invalid, default to 0.
      const currentVal = parseFloat(currentInput) || 0;
      switch (action) {
        case "mplus":
          memoryValue += currentVal;
          logMemoryOperation(`M+: Memory is now ${memoryValue}`);
          break;
        case "mminus":
          memoryValue -= currentVal;
          logMemoryOperation(`M-: Memory is now ${memoryValue}`);
          break;
        case "mr":
          currentInput = memoryValue.toString();
          updateDisplay();
          logMemoryOperation(`MR: Recalled memory value ${memoryValue}`);
          break;
        case "mc":
          memoryValue = 0;
          logMemoryOperation("MC: Memory cleared");
          break;
      }
    });
  });

  // Initialize display on page load.
  updateDisplay();
});