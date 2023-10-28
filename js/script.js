// Set focus on the name field by default
const nameField = document.querySelector('input[type="text"]');
nameField.focus();

// Job role selection
const otherJob = document.getElementById("other-job-role");
const selectJob = document.getElementById("title");
otherJob.style.display = "none";
selectJob.addEventListener("change", () => {
  otherJob.style.display = selectJob.value === "other" ? "inherit" : "none";
});