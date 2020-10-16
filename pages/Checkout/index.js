(function() {
  const checkoutData = JSON.parse(localStorage.getItem('checkout') || '{}');
  const $container = $('.page.checkout');

  if (checkoutData.busId) {
    ET.showSpinner();
    ET_API.getBus(checkoutData.busId).then(bus => {

      $container.append(genBusInfoSection(bus));
      $container.append(genPassengerInfoSection(checkoutData.passengers));
      $container.append(genPaymentSection(checkoutData.passengers));
      ET.hideSpinner();
    });
  }

  function genPassengerCard(passenger) {
    return (`
      <div class="passenger-card">
        <div class="row">
          <span class="label">Name:</span><span class="value">${passenger.name}</span>
        </div>
        <div class="row">
          <span class="label">Seat:</span><span class="value">${passenger.seat}</span>
        </div>
        <div class="row">
          <span class="label">Phone:</span><span class="value">${passenger.phone}</span>
        </div>
        <div class="row">
          <span class="label">Age:</span><span class="value">${passenger.age}</span>
        </div>
        <div class="row">
          <span class="label">Gender:</span><span class="value">${passenger.gender}</span>
        </div>
        <div class="row">
          <span class="label">Price:</span><span class="value">${ET.formatPrice(passenger.price)}</span>
        </div>
      </div>
    `);
  }

  function genPassengerInfoSection(passengers) {
    return $(`
      <section class="passengers-section">
        <h3>Passengers Info</h3>
        ${passengers.map(genPassengerCard).join('')}
      </section>
    `);
  }

  function genPaymentSection(passengers) {
    const totalPrice = passengers.reduce((acc, cur) => acc += +cur.price, 0);

    const $paymentSection = $(`
      <section class="payment-section">
        <form class="payment-form">
          <h3>Payment Info</h3>
          <div class="payment-card">
            <div class="row">
              <span>Total Price: </span><strong class="total-price">${ET.formatPrice(totalPrice)}</strong>
            </div>
            <div class="row">
              <span class="label">Card holder name:</span><input type="text" name="cardHolder" id="cardHolder">
            </div>
            <div class="row">
              <span class="label">Card Type:</span>
              <select name="cardType" id="cardType">
                <option value="visa">Visa</option>
                <option value="masterCard">Master Card</option>
                <option value="amex">American Express</option>
              </select>
            </div>
            <div class="row">
              <span class="label">Card Number:</span><input type="text" name="cardNumber" id="cardNumber">
            </div>
            <div class="row">
              <span class="label">Card Expiry:</span>
              <select name="cardExpiryMonth" id="cardExpiryMonth">
                <option value="jan">Jan</option>
                <option value="feb">Feb</option>
              </select>
              <select name="cardExpiryYear" id="cardExpiryYear">
                <option value="2020">2020</option>
                <option value="2021">2021</option>
              </select>
            </div>
            <div class="row">
              <span class="label">CVV:</span><input type="text" name="cardCVV" id="cardCVV" minlength="3" maxlength="4">
            </div>
          </div>

          <div class="payment-action">
            <input type="submit" class="pay-now-btn" value="Pay Now">
          </div>
        </form>
      </section>
    `);

    $paymentSection.find('.payment-form').submit((e) => {
      e.preventDefault();

      const formData = {};

      for (let field of e.target) {
        if (field.type !== 'submit') {
          formData[field.name] = field.value;
        }
      }

      ET.showSpinner();
      ET_API.checkout({...checkoutData, payment: formData })
        .then(res => {
          ET.hideSpinner();
          localStorage.removeItem('checkout');
          ET.navigateTo('home');
        })
        .catch(err => {
          ET.hideSpinner();
          ET.navigateTo('home');
        });
    });

    return $paymentSection;
  }

  function genBusInfoSection(bus) {
    return $(`
      <section class="bus-section">
        <h3>Bus Info</h3>
        <div class="row">
          <span class="label">Bus Name:</span><span class="value">${bus.busName}</span>
        </div>
        <div class="row">
          <span class="label">Bus Number:</span><span class="value">${bus.busNumber}</span>
        </div>
        <div class="row">
          <span class="label">Bus Source:</span><span class="value">${bus.busSource}</span>
        </div>
        <div class="row">
          <span class="label">Bus Destination:</span><span class="value">${bus.busDestination}</span>
        </div>
        <div class="row">
          <span class="label">Departure:</span><span class="value">${bus.travelDate} ${bus.departure}</span>
        </div>
      </section>
    `);
  }

  ET.removeListeners();
  ET.addListeners();
})();
