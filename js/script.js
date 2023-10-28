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