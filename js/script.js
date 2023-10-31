// Set focus on the name field by default
document.querySelector('input[type="text"]').focus();

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

// Conditional errors
const fieldErrors = {
  name: [
    {
      test: /^\s*$/,
      hint: "Name field cannot be blank"
    },
    {
      test: /^(?=.*[^a-z\s])/i,
      hint: "Name may only contain letters and whitespaces"
    },
    {
      test: undefined,
      hint: "Name must be formatted correctly"
    }
  ],
  email: [
    {
      test: /^\s*$/,
      hint: "Email address cannot be blank"
    },
    {
      test: /^(?=.*\s)/,
      hint: "Email address must not contain whitespaces"
    },
    {
      test: /^(?=.*[#$%&~!])/,
      hint: "Symbols #$%&~! are not allowed"
    },
    {
      test: /^(?!.*@)/,
      hint: "Email address must contain an @ symbol"
    },
    {
      test: /(?<!@[^@]+\.[^@]+)$/i,
      hint: "Email must end with a domain such as duck.com"
    },
    {
      test: /(?<!.[a-z]+)$/i,
      hint: "Top-level domain may only contain letters"
    },
    {
      test: undefined,
      hint: "Email address must be formatted correctly"
    }
  ]
};

class RequiredField {
  constructor(id, regex) {
    // id, validation test, event for real-time errors
    this.id = id;
    this.regex = regex;
    this.event = this.id !== "activities-box" ? "input" : "change";
  }

  eventHandler(event, field) {
    field.validate();
    field.id === "activities-box" && field.disableConflictingActivity(event);
  }

  validate() {
    // Return is valid if credit card is not the selected method
    if (selectPayment.value !== "credit-card" && (this.id === "cc-num" || this.id === "zip" || this.id === "cvv")) {
      return true;
    }
    const isValid = this.id !== "activities-box" ? this.regexTestInputValue() : this.isSelectedActivity();
    this.visualValidation(isValid);
    !isValid && this.updateHint();
    return isValid;
  }

  updateHint() {
    if (this.id !== "name" && this.id !== "email") {
      return;
    }
    const field = this.getElement();
    const hint = this.getHintElement();
    const errors = fieldErrors[this.id];
    errors.every(error => {
      const regex = error.test;
      const hintText = error.hint;
      // Break out of the loop if the error is identified, else continue
      if (regex.test(field.value) || regex === "undefined") {
        hint.textContent = hintText;
        return false;
      }
      return true;
    });
  }

  visualValidation(isValid) {
    const parent = this.getParentElement();
    const hint = this.getHintElement();

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

  getElement() {
    return document.getElementById(this.id);
  }

  getHintElement() {
    return document.querySelector(`#${this.id} ~ .hint`);
  }

  getParentElement() {
    const field = this.getElement();
    return this.id !== "activities-box" ? field.closest("label") : field.closest("fieldset");
  }

  regexTestInputValue() {
    const str = this.getElement().value;
    return this.regex.test(str);
  }

  isSelectedActivity() {
    // At least one activity must be selected
    const activityFields = [...document.querySelectorAll('#activities input[type="checkbox"]')];
    return activityFields.some(activity => activity.checked);
  }

  disableConflictingActivity(event) {
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
    });
  }
}

// Create required field instances (id, validation test)
const nameField   = new RequiredField("name", /^(?=.*[a-z])[a-z\s]*$/i);
const emailField  = new RequiredField("email", /^(?!.*[#$%&~!])[^@\s]+@[^@\s]+\.[a-z]+$/i);
const cardNum     = new RequiredField("cc-num", /^\d{13,16}$/);
const zip         = new RequiredField("zip", /^\d{5}$/);
const cvv         = new RequiredField("cvv", /^\d{3}$/);
const activities  = new RequiredField("activities-box", undefined);
const requiredFields = [nameField, emailField, cardNum, zip, cvv, activities];

// Real-time error messages for the required fields
requiredFields.forEach(field => {
  field.getElement().addEventListener(field.event, (event) => field.eventHandler(event, field));
});

// Invoke the validate method of all required fields (this also shows visual clues)
function validateAll() {
  let validation = [];
  requiredFields.forEach(field => validation.push(field.validate()));
  return validation.every(isValidTest => isValidTest === true);
}

// Form validation on submit
const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  validateAll() && form.submit();
});