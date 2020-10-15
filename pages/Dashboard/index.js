(function() {
  const $busesContainer = $('.bus-info-container');
  const $newBusSection = $('.add-bus-section');
  const $newBusForm = $('.new-bus-info');
  const $showAddBusBtn = $('.reg-bus-btn');

  function showBuses() {
    ET.showSpinner();
    ET_API.getMyBuses().then(buses => {
      $busesContainer.empty();
      ET.hideSpinner();

      if (buses.length) {
        // Add table header
        $busesContainer.append($(`
          <tr class="bus-info">
            <td class="bus-name">Name</td>
            <td class="bus-number">Number</td>
            <td class="bus-source">Source</td>
            <td class="bus-destination">Destination</td>
            <td class="bus-travel-date">Travel Date</td>
            <td class="bus-departure">Departure</td>
            <td class="bus-mode">Mode</td>
            <td class="bus-seats">Seats</td>
          </tr>
        `));

        buses.forEach(bus => {
          const booked = bus.seats.filter(s => s.available).length;
          const $bus = $(`
            <tr class="bus-info">
              <td class="bus-name">${bus.busName}</td>
              <td class="bus-number">${bus.busNumber}</td>
              <td class="bus-source">${bus.busSource}</td>
              <td class="bus-destination">${bus.busDestination}</td>
              <td class="bus-travel-date">${bus.travelDate}</td>
              <td class="bus-departure">${bus.departure}</td>
              <td class="bus-mode">${bus.busMode}</td>
              <td class="bus-seats">${booked}/${bus.seats.length}</td>
            </tr>
          `);

          $busesContainer.append($bus);
        });
      }
    }).catch(err=> {
      ET.hideSpinner();
      console.log("err =-----> ", err)
    });
  }

  // Reinitialize the listeners
  ET.removeListeners();
  ET.addListeners();
  $newBusSection.hide();
  $showAddBusBtn.click(() => {
    $newBusSection.show();
    $showAddBusBtn.hide();
  });

  $newBusForm.submit((e) => {
    e.preventDefault();
    e.stopPropagation();

    const busInfo = {};

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
        $showAddBusBtn.show();
        showBuses();
      })
      .catch(err=> {
        ET.hideSpinner();
        console.log("err =-----> ", err)
      });
  });

  showBuses();
})();
