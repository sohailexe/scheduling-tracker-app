const regularShiftStartInput = document.getElementById("regular-start");
const regularShiftEndInput = document.getElementById("regular-end");
const complianceHoursInput = document.getElementById("compliance-hours");
const changeHeaderBtn = document.getElementById("change-header-btn");
const addShiftBtn = document.getElementById("add-entry");
const removeEntryButton = document.getElementById("remove-entry");
const savePDFButton = document.getElementById("save-pdf");

const range = document.querySelector(".input-range");
const selected_entries_input = document.querySelector(
  ".selected_entries_input"
);



let totalHoures = 0;
selected_entries_input.addEventListener("change", function () {

  // const input_value= selected_entries_input.value;
  // const spans = document.querySelectorAll(".work-houres");
  // const max=spans.length -input_value;
  // console.log("pre max",range.max);
  // console.log("calculated max",max);
  // if (max<=1) {
  //   range.max = 1;
  // }else{
  //   range.max=max;
  // }
  // console.log("assigned max",range.max);




  // innerHeightIncrease();
  rangeHandler();
});
range.addEventListener("change", function () {
  rangeHandler();
});

complianceHoursInput.addEventListener("change", function () {
  check();
});

//changing header
changeHeaderBtn.addEventListener("click", function () {
  const headerTitleInput = document.getElementById("header-title-input");
  document.getElementById("header-title").innerText = headerTitleInput.value;
});

addShiftBtn.addEventListener("click", addShiftEntry);

removeEntryButton.addEventListener("click", removeShiftEntry);

savePDFButton.addEventListener("click", function () {
  const element = document.querySelector(".schedule");
  html2pdf().from(element).save();
});

function addShiftEntry() {
  const day = document.querySelectorAll(".shift-entry").length + 1;
  //to append child
  const shiftEntriesContainer = document.querySelector(".shift-entries");
  const shiftEntry = document.createElement("div");
  shiftEntry.id = `shift-entry-${day}`;
  shiftEntry.classList.add("shift-entry");
  shiftEntry.innerHTML = `
        <label for="shift-${day}">Shift:</label>
        <input type="text" id="shift-${day}" class="shift" maxlength="50">
        <label for="off-shift-${day}">Off Shift:</label>
        <input type="checkbox" id="off-shift-${day}" class="off-shift">
        <label for="reg-shift-${day}">Reg Shift:</label>
        <input type="checkbox" id="reg-shift-${day}" class="reg-shift">
        <label for="start-time-${day}">Start Time:</label>
        <input type="time" id="start-time-${day}" class="start-time" value="${regularShiftStartInput.value}">
        <label for="end-time-${day}">End Time:</label>
        <input type="time" id="end-time-${day}" class="end-time" value="${regularShiftEndInput.value}">
        <span class="work-houres-${day} work-houres"></span>
    `;
  shiftEntriesContainer.appendChild(shiftEntry);

  const isRegShift = shiftEntry.querySelector(`.reg-shift`);
  const isOffShift = shiftEntry.querySelector(".off-shift");

  // //selecting start and end time
  const startTimeInput = shiftEntry.querySelector(`#start-time-${day}`);
  const endTimeInput = shiftEntry.querySelector(`#end-time-${day}`);

  function changeSpan() {
    let startTime = parseTime(startTimeInput.value);
    let endTime = parseTime(endTimeInput.value);
    let workHours = calculateWorkHours(startTime, endTime);
    shiftEntry.querySelector(`.work-houres-${day}`).innerText =
      workHours + " hrs";
    rangeHandler();
  }

  startTimeInput.addEventListener("input", function () {
    changeSpan();
  });

  endTimeInput.addEventListener("input", function () {
    changeSpan();
  });

  isRegShift.addEventListener("change", function () {
    changeSpan();
  });

  isOffShift.addEventListener("change", function () {
    if (isOffShift.checked) {
      startTimeInput.disabled = true;
      endTimeInput.disabled = true;
      startTimeInput.value = "";
      endTimeInput.value = "";
      //       //if work hour span is not empty make it empty
      let span = isOffShift.parentNode.querySelector("span");
      let spanText = span.innerText;
      if (spanText != "") {
        let number = parseFloat(spanText.match(/[\d.]+/)[0]);

        if (day <= range.value) {
          totalHoures -= number;
        }
        document.querySelector(
          ".total__hour"
        ).innerHTML = `${totalHoures.toFixed(1)} Hrs`;
      }
      span.innerText = "";
    } else {
      startTimeInput.disabled = false;
      endTimeInput.disabled = false;
      startTimeInput.value = regularShiftStartInput.value;
      endTimeInput.value = regularShiftEndInput.value;
    }

    if (totalHoures <= 0) {
      document.querySelector(".total__hour").innerHTML = "";
    }
  });

  check();
  range.max = parseInt(range.max) + 1;

  rangeHandler();
}

function removeShiftEntry() {
  const day = document.querySelectorAll(".shift-entry").length;
  const shiftEntriesContainer = document.querySelector(".shift-entries");
  const lastEntry = shiftEntriesContainer.lastElementChild;
  if (lastEntry) {
    let spanText =
      shiftEntriesContainer.lastChild.querySelector("span").innerText;
    shiftEntriesContainer.removeChild(lastEntry);
    let number;
    if (spanText) {
      number = parseFloat(spanText.match(/[\d.]+/)[0]);
  
    }else{
      number=0
    }

    if (day < range.value) {
      totalHoures -= number;
    }
    document.querySelector(".total__hour").innerHTML = `${totalHoures.toFixed(
      1
    )} Hrs`;
  }

  if (range.max > 0) {
    range.max = parseInt(range.max) - 1;
  }
  rangeHandler();
}

function calculateWorkHours(startTime, endTime) {
  const difference = Math.abs(endTime - startTime);
  return difference.toFixed(2);
}

function parseTime(timeString) {
  const parts = timeString.split(":");
  if (parts.length !== 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours + minutes / 60;
}

function check() {
  const style = document.createElement("style");
  style.type = "text/css";

  // Add CSS rules for the pseudo-element
  let css = "";

  style.append;

  if (totalHoures > complianceHoursInput.value) {
    css = `
      .input-range::-webkit-slider-thumb{
          background: red;
      }
    `;
  } else {
    css = `
      .input-range::-webkit-slider-thumb{
          background: green;
      }
    `;
  }
  style.appendChild(document.createTextNode(css));

  document.head.appendChild(style);

  if (totalHoures <= 0) {
    document.querySelector(".total__hour").innerHTML = "";
  } else {
    document.querySelector(".total__hour").innerHTML = `${totalHoures.toFixed(
      1
    )} hrs`;
  }
}

function changeHoures() {
  if (totalHoures <= 0) {
    document.querySelector(".total__hour").innerHTML = "";
  } else {
    document.querySelector(".total__hour").innerHTML = `${totalHoures.toFixed(
      1
    )} hrs`;
  }
}
function rangeHandler() {
  totalHoures = 0;
  let selectd_entries = parseInt(selected_entries_input.value);
  let range_input = parseInt(range.value);

  let threshHosld = 0;
  if (range_input > selectd_entries) {
    threshHosld = range_input - selectd_entries;
  }

  let i = 1;
  const spans = document.querySelectorAll(".work-houres");

  spans.forEach((span) => {
    if (i > range_input) {
      return;
    }

    if (i <= threshHosld) {
      // do nothing
    } else {
      // calculate houres
      let innerText = span.innerText;
      if (innerText != "") {
        let number = parseFloat(innerText.match(/[\d.]+/)[0]);
        totalHoures += Number(number);

        if (totalHoures <= 0) {
          document.querySelector(".total__hour").innerHTML = "";
        } else {
          document.querySelector(
            ".total__hour"
          ).innerHTML = `${totalHoures.toFixed(1)} hrs`;
        }
      }
    }
    i++;
  });

  if (totalHoures <= 0) {
    document.querySelector(".total__hour").innerHTML = "";
  }
  check();
}

function innerHeightIncrease() {
  const input_value = selected_entries_input.value;
  let height = 23;

  if (input_value <= range.max) {
    // Create a new style element
    const style = document.createElement("style");
    style.type = "text/css";

    // Add CSS rules for the pseudo-element
    let css = `
  .input-range::-webkit-slider-thumb {
    height: ${height * input_value}px;
    }
    `;

    style.appendChild(document.createTextNode(css));

    document.head.appendChild(style);
  }
}
