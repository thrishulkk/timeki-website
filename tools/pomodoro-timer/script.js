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

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /**
     * Initialize the timer
     */
    function init() {
        console.log('Pomodoro Timer: Initializing...');
        initializeElements();
        setupEventListeners();
        loadSavedData();
        updateCopyrightYear();
        updateDisplay();
        console.log('Pomodoro Timer: Initialized successfully');
    }

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

        // Verify critical elements exist
        if (!startBtn) {
            console.error('Start button not found!');
        }
        if (!timerClock) {
            console.error('Timer clock element not found!');
        }
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        if (startBtn) {
            startBtn.addEventListener('click', function(e) {
                console.log('Start button clicked');
                e.preventDefault();
                toggleTimer();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', function(e) {
                console.log('Reset button clicked');
                e.preventDefault();
                resetTimer();
            });
        }

        if (focusDurationSelect) {
            focusDurationSelect.addEventListener('change', updateFocusDuration);
        }

        if (breakDurationSelect) {
            breakDurationSelect.addEventListener('change', updateBreakDuration);
        }
        
        // Track CTA button clicks
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
        console.log('Toggle timer - isRunning:', isRunning);
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
        console.log('Starting timer');
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
        console.log('Pausing timer');
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
        console.log('Resetting timer');
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
        console.log('Timer complete');
        clearInterval(timerInterval);
        isRunning = false;

        // Play sound if enabled
        if (soundToggle && soundToggle.checked) {
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
        const displayTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timerClock) {
            timerClock.textContent = displayTime;
        }
    }

    /**
     * Update stats display
     */
    function updateStats() {
        if (sessionsDisplay) {
            sessionsDisplay.textContent = sessionsCompleted;
        }
        if (focusTimeDisplay) {
            focusTimeDisplay.textContent = totalFocusMinutes + ' min';
        }
    }

    /**
     * Show smart CTA based on sessions completed
     */
    function showSmartCTA() {
        if (!ctaSection) return;

        if (sessionsCompleted === 1) {
            ctaHeading.textContent = 'Great focus session!';
            ctaText.textContent = "Want to track what you just worked on?";
            ctaButton.textContent = 'Track Activity in Timeki';
            ctaSection.style.display = 'block';
            
            trackAnalyticsEvent();
        } else if (sessionsCompleted === 3) {
            ctaHeading.textContent = 'Impressive focus!';
            ctaText.textContent = `Turn ${totalFocusMinutes} minutes of focus into tracked work`;
            ctaButton.textContent = 'Track & Bill Your Time';
            ctaSection.style.display = 'block';
            
            trackAnalyticsEvent();
        } else if (sessionsCompleted >= 5) {
            ctaHeading.textContent = 'You\'re on fire! 🔥';
            ctaText.textContent = `Save today's ${totalFocusMinutes} minutes of focus time in Timeki`;
            ctaButton.textContent = 'Save Today\'s Work';
            ctaSection.style.display = 'block';
            
            trackAnalyticsEvent();
        } else if (sessionsCompleted % 4 === 0 && sessionsCompleted > 0) {
            ctaHeading.textContent = 'Productivity champion!';
            ctaText.textContent = `${sessionsCompleted} sessions completed! Keep track of all this work.`;
            ctaButton.textContent = 'Start Tracking in Timeki';
            ctaSection.style.display = 'block';
            
            trackAnalyticsEvent();
        }
    }

    /**
     * Track analytics event
     */
    function trackAnalyticsEvent() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pomodoro_session_complete', {
                'session_count': sessionsCompleted,
                'focus_minutes': totalFocusMinutes
            });
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
        try {
            const today = new Date().toDateString();
            const data = {
                date: today,
                sessions: sessionsCompleted,
                focusMinutes: totalFocusMinutes
            };
            localStorage.setItem('pomodoroData', JSON.stringify(data));
        } catch (e) {
            console.log('Unable to save data to localStorage:', e);
        }
    }

    /**
     * Load saved data
     */
    function loadSavedData() {
        try {
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
        } catch (e) {
            console.log('Unable to load data from localStorage:', e);
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
