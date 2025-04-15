document.addEventListener("DOMContentLoaded", () => {
  // State variables
  let currentEquation = "";
  let isResultShown = false;

  // DOM elements
  const historyDisplay = document.querySelector(".history-display");
  const mainDisplay = document.querySelector(".display");
  const clearButton = document.getElementById("clear"); // expects clear button to have id="clear"
  const buttons = document.querySelectorAll(".button");

  /**
   * Updates the main display with the current equation/result
   * and toggles the clear button text between "AC" and "C".
   */
  const updateDisplay = () => {
    mainDisplay.textContent = currentEquation || "0";
    if (clearButton) {
      clearButton.textContent = (!currentEquation || isResultShown) ? "AC" : "C";
    }
  };

  /**
   * Appends input (digit, operator, or ".") to the equation.
   * Replaces the equation if a result was just displayed and
   * a numeric input is initiated.
   * @param {string} value 
   */
  const appendInput = (value) => {
    // If result is shown and a number or dot is pressed, clear for new input.
    if (isResultShown) {
      if ("0123456789.".includes(value)) {
        currentEquation = value;
      } else {
        // If an operator is pressed after a result, continue from current result.
        currentEquation = mainDisplay.textContent + value;
      }
      isResultShown = false;
      updateDisplay();
      return;
    }

    // Prevent starting the equation with an operator (except minus).
    if (!currentEquation && /[+/*.]/.test(value)) {
      return;
    }

    // Prevent consecutive operators; if the last character is an operator,
    // replace it with the new operator.
    const lastChar = currentEquation.slice(-1);
    if (/[+\-*/.]/.test(lastChar) && /[+\-*/.]/.test(value)) {
      currentEquation = currentEquation.slice(0, -1) + value;
      updateDisplay();
      return;
    }

    // Append input and update display.
    currentEquation += value;
    updateDisplay();
  };

  /**
   * Evaluates the current equation.
   * Moves the full equation with an "=" sign into history,
   * displays the result, and handles exceptions (invalid expressions,
   * division by zero, etc.).
   */
  const evaluateEquation = () => {
    if (!currentEquation) return;

    // Trim any trailing operators or dots.
    let equationToEval = currentEquation.replace(/[+\-*/.]+$/, "");
    try {
      const result = eval(equationToEval);
      // Check for division by zero or other non-finite results.
      if (!isFinite(result)) {
        mainDisplay.textContent = "Error";
      } else {
        historyDisplay.textContent = currentEquation + " =";
        currentEquation = result.toString();
        isResultShown = true;
      }
    } catch (error) {
      mainDisplay.textContent = "Error";
    }
    updateDisplay();
  };

  /**
   * Clears the equation or deletes the last character.
   * If the equation is empty or a result is shown, perform AC (clear all).
   */
  const clearOrBackspace = () => {
    if (!currentEquation || isResultShown) {
      // AC: clear everything
      currentEquation = "";
      historyDisplay.textContent = "";
      isResultShown = false;
    } else {
      // C: remove last character (backspace)
      currentEquation = currentEquation.slice(0, -1);
    }
    updateDisplay();
  };

  /**
   * Click/tap handler for calculator buttons.
   * Expects buttons to have data attributes: data-type and data-value.
   * data-type is one of: number, operator, equals, clear.
   */
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const type = button.dataset.type;
      const value = button.dataset.value;

      if (type === "number" || type === "operator") {
        appendInput(value);
      } else if (type === "equals") {
        evaluateEquation();
      } else if (type === "clear") {
        clearOrBackspace();
      }
    });
  });

  /**
   * Keyboard event listener supports:
   * - Numbers and dots (0-9, .)
   * - Operators (+, -, *, /)
   * - Enter or "=" to evaluate
   * - Backspace for clear (C/AC)
   * - Escape as an alternative for AC
   */
  document.addEventListener("keydown", (event) => {
    const key = event.key;

    if ("0123456789.".includes(key)) {
      appendInput(key);
      event.preventDefault();
    } else if (["+", "-", "*", "/"].includes(key)) {
      appendInput(key);
      event.preventDefault();
    } else if (key === "Enter" || key === "=") {
      evaluateEquation();
      event.preventDefault();
    } else if (key === "Backspace") {
      clearOrBackspace();
      event.preventDefault();
    } else if (key === "Escape") {
      // Treat Escape as AC to clear everything.
      currentEquation = "";
      historyDisplay.textContent = "";
      isResultShown = false;
      updateDisplay();
      event.preventDefault();
    }
  });

  // Initialize display on load.
  updateDisplay();
});