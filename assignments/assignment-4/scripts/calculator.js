document.addEventListener("DOMContentLoaded", () => {
  // State variables:
  // 'fullEquation' stores the complete expression (e.g., "6+")
  // 'currentInput' holds the currently typed number (or operand)
  // 'resultDisplayed' indicates whether a calculation result was just shown
  let fullEquation = "";
  let currentInput = "0";
  let resultDisplayed = false;

  // DOM elements
  const historyDisplay = document.querySelector(".history-display");
  const mainDisplay = document.querySelector(".display");
  const clearButton = document.getElementById("clear");
  const buttons = document.querySelectorAll(".button");

  /**
   * Updates the main display and clear button text.
   * The main display shows the current operand (or "0" if empty).
   * The clear button shows "AC" when cleared or a result is shown, else "C".
   */
  function updateDisplay() {
    mainDisplay.textContent = (currentInput === "" ? "0" : currentInput);
    if (clearButton) {
      // Show "AC" if the calculator is cleared or if a result was just displayed
      clearButton.textContent = (resultDisplayed || currentInput === "0") ? "AC" : "C";
    }
  }

  /**
   * Appends a digit or decimal point to the current input.
   * If a result was just displayed, starts a new equation.
   * @param {string} digit - The pressed digit or decimal point.
   */
  function appendDigit(digit) {
    if (resultDisplayed) {
      // Start a new equation after a result is shown.
      fullEquation = "";
      currentInput = digit;
      resultDisplayed = false;
    } else {
      // Replace "0" with the digit unless a decimal point is pressed.
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
   * If a result was just displayed, uses that result as the starting operand.
   * Moves the current input into the full equation, then clears it for the next operand.
   * If no current input exists, replaces the last operator with the new one.
   * @param {string} op - The operator (+, -, *, or /).
   */
  function appendOperator(op) {
    if (resultDisplayed) {
      // Continue equation from the result.
      fullEquation = currentInput;
      resultDisplayed = false;
    }
    if (currentInput === "") {
      // If currentInput is empty, replace the last operator in fullEquation.
      if (fullEquation && /[+\-*/.]$/.test(fullEquation)) {
        fullEquation = fullEquation.slice(0, -1) + op;
      } else {
        fullEquation += op;
      }
    } else {
      // Append currentInput and operator to the full equation,
      // then clear currentInput to wait for the next operand.
      fullEquation += currentInput + op;
      currentInput = "";
    }
    updateDisplay();
  }

  /**
   * Evaluates the current equation.
   * Moves the full expression (without trailing operators) to the history display
   * and shows the result in the main display.
   */
  function evaluateEquation() {
    // Build the complete expression.
    let expression = fullEquation + currentInput;
    // Trim any trailing operators or dots.
    expression = expression.replace(/[+\-*/.]+$/, "");
    if (expression === "") return;

    try {
      let result = eval(expression);
      if (!isFinite(result)) {
        mainDisplay.textContent = "Error";
        currentInput = "";
      } else {
        // Move the complete equation into the history display.
        historyDisplay.textContent = expression + " =";
        historyDisplay.classList.add("active-history"); // CSS handles smaller font and lower opacity.
        // Show the result.
        currentInput = result.toString();
      }
      // Clear the stored equation and set result flag.
      fullEquation = "";
      resultDisplayed = true;
      updateDisplay();
    } catch (e) {
      mainDisplay.textContent = "Error";
      currentInput = "";
      fullEquation = "";
    }
  }

  /**
   * Clears the current input, or if nothing is being edited or a result is shown, clears everything.
   * This function implements both "AC" (clear all) and "C" (backspace) behaviors.
   */
  function clearOrBackspace() {
    if (resultDisplayed || currentInput === "0") {
      // Clear all.
      fullEquation = "";
      currentInput = "0";
      resultDisplayed = false;
      historyDisplay.textContent = "";
      historyDisplay.classList.remove("active-history");
    } else {
      // Remove the last character from currentInput.
      currentInput = currentInput.slice(0, -1);
      if (currentInput === "") currentInput = "0";
    }
    updateDisplay();
  }

  /**
   * Handles click/tap events on calculator buttons.
   * Expected button data attributes:
   * - data-type: "number", "operator", "equals", "clear"
   * - data-value: the digit or operator value (if applicable)
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
      // Treat Escape as AC.
      fullEquation = "";
      currentInput = "0";
      resultDisplayed = false;
      historyDisplay.textContent = "";
      historyDisplay.classList.remove("active-history");
      updateDisplay();
      event.preventDefault();
    }
  });

  // Initialize display on page load.
  updateDisplay();
});