const testTexts = [
    "The quick brown fox jumps over the lazy dog. This classic pangram contains every letter of the English alphabet.",
    "Programming is the art of telling another human being what one wants the computer to do.  Keep spaces precise!",
    "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.",
    "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
    "JavaScript is a high-level, interpreted programming language that conforms to the ECMAScript specification.  Type with flow!",
];

let currentText = "";
let startTime = null;
let timerInterval = null;
let isTestActive = false;

// DOM elements
const textDisplay = document.getElementById("textDisplay");
const userInput = document.getElementById("userInput");
const startBtn = document.getElementById("startBtn");
const timeDisplay = document.getElementById("time");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const resultsDiv = document.getElementById("results");

// Returns random text with original spacing (including multiple spaces, newlines, etc)
function getRandomText() {
    return testTexts[Math.floor(Math.random() * testTexts.length)];
}

function displayTextWithHighlight() {
    const inputValue = userInput.value;
    let html = "";
    const textLen = currentText.length;
    const typedLen = inputValue.length;

    for (let i = 0; i < textLen; i++) {
        const originalChar = currentText[i];
        let className = "";

        // Determine the class based on user input and position
        if (i < typedLen) {
            // this position has been typed by user
            const userChar = inputValue[i];
            if (userChar === originalChar) {
                className = "correct";
            } else {
                className = "incorrect";
            }
        } else if (i === typedLen) {
            // this is the upcoming character (current cursor position)
            className = "current";
        }

        let displayChar = originalChar;
        if (originalChar === "<") displayChar = "&lt;";
        if (originalChar === ">") displayChar = "&gt;";
        if (originalChar === "&") displayChar = "&amp;";

        // Build span with class if needed
        if (className) {
            html += `<span class="${className}">${displayChar}</span>`;
        } else {
            html += `<span>${displayChar}</span>`;
        }
    }

    textDisplay.innerHTML = html;
}
function calculateStats() {
    if (!startTime || !isTestActive) return;

    const inputText = userInput.value;
    const timeElapsed = (Date.now() - startTime) / 1000; // seconds
    if (timeElapsed <= 0) return;

    const minutes = timeElapsed / 60;

    // Count correct characters (up to min length of both strings)
    let correctChars = 0;
    const minLen = Math.min(inputText.length, currentText.length);
    for (let i = 0; i < minLen; i++) {
        if (inputText[i] === currentText[i]) {
            correctChars++;
        }
    }

    // Net WPM: (correct chars / 5) / minutes
    let netWpm = 0;
    if (minutes > 0 && correctChars > 0) {
        netWpm = Math.round(correctChars / 5 / minutes);
    } else if (correctChars === 0) {
        netWpm = 0;
    } else {
        netWpm = 0;
    }

    // Accuracy calculation: (correctChars / totalTyped) * 100
    let accuracy = 100;
    const totalTyped = inputText.length;
    if (totalTyped > 0) {
        accuracy = Math.round((correctChars / totalTyped) * 100);
    } else {
        accuracy = 100;
    }

    // Update dashboard
    timeDisplay.textContent = Math.floor(timeElapsed);
    wpmDisplay.textContent = netWpm;
    accuracyDisplay.textContent = accuracy;

    if (inputText.length >= currentText.length) {
        // final stats call
        endTest(netWpm, accuracy, timeElapsed);
    }
}

// End the test with final results, disable live updates
function endTest(finalWpm, finalAccuracy, timeElapsedSec) {
    if (!isTestActive) return; // avoid double finish
    isTestActive = false;

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    userInput.disabled = true;
    startBtn.disabled = false;
    startBtn.textContent = " NEW TEST";

    // Optional: Additional final check to show correct wpm based on full text
    const finalInput = userInput.value;
    let finalCorrect = 0;
    for (let i = 0; i < currentText.length && i < finalInput.length; i++) {
        if (finalInput[i] === currentText[i]) finalCorrect++;
    }
    const finalAccuracyVal =
        finalInput.length > 0
            ? Math.round((finalCorrect / finalInput.length) * 100)
            : 100;
    const finalMinutes = timeElapsedSec / 60;
    let finalNetWpm = 0;
    if (finalMinutes > 0) {
        finalNetWpm = Math.round(finalCorrect / 5 / finalMinutes);
    }

    // update final display with precise values
    wpmDisplay.textContent = finalNetWpm;
    accuracyDisplay.textContent = finalAccuracyVal;

    let message = "";
    if (finalNetWpm > 70) message = "🏆 INSANE! Elite typist! 🏆";
    else if (finalNetWpm > 55)
        message = "⚡ Excellent speed! Professional level ⚡";
    else if (finalNetWpm > 40) message = "👍 Great job! Keep pushing! 👍";
    else if (finalNetWpm > 25)
        message = " Good start! Practice daily! ";
    else
        message = "🌱 Keep practicing, every master was once a beginner! 🌱";

    resultsDiv.innerHTML = `
<h3>✅ TEST COMPLETE ✅</h3>
<p> Net WPM: <strong>${finalNetWpm}</strong> (accurate characters only)</p>
<p> Final Accuracy: <strong>${finalAccuracyVal}%</strong></p>
<p> Time: <strong>${Math.floor(timeElapsedSec)} seconds</strong></p>
<p style="margin-top: 12px; font-size: 1.1rem;">${message}</p>
<p style="font-size: 0.85rem; margin-top: 8px;">✨ Tip: match spaces exactly for perfect accuracy ✨</p>
`;
}

// reset UI for new test, pick random text, fresh state
function startTest() {
    // kill any ongoing timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // pick fresh text
    currentText = getRandomText();
    userInput.value = "";
    userInput.disabled = false;
    userInput.focus();
    startTime = Date.now();
    isTestActive = true;

    // clear results panel and reset stats display
    resultsDiv.innerHTML = "";
    timeDisplay.textContent = "0";
    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "100";

    // render fresh highlight
    displayTextWithHighlight();

    // setup interval to refresh stats every 80ms for smooth updates
    timerInterval = setInterval(() => {
        if (isTestActive && startTime) {
            calculateStats();
            // also refresh highlight real-time (already called on input but sync for safety)
            displayTextWithHighlight();
        }
    }, 80);

    startBtn.textContent = "⌨️ TYPING IN PROGRESS...";
    startBtn.disabled = true;
}

// Event: every time user types, update highlighting and auto-check if finished
userInput.addEventListener("input", () => {
    if (isTestActive) {
        displayTextWithHighlight();
        // also trigger completion detection on the fly (calculateStats already checks length)
        // force a stat refresh for instant accuracy
        if (startTime) {
            calculateStats();
        }
        // Extra: if the user's input length becomes longer or equal to currentText,
        // calculateStats calls endTest, but also ensure edge with backspacing no double trigger
        if (userInput.value.length >= currentText.length) {
            // force final stats call
            if (isTestActive) {
                const finalTime = (Date.now() - startTime) / 1000;
                const finalInput = userInput.value;
                let finalCorrectCount = 0;
                for (
                    let i = 0;
                    i < currentText.length && i < finalInput.length;
                    i++
                ) {
                    if (finalInput[i] === currentText[i]) finalCorrectCount++;
                }
                const finalAccuracyVal =
                    finalInput.length > 0
                        ? Math.round((finalCorrectCount / finalInput.length) * 100)
                        : 100;
                const finalMinutes = finalTime / 60;
                let finalWpm = 0;
                if (finalMinutes > 0)
                    finalWpm = Math.round(finalCorrectCount / 5 / finalMinutes);
                endTest(finalWpm, finalAccuracyVal, finalTime);
            }
        }
    }
});

// Start button click handler
startBtn.addEventListener("click", startTest);

// Initial page load: show preview text (disabled input, but display a random sample)
// So that the user sees an example before starting.
currentText = getRandomText();
displayTextWithHighlight();
userInput.disabled = true;
startBtn.disabled = false;
startBtn.textContent = "  START TEST";