// The hash for 
const magicWordHash = "09a0845b88aee7df02062295a5e300eea8cb6d796ddefa1195560e444af4a09d";

let strikes = 0;
let isLockdown = false;
let isBooting = true;
let currentInput = "";

const output = document.getElementById('output');
const userInput = document.getElementById('user-input');
const strikeCounter = document.getElementById('strike-counter');
const nedryContainer = document.getElementById('nedry-container');
const nedryAudio = document.getElementById('nedry-audio');
const gate = document.getElementById('lockdown-gate');

const typingSound = new Audio('assets/typing.mp3');
const errorSound = new Audio('assets/error.mp3');
const confirmSound = new Audio('assets/confirm.mp3');

function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio playback blocked: ", e));
}

// Helper to hash the user's input
async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const bootLines = [
    "AEOWUN CONTROL CONSOLE - VERSION 4.2.2",
    "CHECKING SYSTEM INTEGRITY...",
    `NETWORK ACCESS: ${navigator.onLine ? "TRUE" : "FALSE"}`,
    "SYSTEM INTEGRITY CHECK: TRUE",
    "SYSTEM REBOOT OR TRIP DETECTED",
    "INITIATING LOCKDOWN PROTOCOL...",
    " ",
    "ZA3#: ACCESS MAIN SECURITY STARTUP",
    '"SOME TIMES A FUNCTION NEEDS TO CALL ITSELF"',
    "WHAT IS THE MAGIC WORD?  "
];

async function typeIntro() {
    isBooting = true;
    for (let i = 0; i < bootLines.length; i++) {
        const line = bootLines[i];
        for (let char of line) {
            output.textContent += char;
            playSound(typingSound);
            await new Promise(r => setTimeout(r, 30));
        }
        if (i < bootLines.length - 1) {
            output.textContent += "\n";
            await new Promise(r => setTimeout(r, 200));
        }
    }
    isBooting = false;
}

document.addEventListener('keydown', async (e) => {
    if (isLockdown || isBooting) return;

    if (e.key === 'Enter') {
        await handleAttempt();
    } else if (e.key === 'Backspace') {
        currentInput = currentInput.slice(0, -1);
        userInput.textContent = currentInput;
        playSound(typingSound);
    } else if (e.key.length === 1) {
        currentInput += e.key;
        userInput.textContent = currentInput;
        playSound(typingSound);
    }
});

async function handleAttempt() {
    const attempt = currentInput.trim().toLowerCase();
    currentInput = "";
    userInput.textContent = "";

    const hashedInput = await hashString(attempt);

    if (hashedInput === magicWordHash) {
        playSound(confirmSound);
        output.textContent += "\n\nACCESS GRANTED. SYSTEM REBOOTING. WELCOME TO AEOWUN...";
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
    } else {
        strikes++;
        playSound(errorSound);
        strikeCounter.textContent = "X ".repeat(strikes).trim();
        if (strikes >= 3) {
            activateLockdown();
        }
    }
}

function activateLockdown() {
    isLockdown = true;
    nedryContainer.style.display = 'flex';
    nedryAudio.play();
}

window.addEventListener('click', () => {
    if (output.textContent === "") {
        typeIntro();
    }
}, { once: true });

window.addEventListener('keydown', () => {
    if (output.textContent === "") {
        typeIntro();
    }
}, { once: true });
