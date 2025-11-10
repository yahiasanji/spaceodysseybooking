loginelements = document.getElementsByTagName("a");
const tochange = Array.from(loginelements).filter((el) =>
  el.innerText.includes("Login")
);
document.addEventListener("DOMContentLoaded", () => {
  if (JSON.parse(localStorage.getItem("isLoggedIn")) === true) {
    tochange[0].innerText = "Logout";
    tochange[0].addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.setItem("isLoggedIn", false);
      location.reload();
    });
  }
});
