// Reinitialize the listeners
ET.removeListeners();
ET.addListeners()

function onLogInSubmit(e) {
  e.stopPropagation();
  e.preventDefault();

  const formData = {};

  for (let i of e.target) {
    if (i.type !== 'submit') {
      formData[i.name] = i.value;
    }
  }

  ET.showSpinner();
  ET_API.login(formData).then((logged) => {
    ET.navigateTo('home');
    ET.createSiteNav();
    ET.hideSpinner();
  }).catch((err) => {
    ET.createSiteNav();
    ET.hideSpinner();
  });
}

$('form.user-login').submit(onLogInSubmit);
