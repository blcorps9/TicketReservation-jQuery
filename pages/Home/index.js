(function () {
  // Reinitialize the listeners
  ET.removeListeners();
  ET.addListeners();

  function onSearchBusSumbit(e) {
    e.preventDefault();
    e.stopPropagation();

    const source = e.target.source.value.toLowerCase();
    const destination = e.target.destination.value.toLowerCase();
    const journeyDate = e.target.journeyDate.value;

    ET.showSpinner();
    ET_API.searchBuses({ source, destination, journeyDate }).then(buses => {
      ET.hideSpinner();
      if (buses.length > 0) {
        const res = buses.map((bus) => {
          return {
            id: bus.id,
            name: bus.busName,
            mode: bus.busMode,
            timings: bus.departure,
            seats: bus.seats.length,
            booked: bus.seats.filter(s => !s.available).length,
            bookings: bus.seats
          }
        });
        // [1][2] [3][4]
        // [5][6] [7][8]

        showSearchResults(res);
      }
    }).catch(err=> {
      console.log("err =-----> ", err);
      ET.hideSpinner();
    });
  }


  function showSearchResults(res) {
    const $container = $('.search-results');
    const $summary = $(`
      <div class="search-res-count">
        Total buses available on <strong>${$dateIp.attr('value')}</strong> are <strong>${res.length}</strong>.
      </div>
    `);

    $container.append($summary);

    const $head = $(`<div class="row">
        <span class="name">Bus Name</span>
        <span class="mode">AC/Non-AC</span>
        <span class="time">Timings</span>
        <span class="seats">Available seats</span>
      </div>`);
    $container.append($head);

    res.forEach(r => {
      const $row = $(`<div class="row">
        <span class="name">${r.name}</span>
        <span class="mode">${r.mode}</span>
        <span class="time">${r.timings}</span>
        <span class="seats">${r.seats - r.booked + "/" + r.seats}</span>
      </div>`);

      $row.click(() => onClickBus(r));

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

  function onClickBus(bus) {
    ET.showSpinner();
    ET.fetchComponent('CheckoutModal', (err, modal) => {
      ET.hideSpinner();
      if (err) {
        alert(err);
      } else if (modal) {
        renderModal(modal, bus);
      }
    });
  }

  function renderModal(modal, bus) {
    const $target = $('.modal-container');
    $target.attr('data-on-modal-sumbit', 'handleOnModalCheckout');
    $target.attr('data-on-modal-close', 'handleOnModalClose');
    $target.data(bus);

    ET.handleOnModalCheckout = (list, e) => {
      const booking = {
        busId: bus.id,
        passengers: list,
        userId: localStorage.getItem('currentUser')
      };

      localStorage.setItem('checkout',  JSON.stringify(booking));

      ET.navigateTo('checkout');
    }

    ET.handleOnModalClose = (list, e) => {
      $target.empty();
    }

    $target.append(modal);
  }

  // Handle form-submission
  $('.search-box').submit(onSearchBusSumbit);

  // Handle input click - show calendar
  const $dateIp = $('.search-box .journey-date input');
  $dateIp.focus(showCalendar);

  // Add carousel to page
  const $carousel = $('.home .carousel');
  // addCarousel($carousel);
})();
