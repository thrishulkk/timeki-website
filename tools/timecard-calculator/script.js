// Timecard Calculator JavaScript
(function() {
    'use strict';

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Initialize the calculator on page load
    document.addEventListener('DOMContentLoaded', function() {
        initializeTable();
        setupEventListeners();
        updateCopyrightYear();
    });

    /**
     * Initialize the timecard table with rows for each day
     */
    function initializeTable() {
        const tbody = document.getElementById('timecard-body');
        
        days.forEach(day => {
            const row = createDayRow(day);
            tbody.appendChild(row);
        });
    }

    /**
     * Create a table row for a specific day
     */
    function createDayRow(day) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="day-label">${day}</td>
            <td>
                <div class="time-input-group">
                    <input type="number" class="time-input start-hour" min="1" max="12" placeholder="HH" aria-label="${day} start hour">
                    <span class="time-separator">:</span>
                    <input type="number" class="time-input start-minute" min="0" max="59" placeholder="MM" aria-label="${day} start minute">
                    <select class="period-select start-period" aria-label="${day} start AM/PM">
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </select>
                </div>
            </td>
            <td>
                <div class="time-input-group">
                    <input type="number" class="time-input end-hour" min="1" max="12" placeholder="HH" aria-label="${day} end hour">
                    <span class="time-separator">:</span>
                    <input type="number" class="time-input end-minute" min="0" max="59" placeholder="MM" aria-label="${day} end minute">
                    <select class="period-select end-period" aria-label="${day} end AM/PM">
                        <option value="AM">AM</option>
                        <option value="PM" selected>PM</option>
                    </select>
                </div>
            </td>
            <td>
                <input type="text" class="break-input" placeholder="0:00" aria-label="${day} break duration" pattern="[0-9]+:[0-5][0-9]">
            </td>
            <td class="daily-total">-</td>
        `;
        return row;
    }

    /**
     * Setup event listeners for calculate and clear buttons
     */
    function setupEventListeners() {
        const calculateBtn = document.getElementById('calculateBtn');
        const clearBtn = document.getElementById('clearBtn');

        calculateBtn.addEventListener('click', calculateHours);
        clearBtn.addEventListener('click', clearForm);

        // Add input formatting for break fields
        const breakInputs = document.querySelectorAll('.break-input');
        breakInputs.forEach(input => {
            input.addEventListener('blur', formatBreakInput);
        });
    }

    /**
     * Format break input to ensure HH:MM format
     */
    function formatBreakInput(e) {
        let value = e.target.value.trim();
        if (!value) return;

        // Remove any non-digit or colon characters
        value = value.replace(/[^\d:]/g, '');

        // Parse the input
        const parts = value.split(':');
        if (parts.length === 1 && value) {
            // If only minutes provided, assume 0 hours
            const mins = parseInt(parts[0]) || 0;
            e.target.value = `0:${mins.toString().padStart(2, '0')}`;
        } else if (parts.length === 2) {
            const hours = parseInt(parts[0]) || 0;
            const mins = parseInt(parts[1]) || 0;
            e.target.value = `${hours}:${mins.toString().padStart(2, '0')}`;
        }
    }

    /**
     * Calculate total hours for the week
     */
    function calculateHours() {
        const rows = document.querySelectorAll('#timecard-body tr');
        let weeklyTotal = 0;
        let hasAnyEntry = false;

        rows.forEach(row => {
            const startHour = parseInt(row.querySelector('.start-hour').value) || 0;
            const startMinute = parseInt(row.querySelector('.start-minute').value) || 0;
            const startPeriod = row.querySelector('.start-period').value;
            
            const endHour = parseInt(row.querySelector('.end-hour').value) || 0;
            const endMinute = parseInt(row.querySelector('.end-minute').value) || 0;
            const endPeriod = row.querySelector('.end-period').value;
            
            const breakInput = row.querySelector('.break-input').value.trim();
            const dailyTotalCell = row.querySelector('.daily-total');

            // Skip if no time entered
            if (startHour === 0 && endHour === 0) {
                dailyTotalCell.textContent = '-';
                return;
            }

            hasAnyEntry = true;

            // Validate time inputs
            if (!validateTimeInput(startHour, startMinute) || !validateTimeInput(endHour, endMinute)) {
                dailyTotalCell.textContent = 'Invalid';
                dailyTotalCell.style.color = '#e74c3c';
                return;
            }

            // Convert to 24-hour format
            const startTime24 = convertTo24Hour(startHour, startMinute, startPeriod);
            const endTime24 = convertTo24Hour(endHour, endMinute, endPeriod);

            // Calculate hours worked
            let hoursWorked = calculateTimeDifference(startTime24, endTime24);

            if (hoursWorked < 0) {
                dailyTotalCell.textContent = 'Invalid';
                dailyTotalCell.style.color = '#e74c3c';
                return;
            }

            // Subtract break time
            const breakHours = parseBreakTime(breakInput);
            hoursWorked = Math.max(0, hoursWorked - breakHours);

            // Display daily total
            dailyTotalCell.textContent = hoursWorked.toFixed(2);
            dailyTotalCell.style.color = '#2c3e50';

            weeklyTotal += hoursWorked;
        });

        // Show results only if there's at least one entry
        if (hasAnyEntry) {
            displayResults(weeklyTotal);
        } else {
            alert('Please enter at least one day\'s time to calculate.');
        }
    }

    /**
     * Validate time input values
     */
    function validateTimeInput(hour, minute) {
        return hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59;
    }

    /**
     * Convert 12-hour time to 24-hour format (in hours as decimal)
     */
    function convertTo24Hour(hour, minute, period) {
        let hours = hour;
        
        if (period === 'PM' && hour !== 12) {
            hours += 12;
        } else if (period === 'AM' && hour === 12) {
            hours = 0;
        }

        return hours + (minute / 60);
    }

    /**
     * Calculate time difference between start and end times
     */
    function calculateTimeDifference(startTime, endTime) {
        let diff = endTime - startTime;
        
        // Handle overnight shifts (end time is next day)
        if (diff < 0) {
            diff += 24;
        }

        return diff;
    }

    /**
     * Parse break time input (format: H:MM or HH:MM)
     */
    function parseBreakTime(breakInput) {
        if (!breakInput) return 0;

        const parts = breakInput.split(':');
        if (parts.length !== 2) return 0;

        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;

        return hours + (minutes / 60);
    }

    /**
     * Display calculation results and show CTA
     */
    function displayResults(weeklyTotal) {
        const resultDisplay = document.getElementById('result-display');
        const resultSection = document.getElementById('result-section');
        const weeklyTotalElement = document.getElementById('weeklyTotal');

        // Update and show inline result
        weeklyTotalElement.textContent = weeklyTotal.toFixed(2) + ' hours';
        resultDisplay.style.display = 'flex';

        // Show CTA section
        resultSection.style.display = 'block';

        // Smooth scroll to CTA
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Clear all form inputs and results
     */
    function clearForm() {
        const inputs = document.querySelectorAll('.time-input, .break-input');
        inputs.forEach(input => {
            input.value = '';
        });

        const selects = document.querySelectorAll('.period-select');
        selects.forEach(select => {
            if (select.classList.contains('start-period')) {
                select.value = 'AM';
            } else {
                select.value = 'PM';
            }
        });

        const dailyTotals = document.querySelectorAll('.daily-total');
        dailyTotals.forEach(cell => {
            cell.textContent = '-';
            cell.style.color = '#2c3e50';
        });

        // Hide results
        const resultDisplay = document.getElementById('result-display');
        const resultSection = document.getElementById('result-section');
        resultDisplay.style.display = 'none';
        resultSection.style.display = 'none';
    }

    /**
     * Update copyright year in footer
     */
    function updateCopyrightYear() {
        const yearElement = document.getElementById('copyright-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

})();
