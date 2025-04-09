# CSC 317 Assignment 4 Submission
**Name:** Damian Perez
**Student ID:** 923803696
**GitHub Username:** banksybanksy
**Assignment Number:** 4

# iOS-Style JavaScript Calculator Assignment Analysis

## Overview
This project is a fully functional calculator that replicates the iOS calculator in design and behavior using HTML, CSS, and vanilla JavaScript. It supports all standard operations (addition, subtraction, multiplication, division), utility functions (AC, +/-, %, backspace), decimal inputs, and keyboard interaction.

---
## Implementation Choices
1. **DOM Manipulation & Event Handling**
   * Event delegation is used on the button container to capture clicks efficiently.
   * Keyboard input is supported via keydown listeners, providing users with an alternative input method.

2. **State Management**
   * Several variables track the calculator state: `displayValue`, `firstOperand`, `operator`, `waitingForSecondOperand`, `currentEquation`, and `calculationComplete`.
   * Flags like `isNewCalculation` help distinguish between chained calculations and fresh starts.
   * AC/C logic toggles dynamically based on calculator state.

3. **Dynamic Display**
   * Display uses an `<input>` field with responsive font resizing to ensure readability for long numbers.
   * A secondary display (`#history`) shows the full equation during or after computation.

4. **Calculation Logic**
   * Basic operations are handled through the `performCalculation` function, which supports addition, subtraction, multiplication, and division.
     * Operator precedence is handled by first converting the equation into a format that’s easier to evaluate (called Reverse Polish Notation or RPN) using a simplified version of the Shunting Yard algorithm.
       * This ensures that multiplication and division are done *before* addition and subtraction, just like in standard math rules.
       * The RPN expression is then processed using a stack to calculate the final result in the correct order.
   * This approach ~avoids~ using `eval()`, which is insecure and does not provide control over parsing or error handling.
   * Division by zero and malformed inputs are explicitly detected, returning an “Error” message instead of executing unsafe or invalid operations.

5. **UI/UX Styling**
   * Grid layout via CSS provides clean button alignment.
   * Buttons are styled to closely resemble iOS aesthetics with distinct colors for numbers, operators, and utility buttons.
   * Buttons give visual feedback on click and key press (e.g., active-key class).

6. **Responsiveness**
   * The layout adapts to small screen sizes using media queries.
   * Font sizes and padding adjust for usability on mobile devices.

---
## Features Summary
- **Basic Arithmetic:** Supports addition, subtraction, multiplication, and division using button clicks or keyboard input.
- **Utility Functions:** Includes percentage conversion and positive/negative sign toggle for more flexible calculations.
- **Decimal Input:** Handles floating-point numbers accurately, with support for single decimal points per operand.
- **Clear & Backspace:** The AC/C button intelligently switches between clearing all input or just the last entry; backspace support is included via keyboard and internal logic.
- **Dynamic Font Scaling:** Automatically adjusts display font size to fit longer numbers without overflow.
- **Keyboard Support:** Full support for numeric keys, operators, Enter, Backspace, Escape, and more for fast input.
- **Responsive Design:** Adapts to various screen sizes with a layout and style inspired by the iOS calculator.
- **Accurate Evaluation:** Honors operator precedence (PEMDAS) using custom parsing and evaluation logic instead of `eval()`.

---

## Known Limitations
* Parentheses and more advanced operations (e.g., exponentiation) are not supported.
* No floating-point precision correction beyond `.toFixed(10)`.

---
## Hosting
This calculator is deployable via *GitHub Pages*. All files are self-contained and require no external libraries or frameworks.
