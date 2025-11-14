// Global variables to store data
let accommodationsData = [];
let destinationsData = [];
let passengerCount = 1; // Start with 1 (primary passenger)
let maxPassengers = 1; // Will be set based on selection

// Create stars background
function createStars() {
  const container = document.getElementById("stars-container");
  const starCount = 150;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("div");
    star.classList.add("star");

    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;

    star.style.animationDelay = `${Math.random() * 5}s`;

    container.appendChild(star);
  }
}

// Accommodation card selection
function setupAccommodationCardSelection() {
  const accommodationCards = document.querySelectorAll(".accommodation-card");
  const accommodationInput = document.getElementById("accommodation");

  accommodationCards.forEach((card) => {
    card.addEventListener("click", function () {
      accommodationCards.forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");
      accommodationInput.value = this.dataset.type;
      clearError("accommodation-error");
      updatePriceCalculation(); // Update price when accommodation changes
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
    const response = await fetch("accommodations.json");

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
      const destinationInfo = document.getElementById("destination-info");
      const accommodationsSection = document.getElementById(
        "accommodations-section"
      );

      if (selectedOption.value) {
        const dest = JSON.parse(
          selectedOption.getAttribute("data-destination")
        );

        // Update destination info display
        document.getElementById("destination-name").textContent = dest.name;
        document.getElementById("destination-description").textContent =
          dest.description;
        document.getElementById("destination-duration").textContent =
          dest.travelDuration;
        document.getElementById("destination-distance").textContent =
          dest.distance;
        document.getElementById("destination-gravity").textContent =
          dest.gravity;
        document.getElementById("destination-temperature").textContent =
          dest.temperature;
        document.getElementById(
          "destination-price"
        ).textContent = `$${dest.price.toLocaleString()} ${dest.currency}`;

        // Show the destination info
        destinationInfo.classList.remove("hidden");

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

// Check if user is logged in
function isUserLoggedIn() {
  return localStorage.getItem("currentUser") !== null;
}

// Get current user
function getCurrentUser() {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

// NEW: Save booking to localStorage
function saveBookingToLocalStorage(bookingData) {
  try {
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
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

// NEW: Updated form submission handler
document
  .getElementById("booking-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check if user is logged in
    if (!isUserLoggedIn()) {
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
