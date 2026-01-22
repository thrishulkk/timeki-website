// Overtime Calculator JavaScript
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

        calculateBtn.addEventListener('click', calculateOvertime);
        clearBtn.addEventListener('click', clearForm);

        // Add real-time validation for overtime rate (max 2 decimals)
        const overtimeRateInput = document.getElementById('overtimeRate');
        overtimeRateInput.addEventListener('input', function(e) {
            validateDecimalPlaces(e.target, 2);
        });

        // Add real-time validation for hourly rate (max 2 decimals)
        const hourlyRateInput = document.getElementById('hourlyRate');
        hourlyRateInput.addEventListener('input', function(e) {
            validateDecimalPlaces(e.target, 2);
        });
    }

    /**
     * Validate decimal places in input field
     */
    function validateDecimalPlaces(input, maxDecimals) {
        const value = input.value;
        if (value.includes('.')) {
            const parts = value.split('.');
            if (parts[1] && parts[1].length > maxDecimals) {
                input.value = parseFloat(value).toFixed(maxDecimals);
            }
        }
    }

    /**
     * Calculate overtime pay and display results
     */
    function calculateOvertime() {
        // Get input values
        const hourlyRate = parseFloat(document.getElementById('hourlyRate').value) || 0;
        const hoursWorked = parseFloat(document.getElementById('hoursWorked').value) || 0;
        const regularThreshold = parseFloat(document.getElementById('regularThreshold').value) || 40;
        const overtimeRate = parseFloat(document.getElementById('overtimeRate').value) || 1.5;

        // Validate inputs
        if (hourlyRate <= 0) {
            alert('Please enter a valid hourly rate greater than $0.');
            return;
        }

        if (hoursWorked <= 0) {
            alert('Please enter total hours worked greater than 0.');
            return;
        }

        if (regularThreshold <= 0) {
            alert('Please enter a valid regular hours threshold greater than 0.');
            return;
        }

        if (overtimeRate <= 0) {
            alert('Please enter a valid overtime multiplier greater than 0.');
            return;
        }

        // Calculate regular and overtime hours
        let regularHours = 0;
        let overtimeHours = 0;

        if (hoursWorked <= regularThreshold) {
            regularHours = hoursWorked;
            overtimeHours = 0;
        } else {
            regularHours = regularThreshold;
            overtimeHours = hoursWorked - regularThreshold;
        }

        // Calculate pay amounts
        const regularPay = regularHours * hourlyRate;
        const overtimePay = overtimeHours * hourlyRate * overtimeRate;
        const totalPay = regularPay + overtimePay;

        // Display results
        displayResults({
            regularHours: regularHours,
            overtimeHours: overtimeHours,
            regularPay: regularPay,
            overtimePay: overtimePay,
            totalPay: totalPay
        });
    }

    /**
     * Display calculation results
     */
    function displayResults(results) {
        const resultsGrid = document.getElementById('results');
        const ctaSection = document.getElementById('cta-section');

        // Update result values
        document.getElementById('regularHours').textContent = results.regularHours.toFixed(2);
        document.getElementById('overtimeHours').textContent = results.overtimeHours.toFixed(2);
        document.getElementById('regularPay').textContent = '$' + results.regularPay.toFixed(2);
        document.getElementById('overtimePay').textContent = '$' + results.overtimePay.toFixed(2);
        document.getElementById('totalPay').textContent = '$' + results.totalPay.toFixed(2);

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
        // Clear input fields
        document.getElementById('hourlyRate').value = '';
        document.getElementById('hoursWorked').value = '';
        document.getElementById('regularThreshold').value = '40';
        document.getElementById('overtimeRate').value = '1.5';

        // Hide results and CTA
        document.getElementById('results').style.display = 'none';
        document.getElementById('cta-section').style.display = 'none';

        // Reset result values
        document.getElementById('regularHours').textContent = '0';
        document.getElementById('overtimeHours').textContent = '0';
        document.getElementById('regularPay').textContent = '$0.00';
        document.getElementById('overtimePay').textContent = '$0.00';
        document.getElementById('totalPay').textContent = '$0.00';
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
