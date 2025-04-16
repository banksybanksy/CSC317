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

  // Safe evaluator using shunting-yard algorithm
  function safeEvaluate(expr) {
    const tokens = expr.match(/(\d+\.?\d*|\.\d+|[+\-*/()])/g);
    if (!tokens) return null;
    const outputQueue = [];
    const operatorStack = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const associativity = { '+': 'L', '-': 'L', '*': 'L', '/': 'L' };

    // Convert tokens to postfix notation
    tokens.forEach(token => {
      if (!isNaN(token)) {
        outputQueue.push(parseFloat(token));
      } else if ("+-*/".includes(token)) {
        while (operatorStack.length) {
          const opTop = operatorStack[operatorStack.length - 1];
          if ("+-*/".includes(opTop) &&
              ((associativity[token] === 'L' && precedence[token] <= precedence[opTop]) ||
               (associativity[token] === 'R' && precedence[token] < precedence[opTop]))) {
            outputQueue.push(operatorStack.pop());
          } else {
            break;
          }
        }
        operatorStack.push(token);
      } else if (token === "(") {
        operatorStack.push(token);
      } else if (token === ")") {
        while (operatorStack.length && operatorStack[operatorStack.length - 1] !== "(") {
          outputQueue.push(operatorStack.pop());
        }
        if (operatorStack[operatorStack.length - 1] === "(") {
          operatorStack.pop();
        } else {
          throw new Error("Mismatched parentheses");
        }
      }
    });
    while (operatorStack.length) {
      const op = operatorStack.pop();
      if (op === "(" || op === ")") throw new Error("Mismatched parentheses");
      outputQueue.push(op);
    }

    // Evaluate postfix expression
    const evaluationStack = [];
    outputQueue.forEach(token => {
      if (typeof token === 'number') {
        evaluationStack.push(token);
      } else if ("+-*/".includes(token)) {
        const b = evaluationStack.pop();
        const a = evaluationStack.pop();
        if (token === '/' && b === 0) throw new Error("Division by zero");
        let res;
        switch (token) {
          case '+': res = a + b; break;
          case '-': res = a - b; break;
          case '*': res = a * b; break;
          case '/': res = a / b; break;
        }
        evaluationStack.push(res);
      }
    });
    if (evaluationStack.length !== 1) throw new Error("Invalid expression");
    return evaluationStack[0];
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
    } catch (e) {
      mainDisplay.value = "Error";
      currentInput = "";
      fullEquation = "";
    }
    resultDisplayed = true;
    updateDisplay();
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

  // Button click events
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const type = button.dataset.type;
      const value = button.dataset.value;
      if (type === "number") appendDigit(value);
      else if (type === "operator") appendOperator(value);
      else if (type === "equals") evaluateEquation();
      else if (type === "clear") clearOrBackspace();
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