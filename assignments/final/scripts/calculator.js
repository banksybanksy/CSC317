/* Calculator.js */

document.addEventListener("DOMContentLoaded", () => {
  let fullEquation = "";
  let currentInput = "0";
  let resultDisplayed = false;
  let memoryValue = 0;

  // DOM references
  const historyDisplay = document.querySelector(".history-display");
  const mainDisplay = document.querySelector(".display");
  const clearButton = document.getElementById("clear");
  const buttons = document.querySelectorAll(".button");
  const memoryButtons = document.querySelectorAll(".memory-button");
  const memoryLogList = document.getElementById("memory-log-list");

  // Adds a message to the memory log
  function logMemoryOperation(message) {
    const li = document.createElement("li");
    li.textContent = message;
    memoryLogList.appendChild(li);
  }

  // Updates the display based on current state
  function updateDisplay() {
    if (resultDisplayed) {
      mainDisplay.value = currentInput;
    } else {
      let displayText = fullEquation + currentInput;
      if (displayText === "") displayText = "0";
      displayText = displayText.replace(/\//g, '÷').replace(/\*/g, '×');
      mainDisplay.value = displayText;
    }
    clearButton.textContent =
      resultDisplayed || (fullEquation === "" && currentInput === "0")
        ? "AC"
        : "C";
  }

  // Appends a digit to the current input
  function appendDigit(digit) {
    // Prevent multiple decimals in one number
    if (digit === "." && currentInput.includes(".")) return;
    if (resultDisplayed) {
      fullEquation = "";
      currentInput = digit;
      resultDisplayed = false;
      historyDisplay.value = "";
      historyDisplay.classList.remove("active-history");
    } else {
      currentInput = currentInput === "0" && digit !== "." ? digit : currentInput + digit;
    }
    updateDisplay();
  }

  // Appends an operator to the current input
  function appendOperator(op) {
    if (resultDisplayed) {
      fullEquation = currentInput;
      currentInput = "";
      resultDisplayed = false;
    }
    if (currentInput === "") {
      if (fullEquation && /[+\-*/.]+$/.test(fullEquation)) {
        fullEquation = fullEquation.slice(0, -1) + op;
      } else {
        fullEquation += op;
      }
    } else {
      if (currentInput === "Error") currentInput = "0";
      fullEquation += currentInput + op;
      currentInput = "";
    }
    updateDisplay();
  }

  // Evaluate an expression with correct * / before + - (no parentheses)
  function safeEvaluate(expr) {
    // Split numbers and operators
    const parts = expr.split(/([+\-*/])/).filter(s => s);
    if (parts.length % 2 === 0) throw new Error("Invalid expression");
    // First pass: handle * and /
    const stack = [];
    stack.push(parseFloat(parts[0]));
    for (let i = 1; i < parts.length; i += 2) {
      const op = parts[i];
      const num = parseFloat(parts[i+1]);
      if (isNaN(num)) throw new Error("Invalid number");
      if (op === '*' || op === '/') {
        const prev = stack.pop();
        if (op === '/' && num === 0) throw new Error("Division by zero");
        stack.push(op === '*' ? prev * num : prev / num);
      } else {
        stack.push(op);
        stack.push(num);
      }
    }
    // Second pass: handle + and -
    let result = stack[0];
    for (let i = 1; i < stack.length; i += 2) {
      const op = stack[i];
      const num = stack[i+1];
      if (op === '+') result += num;
      else result -= num;
    }
    return result;
  }

  // Evaluates the complete expression (fullEquation + currentInput)
  function evaluateEquation() {
    let expression = fullEquation + currentInput;
    expression = expression.replace(/[+\-*/.]+$/, "");
    if (expression === "") return;
    try {
      const result = safeEvaluate(expression);
      const displayExpression = expression.replace(/\//g, '÷').replace(/\*/g, '×');
      historyDisplay.value = displayExpression + " =";
      historyDisplay.classList.add("active-history");
      currentInput = result.toString();
      fullEquation = "";
      // Show result and update
      resultDisplayed = true;
      updateDisplay();
      return;
    } catch (e) {
      // Show error and keep it visible
      currentInput = "Error";
      fullEquation = "";
      resultDisplayed = true;
      updateDisplay();
      return;
    }
  }

  // Clears the calculator or performs a backspace operation
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

  // Toggle positive/negative for current input
  function toggleNegate() {
    if (currentInput === "0" || currentInput === "") return;
    if (currentInput.charAt(0) === "-") {
      currentInput = currentInput.slice(1);
    } else {
      currentInput = "-" + currentInput;
    }
    updateDisplay();
  }

  // Convert current input to a percentage
  function convertPercentage() {
    let value = parseFloat(currentInput) || 0;
    value = value / 100;
    currentInput = value.toString();
    updateDisplay();
  }

  // Button click events
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const type = button.dataset.type;
      const value = button.dataset.value;
      if (type === "number") appendDigit(value);
      else if (type === "operator") appendOperator(value);
      else if (type === "equals") evaluateEquation();
      else if (type === "clear") clearOrBackspace();
      else if (type === "negate") toggleNegate();
      else if (type === "percentage") convertPercentage();
    });
  });

  // Keyboard input
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
    } else if (key === "%") {
      convertPercentage();
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

  // Memory button events
  memoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.memory;
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

  updateDisplay();
});