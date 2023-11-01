/**
 * @file Interactive form with validation.
 * @author Michal Veselka
 * {@link https://github.com/kalrog-dev}
 */

// Set focus on the name field by default.
document.querySelector('input[type="text"]').focus();

// Hide "other job" field by default.
const otherJob = document.getElementById("other-job-role");
otherJob.style.display = "none";

// Display the "other job" field if "other" role is selected.
const selectJob = document.getElementById("title");
selectJob.addEventListener("change", () => showOrHide(otherJob, selectJob.value === "other"));

/**
 * Display or hide an element based on a condition.
 * @param {HTMLInputElement|HTMLDivElement} element - Reference to the element to display or hide.
 * @param {boolean} condition - Condition to display the element.
 * @returns {undefined}
 */
function showOrHide(element, condition) {
  element.style.display = condition ? "inherit" : "none";
}

// Disable t-shirt color selection by default.
const selectColor = document.getElementById("color");
selectColor.setAttribute("disabled", "");

// If t-shirt design is selected.
const selectDesign = document.getElementById("design");
selectDesign.addEventListener("change", () => {
  // Enable color selection and select the default option.
  selectColor.removeAttribute("disabled");
  selectColor.value = "Select a design theme above";

  // Update color selection options based on design select value.
  [...document.querySelectorAll("option[data-theme]")].forEach(option => {
    option.dataset.theme !== selectDesign.value ? option.setAttribute("hidden", "") : option.removeAttribute("hidden")
  });
});

// Update the total cost of activities when an activity has been (un)checked.
document.getElementById("activities").addEventListener("change", updateTotal);

/**
 * Update the total cost of activities.
 * @param {object} event - The event object.
 * @returns {undefined}
 */
function updateTotal(event) {
  const checkbox = event.target.closest('input[type="checkbox"]');
  const multiplier = checkbox.checked ? 1 : -1;
  const difference = multiplier * Number(checkbox.dataset.cost);
  const activitiesCost = document.getElementById("activities-cost");
  const currentTotal = Number(activitiesCost.textContent.match(/\d+/)[0]);
  activitiesCost.textContent = `Total: $${currentTotal + difference}`;
}

// Set credit card as default method and listen for changes.
const selectPayment = document.getElementById("payment");
selectPayment.value = "credit-card";
updatePayment();
selectPayment.addEventListener("change", updatePayment);

// Display only the selected payment section.
function updatePayment() {
  const methods = document.querySelectorAll(".payment-methods > div:not(.payment-method-box)");
  methods.forEach(method => showOrHide(method, method.id === selectPayment.value));
}

// Checkbox focus state.
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

// Conditional error messages.
const fieldErrors = {
  name: [
    {
      test: /^\s*$/,
      hint: "Name field cannot be blank"
    },
    {
      test: /^(?=.*[^a-z\s])/i,
      hint: "Name may only contain letters or whitespaces"
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

/** Class representing a required field. */
class RequiredField {
  /**
   * Create a required field.
   * @param {string} id - Element's id without the # symbol.
   * @param {RegExp|undefined} regex - Regular expression to validate a field.
   */
  constructor(id, regex) {
    this.id = id;
    this.regex = regex;
  }

  /**
   * Run real-time on input validation for input elements and on change
   * validation for activities.
   * @param {object} event - The event object.
   * @param {RequiredField} field - An instance of the RequiredField.
   * @returns {undefined}
   */
  eventHandler(event, field) {
    field.validate();
    field.id === "activities-box" && field.disableConflictingActivity(event);
  }

  /**
   * Validate the required field. Then apply success or error styles and give a hint to pass the validation.
   * @returns {boolean} The field's validation result.
   */
  validate() {
    if (selectPayment.value !== "credit-card" && (this.id === "cc-num" || this.id === "zip" || this.id === "cvv")) {
      return true;
    }
    const isValid = this.id !== "activities-box" ? this.regexTestInputValue() : this.isOneOrMoreActivitySelected();
    this.visualValidation(isValid);
    !isValid && this.updateHint();
    return isValid;
  }

  /**
   * Test input field's value with regular expressions to identify the reason validation has failed 
   * and display a corresponding hint.
   * @see fieldErrors
   * @returns {undefined}
   */
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
      // Break out of the loop if the error is identified.
      if (regex.test(field.value) || regex === "undefined") {
        hint.textContent = hintText;
        return false;
      }
      // Continue the every loop.
      return true;
    });
  }

  /**
   * Toggle classes to apply the success or error styles. 
   * @param {boolean} isValid - The result of the field's validation.
   * @returns {undefined}
   */
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

  /**
   * Get reference to the required field.
   * @returns {HTMLElement}
   */
  getElement() {
    return document.getElementById(this.id);
  }

  /**
   * Get reference to a hint associated with the required field.
   * @returns {HTMLSpanElement}
   */
  getHintElement() {
    return document.querySelector(`#${this.id} ~ .hint`);
  }

  /**
   * Get reference to a parent of the required field.
   * @returns {HTMLLabelElement|HTMLFieldSetElement}
   */
  getParentElement() {
    const field = this.getElement();
    return this.id !== "activities-box" ? field.closest("label") : field.closest("fieldset");
  }

  /**
   * Test if the regex pattern exists in the input field's value.
   * @returns {boolean}
   */
  regexTestInputValue() {
    const str = this.getElement().value;
    return this.regex.test(str);
  }

  /**
   * Validate the activities field by checking if at least one activity has been selected.
   * @returns {boolean}
   */
  isOneOrMoreActivitySelected() {
    const activityFields = [...document.querySelectorAll('#activities input[type="checkbox"]')];
    return activityFields.some(activity => activity.checked);
  }

  /**
   * Disable or enable activities that occur at the same time.
   * @param {object} event - The event object.
   * @returns {undefined}
   */
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

// Arguments for the RequiredField's constructor.
const constructorArgs = {
  name: {
    id: "name",
    regex: /^(?=.*[a-z])[a-z\s]*$/i
  },
  email: {
    id: "email",
    regex: /^(?!.*[#$%&~!])[^@\s]+@[^@\s]+\.[a-z]+$/i
  },
  activities: {
    id: "activities-box",
    regex: undefined
  },
  cardNum: {
    id: "cc-num",
    regex: /^\d{13,16}$/
  },
  zip: {
    id: "zip",
    regex: /^\d{5}$/
  },
  cvv: {
    id: "cvv",
    regex: /^\d{3}$/
  },
};

/**
 * Create an instance of each required field.
 * @returns {RequiredField[]} Array of required field instances.
*/
function createInstances() {
  const instances = [];
  const fields = Object.values(constructorArgs);
  for (const field of fields) {
    const { id, regex } = field;
    instances.push(new RequiredField(id, regex));
  }
  return instances;
}

// Create and store all the required field instances.
const requiredFields = createInstances();

/**
 * Invoke the validate method of all required fields. This includes visual validation and showing a hint.
 * @returns {boolean} The validation result.
 */
function validateAll() {
  const validation = [];
  requiredFields.forEach(field => validation.push(field.validate()));
  return validation.every(isValid => isValid === true);
}

// Form validation on submit. Reload the page if successful instead of form.submit().
const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  validateAll() && window.location.reload();
});

// Form validation on input or change.
requiredFields.forEach(field => {
  const eventToListenFor = field.id !== "activities-box" ? "input" : "change";
  field.getElement().addEventListener(eventToListenFor, (event) => field.eventHandler(event, field));
});