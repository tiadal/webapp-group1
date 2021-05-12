/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Movie from "../m/Movie.mjs";
import Person from "../m/Person.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Person.retrieveAll();
Movie.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// set up back-to-menu buttons for all use cases
for (let btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener('click', function () {refreshManageDataUI();});
}
// neutralize the submit event for all use cases
for (let frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", function () {
  Person.saveAll();
});

/**********************************************
 Use case Retrieve and List All People
 **********************************************/


document.getElementById("retrieveAndListAll")
  .addEventListener("click", function () {
    const tableBodyEl = document.querySelector("section#Person-R > table > tbody");
    tableBodyEl.innerHTML = "";
    for (let key of Object.keys( Person.instances)) {
      const person = Person.instances[key];
      const row = tableBodyEl.insertRow();
      row.insertCell().textContent = person.personId;
      row.insertCell().textContent = person.name;
    }
    document.getElementById("Person-M").style.display = "none";
    document.getElementById("Person-R").style.display = "block";
    document.getElementById("Person-C").style.display = "none";
    document.getElementById("Person-U").style.display = "none";
    document.getElementById("Person-D").style.display = "none";
  });

/**********************************************
 Use case Create Person
 **********************************************/
const createFormEl = document.querySelector("section#Person-C > form");
document.getElementById("create")
  .addEventListener("click", function () {
    document.getElementById("Person-M").style.display = "none";
    document.getElementById("Person-R").style.display = "none";
    document.getElementById("Person-C").style.display = "block";
    document.getElementById("Person-U").style.display = "none";
    document.getElementById("Person-D").style.display = "none";
    createFormEl.reset();
  });
// set up event handlers for responsive constraint validation
createFormEl.personId.addEventListener("input", function () {
  createFormEl.personId.setCustomValidity(
      Person.checkPersonAsId( createFormEl.personId.value).message);
});
createFormEl.name.addEventListener("input", function () {
  createFormEl.name.setCustomValidity(
      Person.checkName( createFormEl.name.value).message);
});
/* SIMPLIFIED CODE: no responsive validation of name */

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    personId: createFormEl.personId.value,
    name: createFormEl.name.value
  };
  // check all input fields and show error messages
  createFormEl.personId.setCustomValidity(
      Person.checkPersonAsId( slots.personId).message);
  createFormEl.name.setCustomValidity(
    Person.checkName( slots.name).message);
  /* SIMPLIFIED CODE: no before-submit validation of name */
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) Person.add( slots);
});

/**********************************************
 Use case Update Person
 **********************************************/
const updateFormEl = document.querySelector("section#Person-U > form");
const selectUpdatePersonEl = updateFormEl.selectPerson;
document.getElementById("update")
  .addEventListener("click", function () {
    document.getElementById("Person-M").style.display = "none";
    document.getElementById("Person-R").style.display = "none";
    document.getElementById("Person-C").style.display = "none";
    document.getElementById("Person-U").style.display = "block";
    document.getElementById("Person-D").style.display = "none";
    // set up the author selection list
    fillSelectWithOptions( selectUpdatePersonEl, Person.instances,
      "personId", {displayProp:"name"});
    updateFormEl.reset();
  });
selectUpdatePersonEl.addEventListener("change", handlePersonSelectChangeEvent);
updateFormEl.name.addEventListener("input", function () {
  updateFormEl.name.setCustomValidity(
      Person.checkName( updateFormEl.name.value).message);
});

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const personIdRef = selectUpdatePersonEl.value;
  if (!personIdRef) return;
  const slots = {
    personId: updateFormEl.personId.value,
    name: updateFormEl.name.value
  }
  // check all property constraints
  updateFormEl.name.setCustomValidity(
    Person.checkName( slots.name).message);
  // save the input data only if all of the form fields are valid
  if (selectUpdatePersonEl.checkValidity()) {
    Person.update( slots);
    // update the author selection list's option element
    selectUpdatePersonEl.options[selectUpdatePersonEl.selectedIndex].text = slots.name;
  }
});
/**
 * handle person selection events
 * when a person is selected, populate the form with the data of the selected person
 */
function handlePersonSelectChangeEvent () {
  var key = "", auth = null;
  key = updateFormEl.selectPerson.value;
  if (key) {
    let person = Person.instances[key];
    updateFormEl.personId.value = person.personId;
    updateFormEl.name.value = person.name;
  } else {
    updateFormEl.reset();
  }
}

/**********************************************
 Use case Delete Author
 **********************************************/
const deleteFormEl = document.querySelector("section#Person-D > form");
const selectDeletePersonEl = deleteFormEl.selectPerson;
document.getElementById("destroy")
  .addEventListener("click", function () {
    document.getElementById("Person-M").style.display = "none";
    document.getElementById("Person-R").style.display = "none";
    document.getElementById("Person-C").style.display = "none";
    document.getElementById("Person-U").style.display = "none";
    document.getElementById("Person-D").style.display = "block";
    // set up the author selection list
    fillSelectWithOptions( selectDeletePersonEl, Person.instances,
      "personId", {displayProp:"name"});
    deleteFormEl.reset();
  });
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const personIdRef = selectDeletePersonEl.value;
  if (!personIdRef) return;
  if (confirm( "Do you really want to delete this person?")) {
    Person.destroy( personIdRef);
    selectDeletePersonEl.remove( deleteFormEl.selectPerson.selectedIndex);
  }
});

/**********************************************
 * Refresh the Manage Authors Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage author UI and hide the other UIs
  document.getElementById("Person-M").style.display = "block";
  document.getElementById("Person-R").style.display = "none";
  document.getElementById("Person-C").style.display = "none";
  document.getElementById("Person-U").style.display = "none";
  document.getElementById("Person-D").style.display = "none";
}

// Set up Manage Authors UI
refreshManageDataUI();
