// Set focus on the name field by default
const nameField = document.querySelector('input[type="text"]');
nameField.focus();

// Hide "other job" field by default
const otherJob = document.getElementById("other-job-role");
otherJob.style.display = "none";

// Display the "other job" field if "other" role is selected
const selectJob = document.getElementById("title");
selectJob.addEventListener("change", () => showOrHide(otherJob, selectJob.value === "other"));
function showOrHide(element, condition) {
  element.style.display = condition ? "inherit" : "none";
}

// Disable t-shirt color selection by default
const selectColor = document.getElementById("color");
selectColor.setAttribute("disabled", "");

// If t-shirt design is selected
const selectDesign = document.getElementById("design");
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

// Display only the selected payment section
const selectPayment = document.getElementById("payment");
selectPayment.value = "credit-card";
updatePayment();
selectPayment.addEventListener("change", updatePayment);

function updatePayment() {
  const methods = document.querySelectorAll(".payment-methods > div:not(.payment-method-box)");
  methods.forEach(method => showOrHide(method, method.id === selectPayment.value));
}

// Form validation
const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  validator.isValidAll() && form.submit();
  console.log(`Name: ${validator.isValidName()}, Email: ${validator.isValidEmail()}, Activity: ${validator.isValidActivity()}, Card: ${validator.isValidCard()}`);
});

const validator = {
  isValidAll() {
    return this.isValidName() && this.isValidEmail() && this.isValidActivity() && this.isValidCard();
  },
  isValidName() {
    // Only letters and whitespaces, must contain letters
    const selector = 'input[type="text"]';
    const isValid = regexTestElementsValue(selector, /^(?=.*[a-z])[a-z\s]*$/i);
    visualValidation(isValid, selector, "label", selector + " ~ .hint");
    return isValid;
  },
  isValidEmail() {
    const selector = "#email";
    const isValid = regexTestElementsValue(selector, /^[^@]+@[^@]+\.[a-z]+$/i);
    visualValidation(isValid, selector, "label", selector + " ~ .hint");
    return isValid;
  },
  isValidActivity() {
    // At least one activity must be selected
    const selector = "#activities-box"
    const activityFields = [...document.querySelectorAll('#activities input[type="checkbox"]')];
    const isValid = activityFields.some(activity => activity.checked);
    visualValidation(isValid, selector, "fieldset", selector + " ~ .hint");
    return isValid;
  },
  isValidCard() {
    // Return is valid if credit card is not the selected method
    if (selectPayment.value !== "credit-card") {
      return true;
    }
    // Credit card validation
    else {
      return isValidNum() && isValidZip() && isValidCvv();
    }
  },
  isValidNum() {
    const selector = "#cc-num";
    const isValid = regexTestElementsValue("#cc-num", /^\d{13,16}$/);
    visualValidation(isValid, selector, "label", selector + " ~ .hint");
    return isValid;
  },
  isValidZip() {
    const selector = "#zip";
    const isValid = regexTestElementsValue("#zip", /^\d{5}$/);
    visualValidation(isValid, selector, "label", selector + " ~ .hint");
    return isValid;
  },
  isValidCvv() {
    const selector = "#cvv";
    const isValid = regexTestElementsValue("#cvv", /^\d{3}$/);
    visualValidation(isValid, selector, "label", selector + " ~ .hint");
    return isValid;
  }
};

function regexTestElementsValue(selector, regex) {
  const element = document.querySelector(selector);
  const str = element.value;
  return regex.test(str);
}

function visualValidation(isValid, targetSelector, closestParentSelector, hintSelector) {
  const parent = document.querySelector(targetSelector).closest(closestParentSelector);
  const hint = document.querySelector(hintSelector);
  if (!isValid) {
    parent.classList.add("not-valid");
    parent.classList.remove("valid");
    hint.style.display = "inherit";
  } else {
    parent.classList.add("valid");
    parent.classList.remove("not-valid");
    hint.style.display = "none";
  }
}

// Checkbox focus state
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
checkboxes.forEach(checkbox => {
  checkbox.addEventListener("focus", checkboxFocusHandler);
  checkbox.addEventListener("blur", checkboxBlurHandler);
});

function checkboxFocusHandler(event) {
  event.target.closest("label").classList.add("focus");
}

function checkboxBlurHandler(event) {
  event.target.closest("label").classList.remove("focus");
}

// Real-time error messages
watchInput();
function watchInput() {
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const cardNum = document.getElementById("cc-num");
  const zip = document.getElementById("zip");
  const cvv = document.getElementById("cvv");
  const activities = document.getElementById("activities");

  name.addEventListener("input", validator.isValidName);
  email.addEventListener("input", validator.isValidEmail);
  cardNum.addEventListener("input", validator.isValidNum);
  zip.addEventListener("input", validator.isValidZip);
  cvv.addEventListener("input", validator.isValidCvv);
  activities.addEventListener("change", activityChangeHandler);
}

function activityChangeHandler(event) {
  validator.isValidActivity();

  // Disable activities with conflicting times
  const target = event.target.closest('input[type="checkbox"]')
  const targetTime = target.dataset.dayAndTime;
  [...checkboxes]
    .filter(checkbox => targetTime === checkbox.dataset.dayAndTime && target !== checkbox)
    .forEach(checkbox => {
      if (target.checked) {
        checkbox.setAttribute("disabled", "")
        checkbox.closest("label").classList.add("disabled");
      } else {
        checkbox.removeAttribute("disabled")
        checkbox.closest("label").classList.remove("disabled");
      }
    })
}