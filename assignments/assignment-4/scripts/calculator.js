document.addEventListener("DOMContentLoaded", () => {
  // State variables:
  // fullEquation: stores the part of the equation already entered (e.g., "6+")
  // currentInput: stores the digits being typed for the current operand
  // resultDisplayed: indicates if a calculation result was just displayed
  let fullEquation = "";
  let currentInput = "0";
  let resultDisplayed = false;

  // DOM elements (assumes displays are <input> elements)
  const historyDisplay = document.querySelector(".history-display");
  const mainDisplay = document.querySelector(".display");
  const clearButton = document.getElementById("clear");
  const buttons = document.querySelectorAll(".button");

  /**
   * Updates the main display:
   * - If not in result mode, shows the full equation being built (fullEquation + currentInput).
   * - Once equals is pressed, only the result (currentInput) is shown.
   * Also updates the clear button text: "AC" if cleared or resultDisplayed; otherwise "C".
   */
  function updateDisplay() {
    if (resultDisplayed) {
      mainDisplay.value = currentInput;
    } else {
      // Build a continuous equation display by concatenating the stored equation and current input.
      let displayText = fullEquation + currentInput;
      if (displayText === "") displayText = "0";
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
   * Appends a digit or a decimal point to the current operand.
   * If a result was just displayed, a new equation is started.
   * @param {string} digit - The pressed digit or decimal point.
   */
  function appendDigit(digit) {
    if (resultDisplayed) {
      // Starting a new equation after a result: clear previous equation.
      fullEquation = "";
      currentInput = digit;
      resultDisplayed = false;
    } else {
      // Replace the initial "0" with the new digit (unless a decimal is pressed).
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
   * If a result was just displayed, the result becomes the starting point.
   * Instead of clearing the display, the full equation is preserved by concatenation.
   * @param {string} op - The operator (e.g., "+", "-", "*", "/").
   */
  function appendOperator(op) {
    if (resultDisplayed) {
      // Continue from the previous result.
      fullEquation = currentInput;
      currentInput = "";
      resultDisplayed = false;
    }
    if (currentInput === "") {
      // If an operator was already pressed, replace the last operator.
      if (fullEquation && /[+\-*/.]$/.test(fullEquation)) {
        fullEquation = fullEquation.slice(0, -1) + op;
      } else {
        fullEquation += op;
      }
    } else {
      // Append the current operand and operator to fullEquation.
      fullEquation += currentInput + op;
      currentInput = "";
    }
    updateDisplay();
  }

  /**
   * Evaluates the expression built from fullEquation and currentInput.
   * Moves the complete equation to the history (styled with smaller font and lower opacity)
   * and displays the result in the main display.
   */
  function evaluateEquation() {
    let expression = fullEquation + currentInput;
    // Remove any trailing operators or dots.
    expression = expression.replace(/[+\-*/.]+$/, "");
    if (expression === "") return;

    try {
      let result = eval(expression);
      if (!isFinite(result)) {
        mainDisplay.value = "Error";
        currentInput = "";
      } else {
        // Move the complete expression to the history display.
        historyDisplay.value = expression + " =";
        historyDisplay.classList.add("active-history"); // CSS styles the history (smaller font, lower opacity)
        // Display the result in the main area.
        currentInput = result.toString();
      }
      fullEquation = "";
      resultDisplayed = true;
      updateDisplay();
    } catch (e) {
      mainDisplay.value = "Error";
      currentInput = "";
      fullEquation = "";
    }
  }

  /**
   * Clears the calculator or performs a backspace operation.
   * When resultDisplayed is true, or when there’s nothing to backspace, clear all.
   * Otherwise, remove the last character from currentInput (or fullEquation if currentInput is empty).
   */
  function clearOrBackspace() {
    if (resultDisplayed) {
      // AC (All Clear): reset everything.
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
   * Click/tap event handler for calculator buttons.
   * Buttons are identified with data-type ("number", "operator", "equals", "clear")
   * and data-value (for the actual digit/operator).
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
   * Keyboard input handler for digits, operators, evaluation (Enter/Equals), and backspace/escape clearing.
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
      // Clear everything on Escape.
      fullEquation = "";
      currentInput = "0";
      resultDisplayed = false;
      historyDisplay.value = "";
      historyDisplay.classList.remove("active-history");
      updateDisplay();
      event.preventDefault();
    }
  });

  // Initialize the display on page load.
  updateDisplay();
});