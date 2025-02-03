// Get references to the counter and button elements
const counterElement = document.getElementById('counter');
const plusOneButton = document.getElementById('plusone');
const iDontCareButton = document.getElementById('idontcare');

// Function to increment the counter
function incrementCounter() {
    // Get the current value of the counter
    let currentValue = parseInt(counterElement.textContent, 10);

    // Check if the current value is less than the maximum safe integer
    if (currentValue < Number.MAX_SAFE_INTEGER) {
        // Increment the value by 1
        currentValue += 1;
        // Update the counter element with the new value
        counterElement.textContent = currentValue;
    } else {
        alert('max val reached');
    }
}

function incrementCounter() {
    // Get the current value of the counter
    let currentValue = parseInt(counterElement.textContent, 10);

    // Check if the current value is less than the maximum safe integer
    if (currentValue < Number.MAX_SAFE_INTEGER) {
        // Increment the value by 1
        currentValue += 1;
        // Update the counter element with the new value
        counterElement.textContent = currentValue;
    } else {
        alert('max val reached');
    }
}

function incrementMillion() {
    // Get the current value of the counter
    let currentValue = parseInt(counterElement.textContent, 10);

    if (currentValue < 1000000){
        currentValue = 1000000;
        counterElement.textContent = currentValue;
    } else {
        alert('you won.');
        alert('go away.');
    }
}

// Add an event listener to the button to call the incrementCounter function when clicked
plusOneButton.addEventListener('click', incrementCounter);
iDontCareButton.addEventListener('click', incrementMillion);