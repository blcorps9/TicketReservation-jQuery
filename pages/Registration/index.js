const ERRORS = {
  invalidPassword: 'Please enter a valid password.',
  invalidEmail: 'Please enter a valid email',
  invalidUsername: 'Username is not a valid. Specical char, upper, number is required.',
  invalidFirstname: 'Please provide valid firstname.',

  passAndConfirmShouldMatch: 'Password and Confirm password should match.',

  existingEmail: 'That email is already taken.',
  existingUsername: 'That username is not available.'
};

function isEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return re.test(String(email).toLowerCase());
}

function isValidUsername(name) {
  name = String(name);

  if (!name.match(/[\$@#!&*%]/)) {
    return false;
  } else if (!name.match(/[A-Z]/)) {
    return false;
  } else if (!name.match(/[a-z]/)) {
    return false;
  } else if (!name.match(/[0-9]/)) {
    return false;
  }

  return true;
}

function renderErrors(formElm, errors) {
  const $errElm = $('<span class="error"></span>');
  const $formElm = $(formElm);

  for (const elm in errors) {
    const $errField = $formElm.find(`[name=${elm}]`);
    const $fieldErr = $errElm.clone();

    $fieldErr.text(ERRORS[elm]);

    $fieldErr.insertAfter($errField);
  }
}

function removeErrors(e) {
  const $formElm = $(e.target).closest('form');

  $formElm.children().filter('.error').remove();
}

function onSubmit(e) {
  e.stopPropagation();
  e.preventDefault();

  removeErrors(e);

  const formData = {};
  const errors = {};
  let hasError = false;

  for (let i of e.target) {
    if (i.type !== 'submit') {
      formData[i.name] = i.value;
    }
  }

  if (formData.password.length === 0) {
    errors.password = 'invalidPassword';
    hasError = true;
  } else if (formData.password !== formData['confirm-password']) {
    errors['confirm-password'] = 'passAndConfirmShouldMatch';
    hasError = true;
  }

  if (!isEmail(formData.email)) {
    errors.email = 'invalidEmail';
    hasError = true;
  }

  if (!isValidUsername(formData.username)) {
    errors.username = 'invalidUsername';
    hasError = true;
  }

  if (formData.firstname.length < 2) {
    errors.firstname = 'invalidFirstname'
    hasError = true;
  }

  // users
  if (hasError) {
    renderErrors(e.target, errors);
  } else {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    if (users.length) {
      const existingUser = users.find(u => {
        return u.email === formData.email || u.username === formData.username;
      });

      if (existingUser) {
        renderErrors(e.target, {
          email: 'existingEmail',
          username: 'existingUsername',
        });
      } else {
        localStorage.setItem('users', JSON.stringify([...users, formData]));
        window.navigateTo && window.navigateTo('Dashboard');
      }
    } else {
      localStorage.setItem('users', JSON.stringify([formData]));
      window.navigateTo && window.navigateTo('Dashboard');
    }
  }
}

// Add event listeners
$('[data-reset-error]').keydown(removeErrors);
$('form.user-registration').submit(onSubmit);