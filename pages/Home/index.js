// Reinitialize the listeners
ET.removeListeners();
ET.addListeners();

const BUSES = [
  {
    name: 'Bangalore-Mysore',
    source: 'Bangalore',
    destination: 'Mysore',
    mode: 'AC',
    dates: [{
      date: '1/1/2020',
      seats: 30,
      booked: 2,
      timings: '11:30'
    }, {
      date: '11/11/2020',
      seats: 60,
      booked: 12,
      timings: '10:30'
    }, {
      date: '12/11/2020',
      seats: 60,
      booked: 12,
      timings: '10:30'
    }, {
      date: '13/11/2020',
      seats: 60,
      booked: 12,
      timings: '10:30'
    }],
  },
  {
    name: 'Mysore-Bangalore',
    source: 'Mysore',
    destination: 'Bangalore',
    mode: 'Non-AC',
    dates: [{
      date: '10/11/2020',
      seats: 60,
      booked: 12,
      timings: '10:30'
    }, {
      date: '11/11/2020',
      seats: 60,
      booked: 12,
      timings: '10:30'
    }, {
      date: '12/11/2020',
      seats: 60,
      booked: 12,
      timings: '10:30'
    }, {
      date: '13/11/2020',
      seats: 60,
      booked: 12,
      timings: '10:30'
    }],
  }
]

function onSumbit(e) {
  e.preventDefault();
  e.stopPropagation();

  const source = e.target.source.value.toLowerCase();
  const destination = e.target.destination.value.toLowerCase();
  const journeyDate = e.target.journeyDate.value;

  const buses = BUSES.filter(b => {
    if (b.source.toLowerCase() === source && b.destination.toLowerCase() === destination) {
      return b.dates.find(_b => _b.date === journeyDate);
    } else {
      return false;
    }
  });

  if (buses.length > 0) {
    const res = buses.map((bus) => {
      const b = bus.dates.find(_b => _b.date === journeyDate);

      return {
        name: bus.name,
        mode: bus.mode,
        timings: b.timings,
        seats: b.seats,
        booked: b.booked
      }
    });

    showSearchResults(res);
  }
}


function showSearchResults(res) {
  const $container = $('.search-results');
  const $summary = $(`<div class="search-res-count">Total buses available on Date are ${res.length}.</div>`);

  $container.append($summary);
  const $head = $(`<div class="row">
      <span class="name">Bus Name</span>
      <span class="mode">AC/Non-AC</span>
      <span class="time">Timings</span>
      <span class="seats">Available seats</span>
    </div>`);
  $container.append($head);
  res.forEach(r => {
    const $row = `<div class="row">
      <span class="name">${r.name}</span>
      <span class="mode">${r.mode}</span>
      <span class="time">${r.timings}</span>
      <span class="seats">${r.seats - r.booked + "/" + r.seats}</span>
    </div>`;

    $container.append($row);
  });
}

function createDateElement() {
  const $container = $('.search-box .journey-date');

  addCalendar($container);
}

function showCalendar(e) {
  const $calendar = $('.search-box .journey-date .calender-container');

  if ($calendar.length) {
    $calendar.show();
  } else {
    createDateElement();
  }
}

function onDateSelect(selectedDate) {
  const yy = selectedDate.getFullYear();
  const mm = selectedDate.getMonth();
  const dd = selectedDate.getDate();

  $dateIp.attr('value', `${dd}/${mm + 1}/${yy}`);
  $('.search-box .journey-date .calender-container').hide();
}

function addCalendar($target) {
  ET.showSpinner();
  ET.fetchComponent('Calendar', (err, calender) => {
    ET.hideSpinner();
    if (err) {
      alert(err);
    } else if (calender) {
      // Needed to get the selected date from the calendar component
      ET.onSelectDay = onDateSelect;
      $target.append($(calender));
    }
  });
}

function addCarousel($target) {
  ET.showSpinner();
  ET.fetchComponent('Carousel', (err, caro) => {
    ET.hideSpinner();
    if (err) {
      alert(err);
    } else if (caro) {
      $target.append($(caro));
    }
  });
}

// Handle form-submission
$('.search-box').submit(onSumbit);

// Handle input click - show calendar
const $dateIp = $('.search-box .journey-date input');
$dateIp.focus(showCalendar);

// Add carousel to page
const $carousel = $('.home .carousel');
addCarousel($carousel);
