let spaceData = [];

let state = {
  destination: null,
  package: null,
  passengers: 1,
  accommodation: null,
  extras: [],
  passengerDetails: [],
  totalPrice: 0,
  isLoggedIn: false,
};

const bookingForm = document.getElementById("booking-form");
const destinationSelect = document.getElementById("destination");
const packageSelect = document.getElementById("package");
const departureDateInput = document.getElementById("departure-date");
const passengerOptions = document.querySelectorAll(".passenger-option");
const dynamicFields = document.getElementById("dynamic-fields");
const suitSizeField = document.getElementById("suit-size-field");
const accommodationOptions = document.getElementById("accommodation-options");
const passengersContainer = document.getElementById("passengers-container");
const addPassengerBtn = document.getElementById("add-passenger");
const extrasContainer = document.getElementById("extras-container");
const basePriceEl = document.getElementById("base-price");
const packagePriceEl = document.getElementById("package-price");
const accommodationPriceEl = document.getElementById("accommodation-price");
const extrasPriceEl = document.getElementById("extras-price");
const totalPriceEl = document.getElementById("total-price");
const loginModal = document.getElementById("login-modal");
const loginBtn = document.getElementById("login-btn");
const guestBtn = document.getElementById("guest-btn");

function populateDestinations() {
  spaceData.destinations.forEach((dest) => {
    const option = document.createElement("option");
    option.value = dest.id;
    option.textContent = dest.name;
    option.className = "bg-space-blue";
    destinationSelect.appendChild(option);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("destinations.json")
    .then((res) => res.json())
    .then((data) => {
      spaceData = data;
      populateDestinations();
    });

  document
    .querySelector('.passenger-option[data-value="1"]')
    .classList.add("selected");
});
