// hello.js
const greeting = "Hello, JavaScript!";

// Arrow function to return a greeting message using a template literal
const composeMessage = (name) => {
  return `Hello, ${name}!`;
};

// Output the message to the console (for Node.js execution)
console.log(composeMessage("JavaScript"));