document.addEventListener('DOMContentLoaded', function() {
  const workHoursContainer = document.querySelector('.work-hours');
  const workHoursHighlight = document.querySelector('.highlight');
  const regularShiftStartInput = document.getElementById('regular-start');
  const regularShiftEndInput = document.getElementById('regular-end');
  const scheduleForm = document.getElementById('schedule-form');
  const maxWorkHours = 18.5;
  let firstShiftStart = null; // Track the start time of the first shift entered
  let currentStartDate = null; // Track the start date of the current 24-hour period

  // Function to update work hours based on user input
  function updateWorkHours() {
    let totalWorkHours = 0;
    let shiftCount = 0;
    let consecutiveWarning = false;

    // Regular Shift Hours
    const regularStartTime = parseTime(regularShiftStartInput.value);
    const regularEndTime = parseTime(regularShiftEndInput.value);

    // Loop through each day's shift entry (1 to 31)
    for (let day = 1; day <= 31; day++) {
      const shiftEntry = document.getElementById(`shift-entry-${day}`);

      if (!shiftEntry) continue; // Skip if shift entry does not exist

      const shiftInput = shiftEntry.querySelector('.shift');
      const offShiftCheckbox = shiftEntry.querySelector('.off-shift');
      const regShiftCheckbox = shiftEntry.querySelector('.reg-shift');
      const startTimeInput = shiftEntry.querySelector('.start-time');
      const endTimeInput = shiftEntry.querySelector('.end-time');
      const totalHoursSpan = shiftEntry.querySelector('.total-hours');

      const shiftLabel = shiftInput.value.trim();
      const isOffShift = offShiftCheckbox.checked;
      const isRegShift = regShiftCheckbox.checked;
      let startTime = parseTime(startTimeInput.value);
      let endTime = parseTime(endTimeInput.value);

      // Handle Regular Shift auto-fill
      if (isRegShift && regularStartTime !== null && regularEndTime !== null) {
        startTime = regularStartTime;
        endTime = regularEndTime;
        startTimeInput.value = formatTime(startTime);
        endTimeInput.value = formatTime(endTime);
      }

      // Determine if the shift is within the current 24-hour period
      if (firstShiftStart === null) {
        firstShiftStart = startTime;
        currentStartDate = new Date(); // Set current start date to today initially
      }

      if (startTime !== null && endTime !== null && !isOffShift) {
        // Calculate work hours for the shift
        let workHours = calculateWorkHours(startTime, endTime);

        // Adjust start time if it's after midnight but before the end of the current 24-hour period
        if (startTime < firstShiftStart && startTime < endTime && shiftCount > 0) {
          startTime += 24;
        }

        // Check if the shift is within the current 24-hour period
        if (currentStartDate && startTime >= firstShiftStart) {
          // Update total work hours within the 24-hour period
          totalWorkHours += workHours;
          shiftCount++;

          // Display total hours worked for the shift
          totalHoursSpan.textContent = `${workHours.toFixed(2)} hrs`;

          // Check for consecutive shifts exceeding 18.5 hours
          if (shiftCount > 1 && totalWorkHours > maxWorkHours) {
            consecutiveWarning = true;
          }

          // Update current start date if shift ends past midnight
          if (endTime > 24) {
            currentStartDate.setDate(currentStartDate.getDate() + 1);
          }
        } else {
          // Reset total hours display if outside the current 24-hour period
          totalHoursSpan.textContent = '';
        }
      } else {
        // Reset total hours display and clear any warnings for off-shift entries
        totalHoursSpan.textContent = '';
      }

      // Highlight shifts in red if they exceed 18.5 hours in any 24-hour period
      if (totalWorkHours > maxWorkHours && !isOffShift) {
        shiftEntry.classList.add('exceeds-limit');
      } else {
        shiftEntry.classList.remove('exceeds-limit');
      }

      // Highlight shifts as dark grey if marked as off shift
      if (isOffShift) {
        shiftEntry.classList.add('off-shift-marked');
      } else {
        shiftEntry.classList.remove('off-shift-marked');
      }
    }

    // Update work hours highlight
    const highlightWidth = (totalWorkHours / 24) * 100; // Percentage of total 24-hour period
    workHoursHighlight.style.width = `${highlightWidth}%`;

    // Check for consecutive shifts warning
    if (consecutiveWarning) {
      alert('Warning: Consecutive shifts exceed 18.5 hours in any 24-hour period.');
    }
  }

  // Function to parse time input and convert to decimal hours
  function parseTime(timeString) {
    const parts = timeString.split(':');
    if (parts.length !== 2) return null;

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) return null;

    return hours + (minutes / 60);
  }

  // Function to format decimal hours as hh:mm
  function formatTime(decimalHours) {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // Function to calculate work hours between start and end times
  function calculateWorkHours(startTime, endTime) {
    let workHours = endTime - startTime;
    if (workHours < 0) workHours += 24; // Handle overnight shifts

    return workHours;
  }

  // Function to dynamically generate input fields for each day from 1 to 31
  function generateShiftEntries() {
    const shiftEntriesContainer = document.querySelector('.shift-entries');

    for (let day = 1; day <= 31; day++) {
      const shiftEntry = document.createElement('div');
      shiftEntry.id = `shift-entry-${day}`;
      shiftEntry.classList.add('shift-entry');
      shiftEntry.innerHTML = `
        <label for="shift-${day}">Shift:</label>
        <input type="text" id="shift-${day}" class="shift" maxlength="15">

        <label for="off-shift-${day}">Off Shift:</label>
        <input type="checkbox" id="off-shift-${day}" class="off-shift">

        <label for="reg-shift-${day}">Reg Shift:</label>
        <input type="checkbox" id="reg-shift-${day}" class="reg-shift">

        <label for="start-time-${day}">Start Time:</label>
        <input type="time" id="start-time-${day}" class="start-time" value="07:30">

        <label for="end-time-${day}">End Time:</label>
        <input type="time" id="end-time-${day}" class="end-time" value="17:00">

        <span class="total-hours"></span>
      `;
      shiftEntriesContainer.appendChild(shiftEntry);
    }
  }

  // Call function to generate shift entries on page load
  generateShiftEntries();

  // Attach event listeners
  const updateButton = document.getElementById('update-schedule');
  updateButton.addEventListener('click', function() {
    updateWorkHours();
  });

  const regShiftCheckboxes = document.querySelectorAll('.reg-shift');
  regShiftCheckboxes.forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
      const shiftEntry = checkbox.closest('.shift-entry');
      const startTimeInput = shiftEntry.querySelector('.start-time');
      const endTimeInput = shiftEntry.querySelector('.end-time');
      const isRegShift = checkbox.checked;

      if (isRegShift) {
        startTimeInput.value = regularShiftStartInput.value;
        endTimeInput.value = regularShiftEndInput.value;
      } else {
        startTimeInput.value = '07:30';
        endTimeInput.value = '17:00';
      }
    });
  });
});
