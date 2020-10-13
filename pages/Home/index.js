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
  const dd = e.target.dd.value;
  const mm = e.target.mm.value;
  const yy = e.target.yy.value;

  const buses = BUSES.filter(b => {
    if (b.source.toLowerCase() === source && b.destination.toLowerCase() === destination) {
      return b.dates.find(_b => _b.date === `${dd}/${mm}/${yy}`);
    } else {
      return false;
    }
  });

  if (buses.length > 0) {
    const res = buses.map((bus) => {
      const b = bus.dates.find(_b => _b.date === `${dd}/${mm}/${yy}`);

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
  const today = new Date();
  const days = Array.from({ length: 31 }).map((_v, i) => i+1);
  const months = Array.from({ length: 12 }).map((_v, i) => i+1);
  const years = [today.getFullYear(), today.getFullYear() + 1];
  const daysMap = {
    28: [2],
    29: [2],
    30: [4, 6, 9, 11],
    31: [1, 3, 5, 7, 8, 10, 12]
  };

  const $container = $('.search-box .value.date');
  const $dd = $('<select class="dd"type="text" name="dd" id="date-dd">');
  const $mm = $('<select class="mm"type="text" name="mm" id="date-mm">');
  const $yy = $('<select class="yy"type="text" name="yy" id="date-yy">');

  days.forEach(d => $dd.append(`<option>${d}</option>`));
  years.forEach(y => $yy.append(`<option>${y}</option>`));
  months.forEach(m => $mm.append(`<option>${m}</option>`));

  $mm.change((e) => {
    $dd.empty();

    for (let d in daysMap) {
      if (daysMap[d].includes(Number(e.target.value))) {
        const _days = Array.from({ length: d }).map((_v, i) => i+1);

        _days.forEach(d => $dd.append(`<option>${d}</option>`));

        return;
      }
    }
  });

  $container.append($yy);
  $container.append($mm);
  $container.append($dd);
}

const $slidesContainer = $('.slides');
let $slides;
let totalSlides = 0;
let currentSlide = 0;

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;

  showSlide();
}

function prevSlide() {
  currentSlide = ((currentSlide - 1) + totalSlides) % totalSlides;

  showSlide();
}

function showSlide() {
  $slides.removeClass('current');
  $slides.eq(currentSlide).addClass('current');
}

function initCarousel() {
  ET_API.getSlides().then(slides => {
    slides.forEach((sl) => {
      $slidesContainer.append($(`<div class="slide" style="background-color: ${sl.color}"></div>`))
    });

    $slides = $slidesContainer.find('.slide');
    totalSlides = $slides.length;
    showSlide();
    auto();
  });
}

function auto() {
  setInterval(nextSlide, 2000);
}

$('.search-box').submit(onSumbit);
createDateElement();

initCarousel();
$('.carousel-container .next').click(nextSlide);
$('.carousel-container .prev').click(prevSlide);
