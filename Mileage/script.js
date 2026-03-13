const LEASE_YEARS = 3;
const MILES_PER_YEAR = 10000;
const TOTAL_MILES = LEASE_YEARS * MILES_PER_YEAR;
const DAILY_ALLOWANCE = MILES_PER_YEAR / 365;
const START_DATE = new Date('2025-02-24T00:00:00');

const odometerInput = document.getElementById('odometer');
const statusText = document.getElementById('status-text');
const remainingText = document.getElementById('remaining-text');
const targetText = document.getElementById('target-text');
const statusDot = document.getElementById('status-dot');
const progressBar = document.getElementById('progress-bar');
const daysElapsedText = document.getElementById('days-elapsed-text');
const allowedDailyText = document.getElementById('allowed-daily-text');
const paceTargetText = document.getElementById('pace-target-text');
const paceDiffText = document.getElementById('pace-diff-text');

function updateDashboard() {
    const currentMileage = parseFloat(odometerInput.value) || 0;

    // Save to localStorage
    localStorage.setItem('mileage_last_entered', odometerInput.value);

    // Calculate days elapsed
    const now = new Date();
    // Calculate difference in time
    const elapsedMs = now.getTime() - START_DATE.getTime();
    const daysElapsed = elapsedMs / (1000 * 60 * 60 * 24);

    const targetMileage = daysElapsed * DAILY_ALLOWANCE;
    const difference = targetMileage - currentMileage;

    const milesRemaining = TOTAL_MILES - currentMileage;
    remainingText.textContent = Math.max(0, Math.round(milesRemaining)).toLocaleString();

    targetText.textContent = Math.round(targetMileage).toLocaleString();

    // Calculate new pace breakdown metrics
    daysElapsedText.textContent = Math.floor(daysElapsed);
    allowedDailyText.textContent = `${DAILY_ALLOWANCE.toFixed(2)} mi/day`;
    paceTargetText.textContent = `${Math.round(targetMileage).toLocaleString()} mi`;

    if (difference >= 0) {
        paceDiffText.textContent = `${Math.round(difference).toLocaleString()} mi UNDER`;
        paceDiffText.style.color = 'var(--green)';
        paceDiffText.style.textShadow = '0 0 10px var(--green-glow)';
    } else {
        paceDiffText.textContent = `${Math.round(Math.abs(difference)).toLocaleString()} mi OVER`;
        paceDiffText.style.color = 'var(--red)';
        paceDiffText.style.textShadow = '0 0 10px var(--red-glow)';
    }

    // Calculate progress percentage for visual bar (clamped 0-100)
    let percent = (currentMileage / TOTAL_MILES) * 100;
    percent = Math.min(Math.max(percent, 0), 100);
    progressBar.style.width = `${percent}%`;

    if (difference >= 0) {
        statusText.textContent = `${Math.round(difference).toLocaleString()} miles UNDER`;
        statusText.className = 'status under';
        statusDot.style.backgroundColor = 'var(--green)';
        statusDot.style.boxShadow = '0 0 10px var(--green-glow)';
        progressBar.className = 'progress-bar under';
    } else {
        statusText.textContent = `${Math.round(Math.abs(difference)).toLocaleString()} miles OVER`;
        statusText.className = 'status over';
        statusDot.style.backgroundColor = 'var(--red)';
        statusDot.style.boxShadow = '0 0 10px var(--red-glow)';
        progressBar.className = 'progress-bar over';
    }
}

// Initialize
const savedMileage = localStorage.getItem('mileage_last_entered');
if (savedMileage !== null) {
    odometerInput.value = savedMileage;
}
updateDashboard();

odometerInput.addEventListener('input', updateDashboard);

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.error('SW registration failed', err));
    });
}
