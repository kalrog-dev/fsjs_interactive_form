// Set focus on the name field by default
const nameField = document.querySelector('input[type="text"]');
nameField.focus();

// Job role selection
const otherJob = document.getElementById("other-job-role");
const selectJob = document.getElementById("title");
otherJob.style.display = "none";
selectJob.addEventListener("change", () => {
  // Display or hide other job field
  otherJob.style.display = selectJob.value === "other" ? "inherit" : "none";
});

// T-shirt selection
const selectColor = document.getElementById("color");
const selectDesign = document.getElementById("design");
selectColor.setAttribute("disabled", "");
selectDesign.addEventListener("change", () => {
  // Enable color selection
  selectColor.removeAttribute("disabled");

  // Update color selection options based on design select value
  [...document.querySelectorAll("option[data-theme]")].forEach(option => {
    option.dataset.theme !== selectDesign.value ? option.setAttribute("hidden", "") : option.removeAttribute("hidden")
  });
});

// Update activities' cost
document.getElementById("activities").addEventListener("change", updateTotal);
function updateTotal(event) {
  const checkbox = event.target.closest('input[type="checkbox"]');
  const multiplier = checkbox.checked ? 1 : -1;
  const difference = multiplier * Number(checkbox.dataset.cost);
  const activitiesCost = document.getElementById("activities-cost");
  const currentTotal = Number(activitiesCost.textContent.match(/\d+/)[0]);
  activitiesCost.textContent = `Total: $${currentTotal + difference}`;
}

// Payment selection
const selectPayment = document.getElementById("payment");
selectPayment.value = "credit-card";
updatePayment();
selectPayment.addEventListener("change", updatePayment);

function updatePayment() {
  const methods = document.querySelectorAll(".payment-methods > div:not(.payment-method-box)");
  methods.forEach(method => {
    method.style.display = method.id === selectPayment.value ? "inherit" : "none";
  });
}