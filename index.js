const SITE_NAME = 'EasyTravel';
const NETWORK_DELAY = 3000;
const SECURE_ROUTES = [
  'dashboard',
  'reservations',
  'user'
];

// NOT IN THE SCOPE OF THIS APPLICATION ----
window.ET_API = window.ET_API || {
  createUser(user) {
    return new Promise((resolve, reject) => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      setTimeout(() => {
        if (users.length) {
          const existingUser = users.find(u => {
            return u.email === user.email || u.username === user.username;
          });

          if (existingUser) {
            reject({
              email: 'existingEmail',
              username: 'existingUsername',
            });
          } else {
            localStorage.setItem('users', JSON.stringify([...users, user]));
            resolve(user);
          }
        } else {
          localStorage.setItem('users', JSON.stringify([user]));
          resolve(user);
        }
      }, NETWORK_DELAY);
    });
  },

  login(user) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        const loggedInUser = users.find(u => u.username === user.username && u.password === user.password);

        if (loggedInUser) {
          localStorage.setItem('loggedIn', true);
          resolve(loggedInUser);
        } else {
          localStorage.setItem('loggedIn', false);
          reject({ error: 'Username and password combiation is wrong'});
        }
      }, NETWORK_DELAY);
    });
  },

  isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
  },

  getSlides(count = 5, dim = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const res = [];

        for (let i = 0; i < count; i++) {
          res.push({
            text: `This a #${i+1} slide.`,
            bg: (dim && dim.w) ? `url(https://loremflickr.com/${dim.w}/${dim.h}?${i})` : ET.getColor()
          });
        }

        resolve(res);
      }, NETWORK_DELAY);
    });
  },

  getMyBuses() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Buses for current user only
        const buses = JSON.parse(localStorage.getItem('buses') || '[]');

        resolve(buses);
      }, NETWORK_DELAY);
    });
  },

  searchBuses({ source, destination, journeyDate }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const buses = JSON.parse(localStorage.getItem('buses') || '[]').filter(b => (
          b.travelDate === journeyDate
          && b.busSource.toLowerCase() === source
          && b.busDestination.toLowerCase() === destination
        ));

        resolve(buses);
      }, NETWORK_DELAY);
    });
  },



  registerMyBus(newBus) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prevBuses = JSON.parse(localStorage.getItem('buses') || '[]');

        const seats = ET.range(1, Number(newBus.seats)).map(s => ({
          available: true,
          isWindow: s%4 === 0 || s%4 === 1,
          isFemaleOnly: false,
          nextSeat: s%2 !== 0 ? s+1 : s-1,
        }));

        const newBuses = [...prevBuses, {...newBus, seats }];

        localStorage.setItem('buses', JSON.stringify(newBuses));

        resolve(prevBuses);
      }, NETWORK_DELAY);
    });
  }
}
// NOT IN THE SCOPE OF THIS APPLICATION ----

window.ET = window.ET || {
  /**
   * Uitlity to get a Page `html` from a remote server.
   *
   * @param {string} page - name of a page
   * @param {function} cb - a callback function
   */
  fetchPage(page, cb) {
    $.get(`pages/${page}/index.html`)
      .then(resp => cb(null, resp))
      .catch(err => cb(err));
  },

  fetchComponent(component, cb) {
    $.get(`components/${component}/index.html`)
      .then(resp => cb(null, resp))
      .catch(err => cb(err));
  },

  /**
   * It takes a `hash` and makes a api request to a server to
   * get the page for a `hash` and on success it renders the
   * page in the `mountTo` element.
   *
   * @param {string} newHash - Route/Hash
   * @param {object} mountTo - jQuery object to mount the loaded page
   */
  mountPage(newHash, $mountTo) {
    ET.fetchPage(newHash, (err, page) => {
      if (err) {
        alert(err.message);
      } else {
        ET.renderPage(page, $mountTo);
      }
    });
  },

  /**
   * Takes a `html` and a jQuery element and adds given html to
   * given jQuery element.
   * @param {string} page - Page html to be rendered
   * @param {object} $mountTo - Container in which page to be rendered
   */
  renderPage(page, $mountTo) {
    $mountTo = $mountTo || $('.app-body');

    $mountTo.html(page);
  },

  createSiteNav() {
    const publicNavItems = [
      'Home',
      'Registration',
      'Login'
    ];
    const userNavItems = [
      'Home',
      'Dashboard',
      'Reservations',
      'User',
      'Log Out'
    ];

    ET.removeListeners();
    $('.nav-bar__container').empty();

    if (ET_API.isLoggedIn()) {
      userNavItems.forEach(item => {
        let $navItem;

        if (item === 'Log Out') {
          $navItem = $(`<span class="nav-bar__item light">${item}</span>`);
          $navItem.click(ET.handleLogOut);
        } else {
          $navItem = $(`<span class="nav-bar__item light" data-target-page="${item}">${item}</span>`);
        }

        $('.nav-bar__container').append($navItem);
      });
    } else {
      publicNavItems.forEach(item => {
        const $navItem = $(`<span class="nav-bar__item light" data-target-page="${item}">${item}</span>`);

        $('.nav-bar__container').append($navItem);
      });
    }

    // Add listeners
    ET.addListeners();
  },

  // Used to update the `hash` to mimic the route change
  navigateTo(hash) {
    location.hash = `#${hash}`;
  },

  handleNavigateTo(e) {
    e.stopPropagation();

    const targetPage = e.target.getAttribute('data-target-page');

    ET.hideMobileMenu();
    ET.navigateTo(targetPage);
  },

  handleLogOut(e) {
    e.stopPropagation();
    ET.hideMobileMenu();

    localStorage.setItem('loggedIn', false);
    localStorage.setItem('isAdmin', false);
    ET.navigateTo('home');
    ET.createSiteNav();
  },

  toggleMobileMenu() {
    ET.$ham.hasClass('open') ? ET.hideMobileMenu() : ET.showMobileMenu();
    ET.$ham.toggleClass('open');
  },

  showMobileMenu() {
    ET.$mobileNav.slideDown();
  },
  hideMobileMenu() {
    ET.$mobileNav.slideUp()
  },

  showSpinner() {
    ET.$appSpinner.addClass('show');
  },
  hideSpinner() {
    ET.$appSpinner.removeClass('show')
  },

  // Initialize required the event listeners
  addListeners() {
    $('[data-target-page]').on('click', ET.handleNavigateTo);
  },

  // Remove the event listeners
  removeListeners() {
    $('[data-target-page]').off('click', ET.handleNavigateTo);
  },

  // Utils
  getColor() {
    const r = parseInt(Math.random() * 255).toString(16);//10-default, 2, 8, 16
    const g = parseInt(Math.random() * 255).toString(16);
    const b = parseInt(Math.random() * 255).toString(16);

    return `#${r}${g}${b}`;
  },

  range(start, end, cb) {
    if (!end) {
      end = start;
      start = 0;
    }

    return Array.from({ length: (end - start) + 1 }).map((_v, i) => {
      if (cb) {
        return cb(start + i);
      } else {
        return start + i;
      }
    });
  },

  chunk(arr, size) {
    const ip = arr.slice(); // clone it;
    // const ip = [...arr]; // clone it;
    const res = [];

    while(ip.length) {
      res.push(ip.splice(0, size));
    }

    return res;
  },

  // -1, 0, 1
  compareDates(a, b) {
    const aDate = new Date(a.getFullYear(), a.getMonth(), a.getDate(), 0, 0, 0);
    const bDate = new Date(b.getFullYear(), b.getMonth(), b.getDate(), 0, 0, 0);

    if (aDate < bDate) {
      return -1;
    } else if (aDate > bDate) {
      return 1;
    }

    return 0;
  }
}

// Event handler for a `hashChange` event
function onHashChange() {
  const newHash = location.hash.substr(1).toLowerCase();

  if (ET_API.isLoggedIn() && newHash !== 'registration') {
    ET.mountPage(newHash);
  } else if (SECURE_ROUTES.includes(newHash.toLowerCase())) {
    ET.navigateTo('Home');
  } else {
    ET.mountPage(newHash);
  }
}

$(function() {
  ET.$ham = $('.hamburger');
  ET.$mobileNav = $('.nav-bar__mobile');
  ET.$appBody = $('.app-body');
  ET.$appSpinner = $('.app-spinner');

  ET.createSiteNav();

  // on app load check the `hash`
  const hash = location.hash.substr(1);
  if (hash.length > 0) {
    onHashChange();
  }

  ET.$ham.click(ET.toggleMobileMenu);

  // App Footer
  const $footer = $('.app-footer');
  $footer.text(`© ${(new Date()).getFullYear()} ${SITE_NAME}`);
});

window.addEventListener('hashchange', onHashChange);
