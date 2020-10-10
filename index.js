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
