// Pomodoro Timer JavaScript
(function() {
    'use strict';

    // Timer state
    let timerInterval = null;
    let timeRemaining = 25 * 60; // seconds
    let isRunning = false;
    let isBreak = false;
    let sessionsCompleted = 0;
    let totalFocusMinutes = 0;

    // DOM elements
    let timerClock, timerMode, startBtn, resetBtn;
    let focusDurationSelect, breakDurationSelect, soundToggle;
    let sessionsDisplay, focusTimeDisplay;
    let ctaSection, ctaHeading, ctaText, ctaButton;

    // Audio for timer end
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRA0PVKzn77BdGAg+ltzy0H0pBSh+zPLaizsIG2q77OihUBELTKXh8bllHAU2jdXzzn8rBSqBzvDajjoIGGS57+mjUxILTKnh8rplHAc2jNXzzoEtBSeBzvDajjsIF2W57umkUhILTKnh8rtnHAc2jtXzz4EtBSeBzvDajjsIF2W47umkUhILTKnh8rpoHAc2jtXzz4EsBSaBzvDcjTsIGGW47umjUxILTKrh8r1nHAc2jtXzz4IsBSaBzvDcjTsIGGW47umjUxILTKrh8rxmHAc2jtXz0IIrBSeBzvDcjTsIGGa47+mjUxILTqrh8rtmHAc3jtXz0IIrBSeBzvDcjjsIGGa47+mjUxILTqrh8rtnHAc2jtXz0IIrBSeBzvDcjjsIGGa47+mjUxILTqrh8rtnHAc2jtXz0YIrBSeBzvDcjjsIGGa47+mjUxILTqrh8rxmHAc3jtXz0YIrBSeBzvDcjjsIGGa47+mjUxILTqrh8rxmHAc3jtXz0YMrBSeBzvDdjjsIGGa47+mjUhILTqrh8rxnHAc3jtXz0YMrBSeBzvDdjjsIGGa47+mjUhILTqrh8rxnHAc3jtXz0YMrBSeBzvDdjjsIGGa47+mjUhILTqrh8rxnHAc3jtXz0YMrBSeBzvDdjjsIGGa47+mjUhILTqrh8rxnHAc3jtXz0YMrBSeBzvDdjjsIF2W47+mjUhILTqrh8rxnHAc2jtXz0YMrBSeBzvDdjjsIF2W47+mjUhILTqrh8rxnHAc2jtXz0YMrBSeBzvDdjjsIF2W47+mjUhILTqrh8rxnHAc2jtXz0YMrBSeBzvDdjjsIF2W47+mjUhILTqrh8rxnHAc2jtXz0YMrBQ==');

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        initializeElements();
        setupEventListeners();
        loadSavedData();
        updateCopyrightYear();
    });

    /**
     * Initialize DOM elements
     */
    function initializeElements() {
        timerClock = document.getElementById('timerClock');
        timerMode = document.getElementById('timerMode');
        startBtn = document.getElementById('startBtn');
        resetBtn = document.getElementById('resetBtn');
        focusDurationSelect = document.getElementById('focusDuration');
        breakDurationSelect = document.getElementById('breakDuration');
        soundToggle = document.getElementById('soundToggle');
        sessionsDisplay = document.getElementById('sessionsToday');
        focusTimeDisplay = document.getElementById('focusTime');
        ctaSection = document.getElementById('cta-section');
        ctaHeading = document.getElementById('ctaHeading');
        ctaText = document.getElementById('ctaText');
        ctaButton = document.getElementById('ctaButton');
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        startBtn.addEventListener('click', toggleTimer);
        resetBtn.addEventListener('click', resetTimer);
        focusDurationSelect.addEventListener('change', updateFocusDuration);
        breakDurationSelect.addEventListener('change', updateBreakDuration);
        
        // Track CTA button clicks with delegation since button may not exist yet
        document.addEventListener('click', function(e) {
            if (e.target && e.target.id === 'ctaButton') {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'pomodoro_cta_click', {
                        'session_count': sessionsCompleted,
                        'focus_minutes': totalFocusMinutes,
                        'cta_text': e.target.textContent
                    });
                }
            }
        });
    }

    /**
     * Toggle timer (start/pause)
     */
    function toggleTimer() {
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }

    /**
     * Start timer
     */
    function startTimer() {
        isRunning = true;
        startBtn.textContent = 'Pause';
        startBtn.classList.remove('btn-primary');
        startBtn.classList.add('btn-secondary');
        startBtn.setAttribute('aria-pressed', 'true');

        timerInterval = setInterval(function() {
            timeRemaining--;

            if (timeRemaining <= 0) {
                timerComplete();
            }

            updateDisplay();
        }, 1000);
    }

    /**
     * Pause timer
     */
    function pauseTimer() {
        isRunning = false;
        startBtn.textContent = 'Resume';
        startBtn.classList.remove('btn-secondary');
        startBtn.classList.add('btn-primary');
        startBtn.setAttribute('aria-pressed', 'false');
        clearInterval(timerInterval);
    }

    /**
     * Reset timer
     */
    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        isBreak = false;
        startBtn.textContent = 'Start';
        startBtn.classList.remove('btn-secondary');
        startBtn.classList.add('btn-primary');
        startBtn.setAttribute('aria-pressed', 'false');
        
        const focusDuration = parseInt(focusDurationSelect.value);
        timeRemaining = focusDuration * 60;
        timerMode.textContent = 'Focus Time';
        
        updateDisplay();
    }

    /**
     * Timer complete
     */
    function timerComplete() {
        clearInterval(timerInterval);
        isRunning = false;

        // Play sound if enabled
        if (soundToggle.checked) {
            audio.play().catch(e => console.log('Audio play failed:', e));
        }

        if (!isBreak) {
            // Focus session completed
            sessionsCompleted++;
            const focusDuration = parseInt(focusDurationSelect.value);
            totalFocusMinutes += focusDuration;
            
            saveData();
            updateStats();
            showSmartCTA();

            // Switch to break
            isBreak = true;
            const breakDuration = parseInt(breakDurationSelect.value);
            timeRemaining = breakDuration * 60;
            timerMode.textContent = 'Break Time';
            startBtn.textContent = 'Start Break';
        } else {
            // Break completed
            isBreak = false;
            const focusDuration = parseInt(focusDurationSelect.value);
            timeRemaining = focusDuration * 60;
            timerMode.textContent = 'Focus Time';
            startBtn.textContent = 'Start';
        }

        startBtn.classList.remove('btn-secondary');
        startBtn.classList.add('btn-primary');
        updateDisplay();
    }

    /**
     * Update display
     */
    function updateDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerClock.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Update stats display
     */
    function updateStats() {
        sessionsDisplay.textContent = sessionsCompleted;
        focusTimeDisplay.textContent = totalFocusMinutes + ' min';
    }

    /**
     * Show smart CTA based on sessions completed
     */
    function showSmartCTA() {
        if (sessionsCompleted === 1) {
            ctaHeading.textContent = 'Great focus session!';
            ctaText.textContent = "Want to track what you just worked on?";
            ctaButton.textContent = 'Track Activity in Timeki';
            ctaSection.style.display = 'block';
            
            // Track analytics event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pomodoro_session_complete', {
                    'session_count': sessionsCompleted,
                    'focus_minutes': totalFocusMinutes
                });
            }
        } else if (sessionsCompleted === 3) {
            ctaHeading.textContent = 'Impressive focus!';
            ctaText.textContent = `Turn ${totalFocusMinutes} minutes of focus into tracked work`;
            ctaButton.textContent = 'Track & Bill Your Time';
            ctaSection.style.display = 'block';
            
            // Track analytics event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pomodoro_session_complete', {
                    'session_count': sessionsCompleted,
                    'focus_minutes': totalFocusMinutes
                });
            }
        } else if (sessionsCompleted >= 5) {
            ctaHeading.textContent = 'You're on fire! 🔥';
            ctaText.textContent = `Save today's ${totalFocusMinutes} minutes of focus time in Timeki`;
            ctaButton.textContent = 'Save Today\'s Work';
            ctaSection.style.display = 'block';
            
            // Track analytics event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pomodoro_session_complete', {
                    'session_count': sessionsCompleted,
                    'focus_minutes': totalFocusMinutes
                });
            }
        } else if (sessionsCompleted % 4 === 0 && sessionsCompleted > 0) {
            ctaHeading.textContent = 'Productivity champion!';
            ctaText.textContent = `${sessionsCompleted} sessions completed! Keep track of all this work.`;
            ctaButton.textContent = 'Start Tracking in Timeki';
            ctaSection.style.display = 'block';
            
            // Track analytics event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pomodoro_session_complete', {
                    'session_count': sessionsCompleted,
                    'focus_minutes': totalFocusMinutes
                });
            }
        }
    }

    /**
     * Update focus duration
     */
    function updateFocusDuration() {
        if (!isRunning && !isBreak) {
            const focusDuration = parseInt(focusDurationSelect.value);
            timeRemaining = focusDuration * 60;
            updateDisplay();
        }
    }

    /**
     * Update break duration
     */
    function updateBreakDuration() {
        // Break duration will apply to next break
    }

    /**
     * Save data to localStorage
     */
    function saveData() {
        const today = new Date().toDateString();
        const data = {
            date: today,
            sessions: sessionsCompleted,
            focusMinutes: totalFocusMinutes
        };
        localStorage.setItem('pomodoroData', JSON.stringify(data));
    }

    /**
     * Load saved data
     */
    function loadSavedData() {
        const saved = localStorage.getItem('pomodoroData');
        if (saved) {
            const data = JSON.parse(saved);
            const today = new Date().toDateString();
            
            if (data.date === today) {
                sessionsCompleted = data.sessions || 0;
                totalFocusMinutes = data.focusMinutes || 0;
                updateStats();
            } else {
                // New day, reset
                localStorage.removeItem('pomodoroData');
            }
        }
    }

    /**
     * Update copyright year
     */
    function updateCopyrightYear() {
        const yearElement = document.getElementById('copyright-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

})();
