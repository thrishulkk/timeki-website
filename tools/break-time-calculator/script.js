// Break Time Calculator JavaScript
(function() {
    'use strict';

    // Initialize the calculator on page load
    document.addEventListener('DOMContentLoaded', function() {
        setupEventListeners();
        updateCopyrightYear();
    });

    /**
     * Setup event listeners for calculate and clear buttons
     */
    function setupEventListeners() {
        const calculateBtn = document.getElementById('calculateBtn');
        const clearBtn = document.getElementById('clearBtn');

        calculateBtn.addEventListener('click', calculateBreakTime);
        clearBtn.addEventListener('click', clearForm);
    }

    /**
     * Calculate break time and working hours
     */
    function calculateBreakTime() {
        // Get start time inputs
        const startHour = parseInt(document.getElementById('startHour').value) || 0;
        const startMinute = parseInt(document.getElementById('startMinute').value) || 0;
        const startPeriod = document.getElementById('startPeriod').value;

        // Get end time inputs
        const endHour = parseInt(document.getElementById('endHour').value) || 0;
        const endMinute = parseInt(document.getElementById('endMinute').value) || 0;
        const endPeriod = document.getElementById('endPeriod').value;

        // Validate time inputs
        if (!validateTimeInput(startHour, startMinute)) {
            alert('Please enter a valid start time (Hour: 1-12, Minute: 0-59).');
            return;
        }

        if (!validateTimeInput(endHour, endMinute)) {
            alert('Please enter a valid end time (Hour: 1-12, Minute: 0-59).');
            return;
        }

        // Convert to 24-hour format and calculate total minutes
        const startTotalMinutes = convertTo24HourMinutes(startHour, startMinute, startPeriod);
        const endTotalMinutes = convertTo24HourMinutes(endHour, endMinute, endPeriod);

        // Calculate total work minutes (handle overnight shifts)
        let totalWorkMinutes = endTotalMinutes - startTotalMinutes;
        if (totalWorkMinutes < 0) {
            totalWorkMinutes += 1440; // Add 24 hours in minutes
        }

        if (totalWorkMinutes === 0) {
            alert('End time must be different from start time.');
            return;
        }

        // Get break times
        const breakInputs = document.querySelectorAll('.break-input');
        let totalBreakMinutes = 0;

        breakInputs.forEach(input => {
            const breakValue = parseInt(input.value) || 0;
            if (breakValue > 0) {
                totalBreakMinutes += breakValue;
            }
        });

        // Calculate net working minutes
        const netWorkMinutes = Math.max(0, totalWorkMinutes - totalBreakMinutes);

        // Display results
        displayResults({
            totalWorkMinutes: totalWorkMinutes,
            totalBreakMinutes: totalBreakMinutes,
            netWorkMinutes: netWorkMinutes
        });
    }

    /**
     * Validate time input values
     */
    function validateTimeInput(hour, minute) {
        return hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59;
    }

    /**
     * Convert 12-hour time to total minutes from midnight
     */
    function convertTo24HourMinutes(hour, minute, period) {
        let hours = hour;
        
        if (period === 'PM' && hour !== 12) {
            hours += 12;
        } else if (period === 'AM' && hour === 12) {
            hours = 0;
        }

        return (hours * 60) + minute;
    }

    /**
     * Convert minutes to HH:MM format
     */
    function minutesToHHMM(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    /**
     * Convert minutes to decimal hours
     */
    function minutesToDecimal(totalMinutes) {
        return (totalMinutes / 60).toFixed(2);
    }

    /**
     * Display calculation results
     */
    function displayResults(data) {
        const resultsGrid = document.getElementById('results');
        const ctaSection = document.getElementById('cta-section');

        // Update result values
        document.getElementById('totalHours').textContent = minutesToHHMM(data.totalWorkMinutes);
        document.getElementById('totalBreaks').textContent = minutesToHHMM(data.totalBreakMinutes);
        document.getElementById('netHours').textContent = minutesToHHMM(data.netWorkMinutes);

        // Show results and CTA
        resultsGrid.style.display = 'grid';
        ctaSection.style.display = 'block';

        // Smooth scroll to results
        resultsGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Clear all form inputs and results
     */
    function clearForm() {
        // Clear start time
        document.getElementById('startHour').value = '';
        document.getElementById('startMinute').value = '';
        document.getElementById('startPeriod').value = 'AM';

        // Clear end time
        document.getElementById('endHour').value = '';
        document.getElementById('endMinute').value = '';
        document.getElementById('endPeriod').value = 'PM';

        // Clear break inputs
        const breakInputs = document.querySelectorAll('.break-input');
        breakInputs.forEach(input => {
            input.value = '';
        });

        // Hide results and CTA
        document.getElementById('results').style.display = 'none';
        document.getElementById('cta-section').style.display = 'none';

        // Reset result values
        document.getElementById('totalHours').textContent = '0:00';
        document.getElementById('totalBreaks').textContent = '0:00';
        document.getElementById('netHours').textContent = '0:00';
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
