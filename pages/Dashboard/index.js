(function() {
  const $dashboard = $('.page.dashboard');
  const $newBusSection = $('.add-bus-section');

  function onRegMyBus(e) {
    e.preventDefault();
    e.stopPropagation();

    const busInfo = {
      userId: localStorage.getItem('currentUser')
    };

    for (let i of e.target) {
      if (i.type !== 'submit') {
        busInfo[i.name] = i.value;
      }
    }

    ET.showSpinner();
    ET_API.registerMyBus(busInfo)
      .then(buses => {
        ET.hideSpinner();
        $newBusSection.hide();
        showBuses();
      })
      .catch(err=> {
        ET.hideSpinner();
      });
  }

  function genAddBusForm() {
    return $(`
      <section class="add-bus-section">
        <h3>New Bus Info</h3>
        <br>
        <br>
        <form class="new-bus-info">
          <label for="busName">Bus Name:</label>
          <input type="text" name="busName" id="busName">
          <br>
          <br>

          <label for="busNumber">Bus Number:</label>
          <input type="text" name="busNumber" id="busNumber">
          <br>
          <br>

          <label for="busSource">Bus Source:</label>
          <input type="text" name="busSource" id="busSource">
          <br>
          <br>

          <label for="busDestination">Bus Destination:</label>
          <input type="text" name="busDestination" id="busDestination">
          <br>
          <br>

          <label for="travelDate">Travel Date:</label>
          <input type="text" name="travelDate" id="travelDate">
          <br>
          <br>

          <label for="busMode">Bus Mode:</label>
          <input type="text" name="busMode" id="busMode">
          <br>
          <br>

          <label for="seats">Bus Seats:</label>
          <input type="text" name="seats" id="seats">
          <br>
          <br>
          <label for="price">Bus Seats Price:</label>
          <input type="text" name="price" id="price">
          <br>
          <br>

          <label for="departure">Departure Time:</label>
          <input type="text" name="departure" id="departure">
          <br>
          <br>

          <input type="submit" value="Register Bus" style="padding: 8px;">
        </form>
      </section>
    `);
  }

  function genHeader(isBus) {
    return $(`
      <section class="my-${isBus ? 'buses' : 'bookings'}">
        <h3>My ${isBus ? 'Buses' : 'Bookings'}</h3>
        <table class="${isBus ? 'bus' : 'booking'}-info-container">
          <tr class="${isBus ? 'bus' : 'booking'}-info">
            <td class="bus-name">Name</td>
            <td class="bus-number">Number</td>
            <td class="bus-source">Source</td>
            <td class="bus-destination">Destination</td>
            <td class="bus-travel-date">Travel Date</td>
            <td class="bus-departure">Departure</td>
            <td class="bus-mode">Mode</td>
            <td class="bus-seats">Seats</td>
          </tr>
        </table>
      </section>
    `);
  }

  function genBusRow(bus) {
    const available = bus.seats.filter(s => s.available).length;

    const $bus = $(`
      <tr class="bus-info">
        <td class="bus-name">${bus.busName}</td>
        <td class="bus-number">${bus.busNumber}</td>
        <td class="bus-source">${bus.busSource}</td>
        <td class="bus-destination">${bus.busDestination}</td>
        <td class="bus-travel-date">${bus.travelDate}</td>
        <td class="bus-departure">${bus.departure}</td>
        <td class="bus-mode">${bus.busMode}</td>
        <td class="bus-seats">${available}/${bus.seats.length}</td>
      </tr>
    `);

    return $bus;
  }

  function bookedTickets({ bus, bookings }) {
    $('.tickets-info-container').remove();

    const $ticketsContainer = $('<section class="tickets-info-container"></section>');
    const tickets = bookings.map(t => {
      return (`
        <tr>
          <td>${t.name}</td>
          <td>${t.phone}</td>
          <td>${t.gender}</td>
          <td>${t.seat}</td>
          <td>${t.age}</td>
        </tr>
      `);
    });

    const $table = $(`
      <table style="width: 100%;">
        <tbody>
          <tr></tr>
          <tr><td><strong>Bus Details</strong></td></tr>
          <tr>
            <td>Bus Name</td>
            <td>Bus Number</td>
            <td>Source</td>
            <td>Destination</td>
            <td>Date Time</td>
          </tr>
          <tr>
            <td>${bus.busName}</td>
            <td>${bus.busNumber}</td>
            <td>${bus.busSource}</td>
            <td>${bus.busDestination}</td>
            <td>${bus.travelDate} ${bus.departure}</td>
          </tr>
          <tr></tr>
          <tr><td><strong>Passenger Details</strong></td></tr>
          <tr></tr>
          <tr>
            <td>Name</td>
            <td>Phone</td>
            <td>Gender</td>
            <td>Seat</td>
            <td>Age</td>
          </tr>
          ${tickets.join('')}
        </tbody>
      </table>
    `);

    $ticketsContainer.append($table);

    return $ticketsContainer;
  }

  function showBookings() {
    $dashboard.empty();

    const user = { userId: localStorage.getItem('currentUser') };
    ET.showSpinner();
    ET_API.getMyBookings(user).then(bookings => {
      const $header = genHeader();
      const $infoContainer = $header.find('.booking-info-container');

      if (bookings) {
        bookings.forEach(({ bus, bookings }) => {
          const $bus = genBusRow(bus);
          $bus.data({ bus, bookings });

          $bus.click(showBookedSeats);

          $infoContainer.append($bus);
        });

      } else {
        $infoContainer.append($(`
          <tr class="booking-info"><td colspan="8">No bookings found</td></tr>
        `));
      }

      $dashboard.append($header);

      ET.hideSpinner();
    }).catch(err => {
      ET.hideSpinner();
    })
  }

  function showBuses() {
    $dashboard.empty();

    ET.showSpinner();
    ET_API.getMyBuses().then(buses => {
      ET.hideSpinner();

      // Add table header
      const $header = genHeader(true);
      const $infoContainer = $header.find('.bus-info-container');

      if (buses.length) {
        buses.forEach(bus => {
          const $bus = genBusRow(bus);

          $infoContainer.append($bus);
        });
      } else {
        $infoContainer.append($(`
          <tr class="booking-info"><td colspan="8">No buses found</td></tr>
        `));
      }

      $dashboard.append($header);
      const $addBusBtn = $(`
        <section class="add-bus-section">
          <button class="reg-bus-btn">Register New Bus</button>
        </section>
      `);
      $addBusBtn.click(() => {
        const $busFrom = genAddBusForm();
        $busFrom.find('.new-bus-info').submit(onRegMyBus);

        $dashboard.append($busFrom);
        $addBusBtn.hide();
      });

      $dashboard.append($addBusBtn);
    }).catch(err=> {
      ET.hideSpinner();
    });
  }

  function showBookedSeats(e) {
    e.preventDefault();
    e.stopPropagation();

    const $bus = $(e.currentTarget);

    const $bookedTickets = bookedTickets($bus.data());

    $dashboard.append($bookedTickets);
  }

  // Reinitialize the listeners
  ET.removeListeners();
  ET.addListeners();

  if (ET_API.isLoggedIn()) {
    if (localStorage.getItem('isAdmin') === 'true') {
      showBuses();
    } else {
      showBookings();
    }
  }
})();
