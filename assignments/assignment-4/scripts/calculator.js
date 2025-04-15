document.addEventListener("DOMContentLoaded", () => {
  // State variables:
  let fullEquation = "";
  let currentInput = "0";
  let resultDisplayed = false;

  // DOM elements (assumes displays are <input> elements)
  const historyDisplay = document.querySelector(".history-display");
  const mainDisplay = document.querySelector(".display");
  const clearButton = document.getElementById("clear");
  const buttons = document.querySelectorAll(".button");

  /**
   * Updates the main display and clear button text.
   * Uses the 'value' property because the display elements are <input> fields.
   */
  function updateDisplay() {
    mainDisplay.value = (currentInput === "" ? "0" : currentInput);
    if (clearButton) {
      clearButton.textContent = (resultDisplayed || currentInput === "0") ? "AC" : "C";
    }
  }

  /**
   * Appends a digit or decimal point to the current input.
   * @param {string} digit
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
   * @param {string} op
   */
  function appendOperator(op) {
    if (resultDisplayed) {
      fullEquation = currentInput;
      resultDisplayed = false;
    }
    if (currentInput === "") {
      // Replace the last operator if no current input.
      if (fullEquation && /[+\-*/.]$/.test(fullEquation)) {
        fullEquation = fullEquation.slice(0, -1) + op;
      } else {
        fullEquation += op;
      }
    } else {
      fullEquation += currentInput + op;
      currentInput = "";
    }
    updateDisplay();
  }

  /**
   * Evaluates the current equation.
   */
  function evaluateEquation() {
    let expression = fullEquation + currentInput;
    expression = expression.replace(/[+\-*/.]+$/, "");
    if (expression === "") return;

    try {
      let result = eval(expression);
      if (!isFinite(result)) {
        mainDisplay.value = "Error";
        currentInput = "";
      } else {
        // Show the full equation in the history display.
        historyDisplay.value = expression + " =";
        historyDisplay.classList.add("active-history");
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
   * Clears or backspaces the current input.
   */
  function clearOrBackspace() {
    if (resultDisplayed || currentInput === "0") {
      fullEquation = "";
      currentInput = "0";
      resultDisplayed = false;
      historyDisplay.value = "";
      historyDisplay.classList.remove("active-history");
    } else {
      currentInput = currentInput.slice(0, -1);
      if (currentInput === "") currentInput = "0";
    }
    updateDisplay();
  }

  /**
   * Handle click events for calculator buttons.
   */
  buttons.forEach(button => {
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
   * Handle keyboard input for digits, operators, evaluation, and clearing.
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

  updateDisplay();
});