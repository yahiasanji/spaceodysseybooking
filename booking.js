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
      updatePriceCalculation();
    });
  });
}

// Form validation functions
function validateName(name) {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function validatePhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

function validateDate(date) {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
}

// Show error message
function showError(input, message) {
  const errorElement = input.parentNode.querySelector(".error-message");
  errorElement.textContent = message;
  errorElement.style.display = "block";
  input.classList.add("input-error");
  input.classList.remove("input-success");
}

// Clear error message
function clearError(errorId) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }
}

// Show success state
function showSuccess(input) {
  const errorElement = input.parentNode.querySelector(".error-message");
  errorElement.style.display = "none";
  input.classList.remove("input-error");
  input.classList.add("input-success");
}

// Validate input on blur
function setupInputValidation() {
  const inputs = document.querySelectorAll("input[data-validation]");

  inputs.forEach((input) => {
    input.addEventListener("blur", function () {
      validateInput(this);
    });

    input.addEventListener("input", function () {
      // Clear error as user types
      if (this.value.trim() !== "") {
        const errorElement = this.parentNode.querySelector(".error-message");
        errorElement.style.display = "none";
        this.classList.remove("input-error");
      }
    });
  });
}

// Validate individual input
function validateInput(input) {
  const value = input.value.trim();
  const validationType = input.getAttribute("data-validation");

  if (value === "") {
    showError(input, "This field is required");
    return false;
  }

  let isValid = false;
  let errorMessage = "";

  switch (validationType) {
    case "name":
      isValid = validateName(value);
      errorMessage =
        "Please enter a valid name (2-50 characters, letters only)";
      break;
    case "email":
      isValid = validateEmail(value);
      errorMessage = "Please enter a valid email address";
      break;
    case "phone":
      isValid = validatePhone(value);
      errorMessage = "Please enter a valid phone number";
      break;
  }

  if (!isValid) {
    showError(input, errorMessage);
    return false;
  } else {
    showSuccess(input);
    return true;
  }
}

// Validate entire form
function validateForm() {
  let isValid = true;

  // Validate destination
  const destination = document.getElementById("destination");
  if (destination.value === "") {
    showError(destination, "Please select a destination");
    isValid = false;
  } else {
    clearError("destination-error");
  }

  // Validate departure date
  const departureDate = document.getElementById("departure-date");
  if (departureDate.value === "") {
    showError(departureDate, "Please select a departure date");
    isValid = false;
  } else if (!validateDate(departureDate.value)) {
    showError(departureDate, "Departure date must be today or in the future");
    isValid = false;
  } else {
    clearError("departure-date-error");
  }

  // Validate accommodation
  const accommodation = document.getElementById("accommodation");
  if (accommodation.value === "") {
    showError(accommodation, "Please select an accommodation type");
    isValid = false;
  } else {
    clearError("accommodation-error");
  }

  // Validate passenger forms
  const passengerForms = document.querySelectorAll(".passenger-form");
  passengerForms.forEach((form, index) => {
    const firstName = form.querySelector('input[name="first-name[]"]');
    const lastName = form.querySelector('input[name="last-name[]"]');
    const email = form.querySelector('input[name="email[]"]');
    const phone = form.querySelector('input[name="phone[]"]');

    if (!validateInput(firstName)) isValid = false;
    if (!validateInput(lastName)) isValid = false;
    if (!validateInput(email)) isValid = false;
    if (!validateInput(phone)) isValid = false;
  });

  return isValid;
}

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

  updatePriceCalculation();
  console.log(`Removed passenger form: ${index}, now ${passengerCount} forms`);
}

// Calculate and display total price
function updatePriceCalculation() {
  const totalPriceElement = document.getElementById("total-price");
  if (!totalPriceElement) return;

  // Get selected destination
  const destinationSelect = document.getElementById("destination");
  const selectedDestination =
    destinationSelect.options[destinationSelect.selectedIndex];

  if (!selectedDestination.value) {
    totalPriceElement.textContent = "$0";
    return;
  }

  const destinationData = JSON.parse(
    selectedDestination.getAttribute("data-destination")
  );

  // Get accommodation price
  const accommodationId = document.getElementById("accommodation").value;
  const accommodation = accommodationsData.find(
    (acc) => acc.id === accommodationId
  );

  if (!accommodation) {
    totalPriceElement.textContent = "$0";
    return;
  }

  // Calculate travel duration in days based on different time formats
  const travelDurationText = destinationData.travelDuration.toLowerCase();
  let travelDays = 0;

  // Handle different time formats
  if (travelDurationText.includes("-")) {
    // Handle ranges like "5-6 years"
    const rangeMatch = travelDurationText.match(
      /(\d+)\s*-\s*(\d+)\s*(day|month|year|days|months|years)/
    );
    if (rangeMatch) {
      const minValue = parseInt(rangeMatch[1]);
      const maxValue = parseInt(rangeMatch[2]);
      const unit = rangeMatch[3];
      // Use the larger value from the range
      travelDays = convertToDays(maxValue, unit);
    }
  } else {
    // Handle single values like "3 days", "5 months", "2 years"
    const singleMatch = travelDurationText.match(
      /(\d+)\s*(day|month|year|days|months|years)/
    );
    if (singleMatch) {
      const value = parseInt(singleMatch[1]);
      const unit = singleMatch[2];
      travelDays = convertToDays(value, unit);
    }
  }

  // Get number of passengers
  const passengerCount = document.querySelectorAll(".passenger-form").length;

  // Calculate total price: destination price + (travel days * 2 * accommodation price * passenger count)
  const destinationPrice = destinationData.price || 0;
  const accommodationPrice = accommodation.pricePerDay || 0;

  const totalPrice =
    destinationPrice + travelDays * 2 * accommodationPrice * passengerCount;

  // Update display
  totalPriceElement.textContent = `$${totalPrice.toLocaleString()} USD`;
}

// Helper function to convert different time units to days
function convertToDays(value, unit) {
  const normalizedUnit = unit.toLowerCase().replace(/s$/, ""); // Remove trailing 's'

  switch (normalizedUnit) {
    case "day":
      return value;
    case "month":
      return value * 30; // Approximate month as 30 days
    case "year":
      return value * 365; // Approximate year as 365 days
    default:
      return value; // Default to days if unknown unit
  }
}

// Load accommodations from JSON
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

// Load destinations from JSON
async function loadDestinations() {
  try {
    const response = await fetch("destinations.json");

    if (!response.ok) {
      throw new Error(`Failed to load destinations: ${response.status}`);
    }

    const data = await response.json();
    destinationsData = data.destinations;

    const destinationSelect = document.getElementById("destination");

    // Clear existing options except the first one
    while (destinationSelect.children.length > 1) {
      destinationSelect.removeChild(destinationSelect.lastChild);
    }

    // Add destinations from JSON
    destinationsData.forEach((dest) => {
      const option = document.createElement("option");
      option.value = dest.id;
      option.textContent = `${dest.name} - ${
        dest.travelDuration
      } - From $${dest.price.toLocaleString()}`;
      option.setAttribute("data-destination", JSON.stringify(dest));
      destinationSelect.appendChild(option);
    });

    // Add event listener to show destination info when selected
    destinationSelect.addEventListener("change", function () {
      const selectedOption = this.options[this.selectedIndex];
      const accommodationsSection = document.getElementById(
        "accommodations-section"
      );

      if (selectedOption.value) {
        const dest = JSON.parse(
          selectedOption.getAttribute("data-destination")
        );

        // Show and populate accommodations for this destination
        showAccommodationsForDestination(dest);
        accommodationsSection.classList.add("visible");

        updatePriceCalculation(); // Update price when destination changes
      } else {
        // Hide the destination info and accommodations
        destinationInfo.classList.add("hidden");
        accommodationsSection.classList.remove("visible");
        updatePriceCalculation(); // Update price when destination is cleared
      }
    });
  } catch (error) {
    console.error("Error loading destinations:", error);

    // Fallback: You can add some default options here if the fetch fails
    const destinationSelect = document.getElementById("destination");
    const fallbackOption = document.createElement("option");
    fallbackOption.value = "";
    fallbackOption.textContent = "Unable to load destinations";
    fallbackOption.disabled = true;
    destinationSelect.appendChild(fallbackOption);

    // Show error message to user
    alert("Unable to load destinations. Please try again later.");
  }
}

// Show accommodations for selected destination
function showAccommodationsForDestination(destination) {
  const accommodationsContainer = document.getElementById(
    "accommodations-container"
  );
  const accommodationInput = document.getElementById("accommodation");

  // Clear existing accommodation cards
  accommodationsContainer.innerHTML = "";

  // Get available accommodation IDs for this destination
  const availableAccommodationIds = destination.accommodations || [];

  // Filter accommodations to show only those available at this destination
  const availableAccommodations = accommodationsData.filter((acc) =>
    availableAccommodationIds.includes(acc.id)
  );

  // Create accommodation cards
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

  // Set the first accommodation as selected by default
  if (availableAccommodations.length > 0) {
    accommodationInput.value = availableAccommodations[0].id;
  }

  // Set up event listeners for the new accommodation cards
  setupAccommodationCardSelection();
  updatePriceCalculation(); // Update price when accommodations are loaded
}

// NEW: Save booking to localStorage
function saveBookingToLocalStorage(bookingData) {
  try {
    // Get current user
    if (JSON.parse(localStorage.getItem("isLoggedIn")) === true) {
      const currentUser = localStorage.username;
    } else {
      console.error("No user logged in");
      return false;
    }

    // Generate unique booking ID
    const bookingId =
      "BK-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);

    // Get selected destination details
    const destinationSelect = document.getElementById("destination");
    const selectedDestination =
      destinationSelect.options[destinationSelect.selectedIndex];
    const destination = JSON.parse(
      selectedDestination.getAttribute("data-destination")
    );

    // Get selected accommodation details
    const accommodationId = document.getElementById("accommodation").value;
    const accommodation = accommodationsData.find(
      (acc) => acc.id === accommodationId
    );

    // Get total price
    const totalPrice = document.getElementById("total-price").textContent;
    const numericPrice = parseFloat(totalPrice.replace(/[^\d.]/g, ""));

    // Create complete booking object
    const completeBooking = {
      bookingId: bookingId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      bookingDate: new Date().toISOString(),
      status: "confirmed",
      destination: {
        id: destination.id,
        name: destination.name,
        description: destination.description,
        travelDuration: destination.travelDuration,
        distance: destination.distance,
        gravity: destination.gravity,
        temperature: destination.temperature,
        price: destination.price,
      },
      departureDate: bookingData.departureDate,
      accommodation: {
        id: accommodation.id,
        name: accommodation.name,
        shortDescription: accommodation.shortDescription,
        size: accommodation.size,
        occupancy: accommodation.occupancy,
        pricePerDay: accommodation.pricePerDay,
        price: accommodation.pricePerDay, // For backward compatibility
      },
      passengers: bookingData.passengerForms.map((passenger) => ({
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        email: passenger.email,
        phone: passenger.phone,
        specialRequirements: passenger.specialRequirements,
      })),
      totalPrice: numericPrice,
      passengerType: bookingData.passengers,
    };

    // Get existing bookings from localStorage
    const existingBookings = JSON.parse(
      localStorage.getItem("spaceBookings") || "[]"
    );

    // Add new booking
    existingBookings.push(completeBooking);

    // Save back to localStorage
    localStorage.setItem("spaceBookings", JSON.stringify(existingBookings));

    console.log("Booking saved successfully:", completeBooking);
    return bookingId;
  } catch (error) {
    console.error("Error saving booking to localStorage:", error);
    return false;
  }
}

// Function to show booking confirmation popup
function showBookingConfirmation(bookingData, reservationId) {
  // Create popup overlay
  const popupOverlay = document.createElement("div");
  popupOverlay.className =
    "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto";
  popupOverlay.id = "confirmation-popup";

  // Get destination details
  const destinationSelect = document.getElementById("destination");
  const selectedDestination =
    destinationSelect.options[destinationSelect.selectedIndex];
  const destination = JSON.parse(
    selectedDestination.getAttribute("data-destination")
  );

  // Get accommodation details
  const accommodationId = document.getElementById("accommodation").value;
  const accommodation = accommodationsData.find(
    (acc) => acc.id === accommodationId
  );

  // Get total price
  const totalPrice = document.getElementById("total-price").textContent;

  // Create popup content with fixed height and scrollable content
  popupOverlay.innerHTML = `
    <div class="form-container max-w-2xl w-full mx-auto transform scale-95 animate-scaleIn my-8 max-h-[90vh] flex flex-col p-6">
      <div class="text-center mb-6 flex-shrink-0">
        <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-neon-cyan rounded-full flex items-center justify-center mx-auto mb-4 glow">
          <i class="fas fa-check text-white text-2xl"></i>
        </div>
        <h2 class="font-orbitron text-3xl text-neon-cyan mb-2 text-glow">Booking Confirmed!</h2>
        <p class="text-gray-300">Your space journey has been successfully booked</p>
      </div>
      
      <div class="flex-1 overflow-y-auto space-y-4">
        <div class="bg-space-dark/60 rounded-xl p-6 border border-neon-blue/30">
          <h3 class="font-orbitron text-xl text-neon-blue mb-4">Booking Details</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-gray-400 text-sm">Reservation ID</p>
              <p class="font-bold text-white">#${reservationId}</p>
            </div>
            <div>
              <p class="text-gray-400 text-sm">Booking Date</p>
              <p class="font-bold text-white">${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-neon-blue/20">
              <span class="text-gray-300">Destination</span>
              <span class="font-orbitron text-neon-cyan">${
                destination.name
              }</span>
            </div>
            
            <div class="flex justify-between items-center py-2 border-b border-neon-blue/20">
              <span class="text-gray-300">Departure Date</span>
              <span class="font-bold text-white">${new Date(
                bookingData.departureDate
              ).toLocaleDateString()}</span>
            </div>
            
            <div class="flex justify-between items-center py-2 border-b border-neon-blue/20">
              <span class="text-gray-300">Travel Duration</span>
              <span class="font-bold text-white">${
                destination.travelDuration
              }</span>
            </div>
            
            <div class="flex justify-between items-center py-2 border-b border-neon-blue/20">
              <span class="text-gray-300">Accommodation</span>
              <span class="font-bold text-white">${accommodation.name}</span>
            </div>
            
            <div class="flex justify-between items-center py-2 border-b border-neon-blue/20">
              <span class="text-gray-300">Passengers</span>
              <span class="font-bold text-white">${
                bookingData.passengerForms.length
              }</span>
            </div>
            
            <div class="flex justify-between items-center py-2">
              <span class="text-gray-300 text-lg">Total Amount</span>
              <span class="font-orbitron text-neon-cyan text-xl">${totalPrice}</span>
            </div>
          </div>
        </div>
        
        <div class="bg-space-dark/60 rounded-xl p-6 border border-neon-blue/30">
          <h3 class="font-orbitron text-xl text-neon-blue mb-4">Passenger Information</h3>
          <div class="space-y-3 max-h-40 overflow-y-auto">
            ${bookingData.passengerForms
              .map(
                (passenger, index) => `
              <div class="bg-space-dark/40 p-3 rounded-lg">
                <h4 class="font-orbitron text-neon-cyan text-sm mb-1">Passenger ${
                  index + 1
                }</h4>
                <p class="text-white text-sm">${passenger.firstName} ${
                  passenger.lastName
                }</p>
                <p class="text-gray-400 text-xs">${passenger.email} • ${
                  passenger.phone
                }</p>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
      
      <div class="flex flex-col md:flex-row gap-4 mt-4 flex-shrink-0">
        <button 
          id="download-pdf-btn"
          class="btn-primary text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 flex-1"
        >
          <i class="fas fa-download"></i>
          Download Confirmation
        </button>
        <button 
          id="close-popup-btn"
          class="btn-secondary text-white px-6 py-3 rounded-lg font-bold flex-1"
        >
          Close
        </button>
      </div>
    </div>
  `;

  // Add CSS animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    .animate-scaleIn {
      animation: scaleIn 0.3s ease-out forwards;
    }
    #confirmation-popup {
      overflow-y: auto;
    }
  `;
  document.head.appendChild(style);

  // Add popup to page
  document.body.appendChild(popupOverlay);

  // Setup event listeners
  document
    .getElementById("download-pdf-btn")
    .addEventListener("click", function () {
      downloadBookingConfirmation(
        bookingData,
        destination,
        accommodation,
        reservationId,
        totalPrice
      );
    });

  document
    .getElementById("close-popup-btn")
    .addEventListener("click", function () {
      document.body.removeChild(popupOverlay);
      document.head.removeChild(style);
    });

  // Close popup when clicking outside
  popupOverlay.addEventListener("click", function (e) {
    if (e.target === popupOverlay) {
      document.body.removeChild(popupOverlay);
      document.head.removeChild(style);
    }
  });
}

// Function to download booking confirmation as PDF
function downloadBookingConfirmation(
  bookingData,
  destination,
  accommodation,
  reservationId,
  totalPrice
) {
  // Create a printable version of the confirmation with the same theme
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SpaceVoyager Booking Confirmation</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600&display=swap');
        
        body {
          font-family: 'Exo 2', sans-serif;
          background: linear-gradient(to bottom, #0a0a18, #1a1a2e, #16213e);
          color: white;
          padding: 15px;
          margin: 0;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }
        
        body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(
              circle at 10% 20%,
              rgba(14, 165, 233, 0.1) 0%,
              transparent 20%
            ),
            radial-gradient(
              circle at 90% 60%,
              rgba(139, 92, 246, 0.1) 0%,
              transparent 20%
            ),
            radial-gradient(
              circle at 40% 80%,
              rgba(6, 182, 212, 0.1) 0%,
              transparent 20%
            );
          z-index: -1;
        }
        
        .confirmation-container {
          max-width: 800px;
          margin: 0 auto;
          background: rgba(22, 33, 62, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 25px;
          border: 1px solid rgba(14, 165, 233, 0.3);
          box-shadow: 0 0 30px rgba(14, 165, 233, 0.2);
          position: relative;
          z-index: 1;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid rgba(14, 165, 233, 0.3);
        }
        
        .logo {
          font-family: 'Orbitron', sans-serif;
          font-size: 26px;
          font-weight: bold;
          background: linear-gradient(45deg, #0ea5e9, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
          text-shadow: 0 0 10px rgba(14, 165, 233, 0.5);
        }
        
        .title {
          color: #06b6d4;
          font-size: 22px;
          margin-bottom: 6px;
          font-family: 'Orbitron', sans-serif;
          text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
        
        .reservation-info {
          display: flex;
          justify-content: center;
          gap: 25px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        
        .reservation-item {
          text-align: center;
        }
        
        .reservation-label {
          color: #9ca3af;
          font-size: 12px;
          margin-bottom: 3px;
        }
        
        .reservation-value {
          color: white;
          font-weight: bold;
          font-family: 'Orbitron', sans-serif;
          font-size: 14px;
        }
        
        .journey-section {
          background: rgba(10, 10, 24, 0.6);
          border-radius: 10px;
          border: 1px solid rgba(14, 165, 233, 0.3);
          padding: 18px;
          margin-bottom: 15px;
        }
        
        .section-title {
          color: #0ea5e9;
          font-size: 16px;
          margin-bottom: 12px;
          border-bottom: 1px solid #0ea5e9;
          padding-bottom: 5px;
          font-family: 'Orbitron', sans-serif;
          text-shadow: 0 0 8px rgba(14, 165, 233, 0.3);
        }
        
        .journey-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .detail-item {
          margin-bottom: 8px;
        }
        
        .label {
          color: #9ca3af;
          font-size: 12px;
          margin-bottom: 3px;
        }
        
        .value {
          color: white;
          font-weight: bold;
          font-size: 13px;
        }
        
        .neon-cyan {
          color: #06b6d4;
          text-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
        }
        
        .neon-blue {
          color: #0ea5e9;
          text-shadow: 0 0 8px rgba(14, 165, 233, 0.5);
        }
        
        .passenger-section {
          background: rgba(10, 10, 24, 0.6);
          border-radius: 10px;
          border: 1px solid rgba(14, 165, 233, 0.3);
          padding: 18px;
          margin-bottom: 15px;
        }
        
        .passenger-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin-top: 10px;
        }
        
        .passenger-item {
          background: rgba(14, 165, 233, 0.1);
          padding: 12px;
          border-radius: 6px;
          border: 1px solid rgba(14, 165, 233, 0.2);
          font-size: 12px;
        }
        
        .passenger-header {
          font-family: 'Orbitron', sans-serif;
          color: #06b6d4;
          margin-bottom: 5px;
          font-size: 13px;
        }
        
        .passenger-details {
          color: #e5e7eb;
          margin-bottom: 3px;
        }
        
        .passenger-contact {
          color: #9ca3af;
          font-size: 11px;
        }
        
        .total-price-section {
          text-align: center;
          margin: 20px 0;
          padding: 20px;
          background: rgba(10, 10, 24, 0.7);
          border-radius: 10px;
          border: 2px solid rgba(6, 182, 212, 0.4);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
        }
        
        .total-price {
          font-size: 28px;
          color: #06b6d4;
          font-weight: bold;
          font-family: 'Orbitron', sans-serif;
          text-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
          margin: 8px 0;
        }
        
        .total-label {
          color: #9ca3af;
          font-size: 16px;
          margin-bottom: 8px;
        }
        
        .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid rgba(14, 165, 233, 0.3);
          color: #9ca3af;
          font-size: 12px;
        }
        
        .contact-info {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 10px 0;
          flex-wrap: wrap;
        }
        
        .contact-item {
          text-align: center;
          font-size: 11px;
        }
        
        .special-requirements {
          font-style: italic;
          color: #cbd5e1;
          margin-top: 5px;
          font-size: 11px;
        }
        
        @media print {
          body {
            background: linear-gradient(to bottom, #0a0a18, #1a1a2e, #16213e) !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            padding: 10px;
          }
          
          .confirmation-container {
            box-shadow: none;
            border: 2px solid #0ea5e9;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="confirmation-container">
        <div class="header">
          <div class="logo">SpaceVoyager</div>
          <div class="title">Booking Confirmation</div>
          <div class="reservation-info">
            <div class="reservation-item">
              <div class="reservation-label">Reservation ID</div>
              <div class="reservation-value neon-cyan">#${reservationId}</div>
            </div>
            <div class="reservation-item">
              <div class="reservation-label">Booking Date</div>
              <div class="reservation-value">${new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
        
        <div class="journey-section">
          <div class="section-title">Journey Details</div>
          <div class="journey-grid">
            <div class="detail-item">
              <div class="label">Destination</div>
              <div class="value neon-cyan">${destination.name}</div>
            </div>
            <div class="detail-item">
              <div class="label">Departure Date</div>
              <div class="value">${new Date(
                bookingData.departureDate
              ).toLocaleDateString()}</div>
            </div>
            <div class="detail-item">
              <div class="label">Travel Duration</div>
              <div class="value">${destination.travelDuration}</div>
            </div>
            <div class="detail-item">
              <div class="label">Distance</div>
              <div class="value">${destination.distance}</div>
            </div>
            <div class="detail-item">
              <div class="label">Gravity</div>
              <div class="value">${destination.gravity}</div>
            </div>
            <div class="detail-item">
              <div class="label">Temperature</div>
              <div class="value">${destination.temperature}</div>
            </div>
            <div class="detail-item">
              <div class="label">Accommodation</div>
              <div class="value neon-blue">${accommodation.name}</div>
            </div>
            <div class="detail-item">
              <div class="label">Accommodation Size</div>
              <div class="value">${accommodation.size}</div>
            </div>
            <div class="detail-item">
              <div class="label">Number of Passengers</div>
              <div class="value neon-cyan">${
                bookingData.passengerForms.length
              }</div>
            </div>
          </div>
        </div>
        
        <div class="passenger-section">
          <div class="section-title">Passenger Information</div>
          <div class="passenger-list">
            ${bookingData.passengerForms
              .map(
                (passenger, index) => `
              <div class="passenger-item">
                <div class="passenger-header">Passenger ${index + 1}</div>
                <div class="passenger-details">
                  <strong>${passenger.firstName} ${passenger.lastName}</strong>
                </div>
                <div class="passenger-contact">
                  📧 ${passenger.email}<br>
                  📞 ${passenger.phone}
                </div>
                ${
                  passenger.specialRequirements
                    ? `
                <div class="special-requirements">
                  <strong>Notes:</strong> ${passenger.specialRequirements}
                </div>
                `
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        
        <div class="total-price-section">
          <div class="total-label">Total Amount</div>
          <div class="total-price">${totalPrice}</div>
          <div style="color: #9ca3af; font-size: 12px; margin-top: 5px;">
            Includes destination fee + accommodation for all passengers
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing SpaceVoyager for your interstellar journey!</p>
          <div class="contact-info">
            <div class="contact-item">
              <strong>Email:</strong> info@spacevoyager.com
            </div>
            <div class="contact-item">
              <strong>Phone:</strong> +1 (800) SPACE-TRIP
            </div>
          </div>
          <p style="margin-top: 15px; font-size: 11px;">© 2023 SpaceVoyager. All rights reserved.</p>
          <p style="font-size: 10px; margin-top: 8px; opacity: 0.7;">
            This is your official booking confirmation. Please keep this document for your records.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  printWindow.document.write(printContent);
  printWindow.document.close();

  // Wait for content to load then print
  printWindow.onload = function () {
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  };
}

// NEW: Updated form submission handler
document
  .getElementById("booking-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check if user is logged in
    if (JSON.parse(localStorage.getItem("isLoggedIn")) === false) {
      // Save form data as pending booking
      const formData = {
        destination: document.getElementById("destination").value,
        departureDate: document.getElementById("departure-date").value,
        passengers: document.querySelector('input[name="passengers"]:checked')
          .value,
        accommodation: document.getElementById("accommodation").value,
        passengerForms: [],
      };

      // Save ALL passenger form data
      const passengerForms = document.querySelectorAll(".passenger-form");
      passengerForms.forEach((form, index) => {
        const passengerData = {
          firstName: form.querySelector('input[name="first-name[]"]').value,
          lastName: form.querySelector('input[name="last-name[]"]').value,
          email: form.querySelector('input[name="email[]"]').value,
          phone: form.querySelector('input[name="phone[]"]').value,
          specialRequirements: form.querySelector(
            'textarea[name="special-requirements[]"]'
          ).value,
        };
        formData.passengerForms.push(passengerData);
      });

      // Save pending booking to localStorage
      localStorage.setItem("pendingBooking", JSON.stringify(formData));

      // Redirect to login page
      window.location.href = "login.html";
      return;
    }

    // User is logged in, proceed with booking
    const formData = {
      destination: document.getElementById("destination").value,
      departureDate: document.getElementById("departure-date").value,
      passengers: document.querySelector('input[name="passengers"]:checked')
        .value,
      accommodation: document.getElementById("accommodation").value,
      passengerForms: [],
    };

    // Save passenger form data
    const passengerForms = document.querySelectorAll(".passenger-form");
    passengerForms.forEach((form, index) => {
      const passengerData = {
        firstName: form.querySelector('input[name="first-name[]"]').value,
        lastName: form.querySelector('input[name="last-name[]"]').value,
        email: form.querySelector('input[name="email[]"]').value,
        phone: form.querySelector('input[name="phone[]"]').value,
        specialRequirements: form.querySelector(
          'textarea[name="special-requirements[]"]'
        ).value,
      };
      formData.passengerForms.push(passengerData);
    });

    // NEW: Save booking to localStorage instead of old system
    const bookingId = saveBookingToLocalStorage(formData);

    if (bookingId) {
      // Clear pending booking
      localStorage.removeItem("pendingBooking");

      // Show confirmation popup
      showBookingConfirmation(formData, bookingId);

      // Reset form after successful booking
      setTimeout(() => {
        document.getElementById("booking-form").reset();
        document.getElementById("total-price").textContent = "$0";
        document.getElementById("destination-info").classList.add("hidden");
        document
          .getElementById("accommodations-section")
          .classList.remove("visible");

        // Reset passenger forms to just primary passenger
        const passengerFormsContainer = document.getElementById(
          "passenger-forms-container"
        );
        const primaryForm =
          passengerFormsContainer.querySelector("#passenger-form-0");
        passengerFormsContainer.innerHTML = "";
        passengerFormsContainer.appendChild(primaryForm);
        passengerCount = 1;
        updateAddPassengerButton();
      }, 2000);
    } else {
      alert("There was an error processing your booking. Please try again.");
    }
  });

// Add this function to check for pending booking when page loads
function checkPendingBooking() {
  const pendingBooking = localStorage.getItem("pendingBooking");
  const currentUser = getCurrentUser();

  if (pendingBooking && currentUser) {
    // User just logged in with a pending booking
    const bookingData = JSON.parse(pendingBooking);

    // Auto-fill the form with pending booking data
    document.getElementById("destination").value = bookingData.destination;
    document.getElementById("departure-date").value = bookingData.departureDate;

    // Trigger change event to load accommodations
    document.getElementById("destination").dispatchEvent(new Event("change"));

    // Set passenger type
    const passengerRadio = document.querySelector(
      `input[name="passengers"][value="${bookingData.passengers}"]`
    );
    if (passengerRadio) {
      passengerRadio.checked = true;
      updateMaxPassengers();
    }

    // Restore passenger forms after a delay
    setTimeout(() => {
      if (bookingData.accommodation) {
        document.getElementById("accommodation").value =
          bookingData.accommodation;
        const accommodationCard = document.querySelector(
          `.accommodation-card[data-type="${bookingData.accommodation}"]`
        );
        if (accommodationCard) {
          document
            .querySelectorAll(".accommodation-card")
            .forEach((card) => card.classList.remove("selected"));
          accommodationCard.classList.add("selected");
        }
      }

      // Restore ALL passenger forms
      if (bookingData.passengerForms && bookingData.passengerForms.length > 0) {
        // Remove all existing passenger forms
        const existingForms = document.querySelectorAll(".passenger-form");
        existingForms.forEach((form) => form.remove());
        passengerCount = 0;

        // Add forms for all passengers in the pending booking
        bookingData.passengerForms.forEach((passengerData, index) => {
          if (index < maxPassengers) {
            // For couple and group, don't show delete buttons on default forms
            const showDeleteButton =
              bookingData.passengers === "group" && index >= 3;

            addPassengerForm(showDeleteButton);
            const passengerForm = document.getElementById(
              `passenger-form-${index + 1}`
            );

            if (passengerForm && passengerData) {
              passengerForm.querySelector('input[name="first-name[]"]').value =
                passengerData.firstName || "";
              passengerForm.querySelector('input[name="last-name[]"]').value =
                passengerData.lastName || "";
              passengerForm.querySelector('input[name="email[]"]').value =
                passengerData.email || "";
              passengerForm.querySelector('input[name="phone[]"]').value =
                passengerData.phone || "";
              passengerForm.querySelector(
                'textarea[name="special-requirements[]"]'
              ).value = passengerData.specialRequirements || "";
            }
          }
        });
      }

      updatePriceCalculation(); // Update price after restoring pending booking
    }, 1000);

    // Show notification about pending booking
    showPendingBookingNotification();

    // Clear the pending booking after restoring it
    localStorage.removeItem("pendingBooking");
  }
}

// Function to show pending booking notification
function showPendingBookingNotification() {
  const notification = document.createElement("div");
  notification.className =
    "fixed top-4 right-4 bg-neon-blue text-white px-6 py-3 rounded-lg shadow-lg z-50";
  notification.innerHTML = `
    <div class="flex items-center">
        <i class="fas fa-info-circle mr-2"></i>
        <span>We found your pending booking. Your form has been auto-filled.</span>
    </div>
`;
  document.body.appendChild(notification);

  // Remove notification after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Update your existing DOMContentLoaded event listener in booking page
document.addEventListener("DOMContentLoaded", async function () {
  createStars();

  // Use the new setup function for passenger radios
  setupPassengerRadioListeners();

  // Initialize max passengers
  updateMaxPassengers();

  // Setup input validation
  setupInputValidation();

  // Load both accommodations and destinations
  await loadAccommodations();
  await loadDestinations();

  // Check for pending booking (only for login redirect scenario)
  checkPendingBooking();
});
