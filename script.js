let LEASE_YEARS = 3;
let MILES_PER_YEAR = 10000;
let TOTAL_MILES = LEASE_YEARS * MILES_PER_YEAR;
let DAILY_ALLOWANCE = MILES_PER_YEAR / 365;
let START_DATE = new Date('2025-02-24T00:00:00');

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

const setupView = document.getElementById('setup-view');
const dashboardView = document.getElementById('dashboard-view');
const editProfileBtn = document.getElementById('edit-profile-btn');
const leaseStartInput = document.getElementById('lease-start');
const yearlyMileageInput = document.getElementById('yearly-mileage');
const leaseYearsInput = document.getElementById('lease-years');
const saveProfileBtn = document.getElementById('save-profile-btn');
const totalAllowanceText = document.getElementById('total-allowance-text');

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

// Car Profile Logic
function loadProfile() {
    const profile = JSON.parse(localStorage.getItem('car_profile'));
    if (profile) {
        LEASE_YEARS = parseFloat(profile.leaseYears) || 3;
        MILES_PER_YEAR = parseFloat(profile.yearlyMileage) || 10000;
        TOTAL_MILES = LEASE_YEARS * MILES_PER_YEAR;
        DAILY_ALLOWANCE = MILES_PER_YEAR / 365;
        
        const pieces = profile.startDate.split('-');
        START_DATE = new Date(pieces[0], pieces[1] - 1, pieces[2]);

        totalAllowanceText.textContent = TOTAL_MILES.toLocaleString();
        
        setupView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        editProfileBtn.style.display = 'block';
        
        updateDashboard();
    } else {
        dashboardView.classList.add('hidden');
        editProfileBtn.style.display = 'none';
        setupView.classList.remove('hidden');
    }
}

saveProfileBtn.addEventListener('click', () => {
    if (!leaseStartInput.value || !yearlyMileageInput.value || !leaseYearsInput.value) {
        alert("Please fill out all fields.");
        return;
    }
    
    const profile = {
        startDate: leaseStartInput.value,
        yearlyMileage: yearlyMileageInput.value,
        leaseYears: leaseYearsInput.value
    };
    
    localStorage.setItem('car_profile', JSON.stringify(profile));
    loadProfile();
});

editProfileBtn.addEventListener('click', () => {
    const profile = JSON.parse(localStorage.getItem('car_profile')) || {};
    if (profile.startDate) leaseStartInput.value = profile.startDate;
    if (profile.yearlyMileage) yearlyMileageInput.value = profile.yearlyMileage;
    if (profile.leaseYears) leaseYearsInput.value = profile.leaseYears;
    
    dashboardView.classList.add('hidden');
    setupView.classList.remove('hidden');
    editProfileBtn.style.display = 'none';
});

// Initialize
const savedMileage = localStorage.getItem('mileage_last_entered');
if (savedMileage !== null) {
    odometerInput.value = savedMileage;
}
loadProfile();

odometerInput.addEventListener('input', updateDashboard);

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.error('SW registration failed', err));
    });
}
