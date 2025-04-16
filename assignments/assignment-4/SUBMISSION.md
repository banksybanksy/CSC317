# CSC 317 Assignment 4 Submission
**Name:** Damian Perez
**Student ID:** 923803696
**GitHub Username:** banksybanksy
**Assignment Number:** 4
**GitHub Repository:** https://github.com/banksybanksy/CSC317.git
**Live GitHub Pages URL:** https://banksybanksy.github.io/CSC317/

---
## Description
This project is a fully functional calculator built using HTML, CSS, and vanilla JavaScript, modeled after the iOS calculator in both appearance and behavior. It supports standard arithmetic operations (addition, subtraction, multiplication, division), utility functions (AC, C, backspace, toggle sign, percentage), and decimal inputs. The interface is responsive and accessible via both mouse and keyboard input. The display dynamically resizes based on input length, and a secondary display shows the equation history. Operator precedence is handled through a Shunting Yard-based algorithm, enabling correct evaluation of multi-operator expressions. The calculator also includes robust error handling, including protection against division by zero.

## Implementation
The calculator interface uses semantic HTML and a CSS grid to replicate the iOS layout. Buttons are styled with distinct colors for numbers, operators, and utilities. JavaScript handles state management and user interaction. Event delegation captures button presses efficiently, while keyboard events mirror the behavior for accessibility. State is tracked through variables such as `displayValue`, `firstOperand`, `operator`, and `waitingForSecondOperand`. Equations are parsed and evaluated using Reverse Polish Notation (RPN) to enforce PEMDAS rules. The display adjusts font size based on character count for readability. Visual feedback is provided for both button and key interactions, and logic is in place for the dynamic switching between ‘AC’ and ‘C’ states. The interface is fully responsive with optimized layouts for mobile (<480px), tablet (481-768px), and desktop (>769px) views, featuring dynamic sizing, touch-friendly buttons, and device-specific enhancements.

## Challenges
One challenge was implementing the correct behavior for the AC/C/backspace functionality, especially during mid-entry or after calculation completion. This required conditionally adjusting button behavior and updating internal state consistently. Another major hurdle was handling operator precedence correctly—ensuring that expressions like 3 + 4 × 2 compute as 3 + (4 × 2) rather than left-to-right. This was resolved using a simplified Shunting Yard algorithm and evaluating the resulting RPN with a stack.

## Added Features
Compared to the base assignment, this calculator includes:
1. Backspace functionality (C) with digit-level precision.
2. Dynamic switching between ‘AC’ and ‘C’ states.
3. Equation history display (`#history`) for user reference.
4. Responsive layout and dynamic font scaling for longer equations for better usability.

## Bonus Features
### Theme System
Implemented a comprehensive theme system that includes:
1. Light and Dark mode support with seamless transitions
2. Theme persistence across sessions using localStorage
3. iOS-accurate color schemes for both themes
4. Dynamic CSS variables for efficient theme switching
5. Proper contrast ratios for accessibility in both themes

### Memory Functions
Added professional calculator memory capabilities:
1. Memory Clear (MC) - Erases stored value
2. Memory Recall (MR) - Displays stored value
3. Memory Add (M+) - Adds current display to memory
4. Memory Subtract (M-) - Subtracts current display from memory
5. Memory indicator shows when a value is stored
6. Memory persistence across calculator sessions
7. Proper state management with the main calculator functions

## Acknowledgements 
* **MDN Web Docs** for JavaScript event handling and DOM references.
* **Wikipedia**: Shunting Yard Algorithm for operator precedence handling.
* **StackOverflow** discussions on handling input state in calculators.
* **Apple Human Interface Guidelines** for iOS calculator theming.
