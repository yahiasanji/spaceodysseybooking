let accommodationsData = [];
let destinationsData = [];
let passengerCount = 1;
let maxPassengers = 1;

function setupAccommodationCardSelection() {
  const accommodationCards = document.querySelectorAll(".accommodation-card");
  const accommodationInput = document.getElementById("accommodation");

  accommodationCards.forEach((card) => {
    card.addEventListener("click", function () {
      accommodationCards.forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");
      accommodationInput.value = this.dataset.type;
      clearError("accommodation-error");
    });
  });
}

async function loadAccommodations() {
  try {
    const response = await fetch("accomodations.json");

    if (!response.ok) {
      throw new Error(`Failed to load accommodations: ${response.status}`);
    }

    const data = await response.json();
    accommodationsData = data.accommodations;

    console.log("Accommodations loaded:", accommodationsData);
  } catch (error) {
    console.error("Error loading accommodations:", error);
    alert("Unable to load accommodations. Please try again later.");
  }
}

async function loadDestinations() {
  try {
    const response = await fetch("destinations.json");

    if (!response.ok) {
      throw new Error(`Failed to load destinations: ${response.status}`);
    }

    const data = await response.json();
    destinationsData = data.destinations;

    const destinationSelect = document.getElementById("destination");

    while (destinationSelect.children.length > 1) {
      destinationSelect.removeChild(destinationSelect.lastChild);
    }

    destinationsData.forEach((dest) => {
      const option = document.createElement("option");
      option.value = dest.id;
      option.textContent = `${dest.name} - ${
        dest.travelDuration
      } - From $${dest.price.toLocaleString()}`;
      option.setAttribute("data-destination", JSON.stringify(dest));
      destinationSelect.appendChild(option);
    });

    destinationSelect.addEventListener("change", function () {
      const selectedOption = this.options[this.selectedIndex];
      const accommodationsSection = document.getElementById(
        "accommodations-section"
      );

      if (selectedOption.value) {
        const dest = JSON.parse(
          selectedOption.getAttribute("data-destination")
        );

        showAccommodationsForDestination(dest);
        accommodationsSection.classList.add("visible");

        updatePriceCalculation();
      } else {
        accommodationsSection.classList.remove("visible");
      }
    });
  } catch (error) {
    console.error("Error loading destinations:", error);

    const destinationSelect = document.getElementById("destination");
    const fallbackOption = document.createElement("option");
    fallbackOption.value = "";
    fallbackOption.textContent = "Unable to load destinations";
    fallbackOption.disabled = true;
    destinationSelect.appendChild(fallbackOption);

    alert("Unable to load destinations. Please try again later.");
  }
}

function showAccommodationsForDestination(destination) {
  const accommodationsContainer = document.getElementById(
    "accommodations-container"
  );
  const accommodationInput = document.getElementById("accommodation");

  accommodationsContainer.innerHTML = "";

  const availableAccommodationIds = destination.accommodations || [];

  const availableAccommodations = accommodationsData.filter((acc) =>
    availableAccommodationIds.includes(acc.id)
  );
  availableAccommodations.forEach((acc, index) => {
    const card = document.createElement("div");
    card.className = `accommodation-card ${index === 0 ? "selected" : ""}`;
    card.dataset.type = acc.id;

    card.innerHTML = `
    <h3 class="font-orbitron text-neon-blue mb-2">${acc.name}</h3>
    <p class="text-sm text-gray-400">${acc.shortDescription}</p>
    <div class="mt-3 text-xs text-gray-500">
      <div class="flex justify-between mb-1">
        <span>Size:</span>
        <span>${acc.size}</span>
      </div>
      <div class="flex justify-between mb-1">
        <span>Occupancy:</span>
        <span>${acc.occupancy}</span>
      </div>
      <div class="flex justify-between">
        <span>Price:</span>
        <span class="font-bold text-neon-cyan">$${acc.pricePerDay}/day</span>
      </div>
    </div>
  `;

    accommodationsContainer.appendChild(card);
  });

  if (availableAccommodations.length > 0) {
    accommodationInput.value = availableAccommodations[0].id;
  }

  setupAccommodationCardSelection();
}

const destinationSelect = document.getElementById("destination");
const selectedDestination =
  destinationSelect.options[destinationSelect.selectedIndex];
const destination = JSON.parse(
  selectedDestination.getAttribute("data-destination")
);

const accommodationId = document.getElementById("accommodation").value;
const accommodation = accommodationsData.find(
  (acc) => acc.id === accommodationId
);

// Get passenger type based on selection
function getPassengerType() {
  const selected = document.querySelector('input[name="passengers"]:checked');
  return selected ? selected.value : "solo";
}

// Update max passengers based on selection
function updateMaxPassengers() {
  const passengerType = getPassengerType();
  const addButton = document.getElementById("add-passenger-btn");

  // Store previous max passengers to detect changes
  const previousMaxPassengers = maxPassengers;

  switch (passengerType) {
    case "solo":
      maxPassengers = 1;
      break;
    case "couple":
      maxPassengers = 2;
      break;
    case "group":
      maxPassengers = 6;
      break;
  }

  // Only update passenger forms if max passengers actually changed
  if (previousMaxPassengers !== maxPassengers) {
    updatePassengerForms();
  }

  // Update button visibility
  updateAddPassengerButton();

  updatePriceCalculation();
}

// Update passenger forms based on current selection
function updatePassengerForms() {
  const passengerType = getPassengerType();
  const currentForms = document.querySelectorAll(".passenger-form").length;

  console.log(
    `Updating forms: type=${passengerType}, current=${currentForms}, max=${maxPassengers}`
  );

  // Use setTimeout to break the synchronous execution chain
  setTimeout(() => {
    if (passengerType === "solo") {
      // Remove all extra forms for solo
      while (passengerCount > 1) {
        removePassengerForm(passengerCount);
      }
    } else if (passengerType === "couple") {
      // For couple, ensure we have exactly 2 forms
      if (currentForms < 2) {
        // Add forms until we have 2
        while (passengerCount < 2) {
          addPassengerForm(false); // false means no delete button
        }
      } else if (currentForms > 2) {
        // Remove extra forms for couple
        while (passengerCount > 2) {
          removePassengerForm(passengerCount);
        }
      }

      // Ensure no delete buttons on couple forms
      const coupleForms = document.querySelectorAll(".passenger-form");
      coupleForms.forEach((form, index) => {
        const removeButton = form.querySelector(".remove-passenger");
        if (removeButton) {
          removeButton.remove();
        }
      });
    } else if (passengerType === "group") {
      // For group, ensure we have exactly 3 forms by default
      if (currentForms < 3) {
        // Add forms until we have 3
        while (passengerCount < 3) {
          addPassengerForm(false); // false means no delete button
        }
      } else if (currentForms > 3) {
        // Remove extra forms for group (only if more than max)
        while (passengerCount > maxPassengers) {
          removePassengerForm(passengerCount);
        }
      }

      // Ensure no delete buttons on the first 3 group forms
      const groupForms = document.querySelectorAll(".passenger-form");
      groupForms.forEach((form, index) => {
        if (index < 3) {
          const removeButton = form.querySelector(".remove-passenger");
          if (removeButton) {
            removeButton.remove();
          }
        }
      });
    }

    // Update button after forms are updated
    updateAddPassengerButton();
  }, 0);
}

// Separate function to update add passenger button
function updateAddPassengerButton() {
  const addButton = document.getElementById("add-passenger-btn");
  const passengerType = getPassengerType();

  if (!addButton) return;

  if (passengerType === "solo" || passengerType === "couple") {
    addButton.style.display = "none";
  } else {
    addButton.style.display = passengerCount < maxPassengers ? "block" : "none";
    addButton.textContent = `Add Passenger`;
  }
}

// Setup passenger radio listeners with debouncing
function setupPassengerRadioListeners() {
  const passengerRadios = document.querySelectorAll('input[name="passengers"]');
  let clickInProgress = false;

  passengerRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (clickInProgress) {
        console.log("Passenger change already in progress, skipping");
        return;
      }

      clickInProgress = true;

      try {
        updateMaxPassengers();
      } finally {
        // Reset flag after a short delay to prevent rapid successive clicks
        setTimeout(() => {
          clickInProgress = false;
        }, 500);
      }
    });
  });
}

// Add passenger form
document
  .getElementById("add-passenger-btn")
  .addEventListener("click", function () {
    if (passengerCount < maxPassengers) {
      addPassengerForm(true); // true means show delete button
      updatePriceCalculation(); // Update price when passenger is added
    }
  });

// Add passenger form with safety checks
function addPassengerForm(showDeleteButton = true) {
  if (passengerCount >= maxPassengers) {
    console.warn(`Cannot add passenger: ${passengerCount} >= ${maxPassengers}`);
    updateAddPassengerButton();
    return;
  }

  passengerCount++;

  const container = document.getElementById("passenger-forms-container");
  const newForm = document.createElement("div");
  newForm.className = "passenger-form";
  newForm.id = `passenger-form-${passengerCount}`;

  newForm.innerHTML = `
    <div class="passenger-header">
      <h3 class="font-orbitron text-neon-blue">Passenger ${passengerCount}</h3>
      ${
        passengerCount > 1 && showDeleteButton
          ? `<div class="remove-passenger" data-index="${passengerCount}">
        <i class="fas fa-times"></i>
      </div>`
          : ""
      }
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- First Name -->
      <div>
        <label class="block mb-2 text-gray-300">First Name</label>
        <input
          type="text"
          name="first-name[]"
          placeholder="Enter passenger first name"
          required
          data-validation="name"
        />
        <div class="error-message" data-error="first-name"></div>
      </div>

      <!-- Last Name -->
      <div>
        <label class="block mb-2 text-gray-300">Last Name</label>
        <input
          type="text"
          name="last-name[]"
          placeholder="Enter passenger last name"
          required
          data-validation="name"
        />
        <div class="error-message" data-error="last-name"></div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Email -->
      <div>
        <label class="block mb-2 text-gray-300">Email Address</label>
        <input
          type="email"
          name="email[]"
          placeholder="Enter passenger email"
          required
          data-validation="email"
        />
        <div class="error-message" data-error="email"></div>
      </div>

      <!-- Phone -->
      <div>
        <label class="block mb-2 text-gray-300">Phone Number</label>
        <input
          type="tel"
          name="phone[]"
          placeholder="Enter passenger phone number"
          required
          data-validation="phone"
        />
        <div class="error-message" data-error="phone"></div>
      </div>
    </div>

    <!-- Special Requirements -->
    <div class="mb-6">
      <label class="block mb-2 text-gray-300"
        >Special Requirements</label
      >
      <textarea
        class="pl-3 pt-1"
        name="special-requirements[]"
        rows="4"
        placeholder="Any special requirements or notes..."
      ></textarea>
    </div>
  `;

  container.appendChild(newForm);

  // Update button visibility
  updateAddPassengerButton();

  // Setup validation for new inputs
  setupInputValidation();

  // Add event listener for remove button if applicable
  const removeButton = newForm.querySelector(".remove-passenger");
  if (removeButton) {
    removeButton.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      removePassengerForm(index);
    });
  }

  console.log(`Added passenger form: ${passengerCount}`);
}

// Remove passenger form with safety checks
function removePassengerForm(index) {
  const formToRemove = document.getElementById(`passenger-form-${index}`);
  if (!formToRemove) {
    console.warn(`Form ${index} not found for removal`);
    return;
  }

  formToRemove.remove();
  passengerCount--;

  // Update button visibility
  updateAddPassengerButton();

  // Renumber remaining forms
  const passengerForms = document.querySelectorAll(".passenger-form");
  passengerForms.forEach((form, i) => {
    const newIndex = i + 1;
    form.id = `passenger-form-${newIndex}`;
    const header = form.querySelector(".passenger-header h3");
    if (header) {
      header.textContent = `Passenger ${newIndex}`;
    }

    const removeButton = form.querySelector(".remove-passenger");
    if (removeButton && newIndex > 1) {
      removeButton.setAttribute("data-index", newIndex);
    }
  });

  console.log(`Removed passenger form: ${index}, now ${passengerCount} forms`);
}

document.addEventListener("DOMContentLoaded", async function () {
  setupPassengerRadioListeners();

  updateMaxPassengers();

  await loadAccommodations();
  await loadDestinations();
});
