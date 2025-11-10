const form = document.forms.loginform;

const emailInput = form.elements["emailform"];
const passwdInput = form.elements["passwordform"];
const submitbutton = form.elements["submitbtn"];

function validatemail() {
  const EmailRegex = /^\S+@\S+\.\S+$/;
  const PasswordRegex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  if (
    EmailRegex.test(emailInput.value) &&
    PasswordRegex.test(passwdInput.value)
  ) {
    return true;
  } else {
    return false;
  }
}

function disablelogin() {
  if (JSON.parse(localStorage.getItem("isLoggedIn")) === true) {
    submitbutton.disabled = true;
    //tochange[0].innerText = "Logout";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  disablelogin();
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validatemail()) {
      localStorage.setItem("username", emailInput.value);
      localStorage.setItem("password", passwdInput.value);
      localStorage.setItem("isLoggedIn", true);
      location.reload();
    } else {
      console.log("error");
    }
  });
});
