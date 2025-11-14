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

document.addEventListener("DOMContentLoaded", async function () {
  await loadAccommodations();
  await loadDestinations();
});
