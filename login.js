const form = document.forms.loginform;
let missions = [];
const emailInput = form.elements["emailform"];
const passwdInput = form.elements["passwordform"];
const submitbutton = form.elements["submitbtn"];
let users = [];
fetch("users.json")
  .then((res) => res.json())
  .then((data) => {
    users = data;
  });

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
    alert(
      "Enter a correct email and a password of length 8 or more characters"
    );
    return false;
  }
}

function checkemail() {
  return users.some(
    (user) =>
      emailInput.value === user.username && passwdInput.value === user.password
  );
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
    if (validatemail() && checkemail()) {
      localStorage.setItem("username", emailInput.value);
      localStorage.setItem("password", passwdInput.value);
      localStorage.setItem("isLoggedIn", true);
      location.reload();
    } else {
      alert("Incorrect Email or Password");
    }
  });
});
