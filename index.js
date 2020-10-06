const SITE_NAME = 'EasyTravel';

/**
 * Uitlity to get a Page `html` from a remote server.
 *
 * @param {string} page - name of a page
 * @param {function} cb - a callback function
 */
function fetchPage(page, cb) {
  $.get(`pages/${page}/index.html`)
    .then(resp => cb(null, resp))
    .catch(err => cb(err));
}

/**
 * Takes a `html` and a jQuery element and adds given html to
 * given jQuery element.
 * @param {string} page - Page html to be rendered
 * @param {object} $mountTo - Container in which page to be rendered
 */
function renderPage(page, $mountTo) {
  $mountTo = $mountTo || $('.app-body');

  $mountTo.html(page);
}

// Event handler for a `hashChange` event
function onHashChange() {
  const newHash = location.hash.substr(1);

  mountPage(newHash);
}

/**
 * It takes a `hash` and makes a api request to a server to
 * get the page for a `hash` and on success it renders the
 * page in the `mountTo` element.
 *
 * @param {string} newHash - Route/Hash
 * @param {object} mountTo - jQuery object to mount the loaded page
 */
function mountPage(newHash, $mountTo) {
  fetchPage(newHash, (err, page) => {
    if (err) {
      alert(err.message);
    } else {
      renderPage(page, $mountTo);
    }
  });
}

// Used to update the `hash` to mimic the route change
function navigateTo(hash) {
  location.hash = `#${hash}`;
}

// Initialize required the event listeners
function initListeners() {
  window.addEventListener('hashchange', onHashChange);
}

// Remove the event listeners
function removeListeners() {
  window.removeEventListener('hashchange', onHashChange);
}

$(function() {
  // Add listeners
  initListeners();

  const $ham = $('.hamburger');
  const $mobileNav = $('.nav-bar__mobile');
  const $appBody = $('.app-body');

  // on app load check the `hash`
  const hash = location.hash.substr(1);
  if (hash.length > 0) {
    mountPage(hash, $appBody);
  }

  // Load target page on click of this
  const $navItem = $('.nav-bar__item');
  $navItem.click(e => {
    e.stopPropagation();

    const targetPage = e.target.getAttribute('data-target-page');

    navigateTo(targetPage);
  });

  $ham.click(() => {
    // Toggle manu bar
    $ham.hasClass('open') ? $mobileNav.slideUp() : $mobileNav.slideDown();
    $ham.toggleClass('open');
  });

  // App Footer
  const $footer = $('.app-footer');
  $footer.text(`© ${(new Date()).getFullYear()} ${SITE_NAME}`);
});
