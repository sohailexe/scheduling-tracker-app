const regularShiftStartInput = document.getElementById('regular-start');
const regularShiftEndInput = document.getElementById('regular-end');
const complianceHoursInput = document.getElementById('compliance-hours');
const changeHeaderBtn = document.getElementById('change-header-btn');
const addShiftBtn = document.getElementById('add-entry');
const removeEntryButton = document.getElementById('remove-entry');
const savePDFButton = document.getElementById('save-pdf');
const slider = document.getElementById('col-slider');
const sliderValue = document.getElementById('slider-value');

let totalHoures=0;



complianceHoursInput.addEventListener('change',function () {
  check();
});

slider.addEventListener('input', function() {
  sliderValue.textContent = this.value-1;
  totalHoures=0;
  let num=this.value;
  let i=1;
  const spans = document.querySelectorAll('.work-houres');
  spans.forEach(span => {
    if (i>=num) {
      return;
    }
    i++;

    let innerText=span.innerText;
    if (innerText!='') {
        let number = parseFloat(innerText.match(/[\d.]+/)[0]);
        totalHoures += Number(number);
        
        if(totalHoures<=0){
            document.querySelector(".total-houres").innerHTML=  "";
        }else{
            document.querySelector(".total-houres").innerHTML=  `${totalHoures.toFixed(1)} hrs`;
        }
    }
  });

 check();

});

function check(){
  if (totalHoures > complianceHoursInput.value) {
    slider.style.accentColor = 'red';
  } else {
    slider.style.accentColor = 'green';
  }
}

//changing header
changeHeaderBtn.addEventListener('click', function() {
  const headerTitleInput = document.getElementById('header-title-input');
  document.getElementById('header-title').innerText = headerTitleInput.value;
});

addShiftBtn.addEventListener('click', addShiftEntry);

removeEntryButton.addEventListener('click',  removeShiftEntry);

savePDFButton.addEventListener('click', function() {
  const element = document.querySelector('.schedule');
          html2pdf()
              .from(element)
              .save();
});


function addShiftEntry() {
  const day = document.querySelectorAll('.shift-entry').length + 1;
  //to append child
  const shiftEntriesContainer = document.querySelector('.shift-entries');
  const shiftEntry = document.createElement('div');
    shiftEntry.id = `shift-entry-${day}`;
    shiftEntry.classList.add('shift-entry');
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
    const isOffShift = shiftEntry.querySelector('.off-shift');

    // //selecting start and end time 
    const startTimeInput = shiftEntry.querySelector(`#start-time-${day}`);
    const endTimeInput = shiftEntry.querySelector(`#end-time-${day}`);
  
    function changeSpan(){
          let startTime = parseTime(startTimeInput.value);
          let endTime = parseTime(endTimeInput.value);
          let workHours = calculateWorkHours(startTime, endTime);
          shiftEntry.querySelector(`.work-houres-${day}`).innerText = workHours+ ' hrs';
    }


    startTimeInput.addEventListener('input', function(){
      changeSpan();
      
    });

    endTimeInput.addEventListener('input', function(){
      changeSpan()

    });

    isRegShift.addEventListener("change", function() {
      changeSpan()

    });

    isOffShift.addEventListener('change', function() {
     
        if (isOffShift.checked) {
            startTimeInput.disabled = true;
            endTimeInput.disabled = true;
            startTimeInput.value = '';
            endTimeInput.value = '';
    //       //if work hour span is not empty make it empty 
          let span=isOffShift.parentNode.querySelector("span");
          let spanText= span.innerText;
          if (spanText!='') {
              let number = parseFloat(spanText.match(/[\d.]+/)[0]);

              if (day<slider.value) {
                totalHoures-=number;
              }
              document.querySelector(".total-houres").innerHTML=  `${totalHoures.toFixed(1)} Hrs`;
          }
          span.innerText='';

        } else {
            startTimeInput.disabled = false;
            endTimeInput.disabled = false;
            startTimeInput.value = regularShiftStartInput.value;
            endTimeInput.value = regularShiftEndInput.value;
        }

      
      if(totalHoures<=0){
          document.querySelector(".total-houres").innerHTML=  "";
      }

    });
}


function removeShiftEntry() {
  const shiftEntriesContainer = document.querySelector('.shift-entries');
  const lastEntry = shiftEntriesContainer.lastElementChild;
  if (lastEntry) {
      let spanText =shiftEntriesContainer.lastChild.querySelector("span").innerText;
      shiftEntriesContainer.removeChild(lastEntry);
      let number = parseFloat(spanText.match(/[\d.]+/)[0]);

      if (day<slider.value) {
        totalHoures-=number;
      }
      document.querySelector(".total-houres").innerHTML=  `${totalHoures.toFixed(1)} Hrs`;

  }   
}

function calculateWorkHours(startTime, endTime) {
  const difference = Math.abs(endTime - startTime);
  return difference.toFixed(2);
}

function parseTime(timeString) {
  const parts = timeString.split(':');
  if (parts.length !== 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours + (minutes / 60);
}