/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Movie from "../m/Movie.mjs";
import Director from "../m/Director.mjs";
import Person from "../m/Person.mjs";
import {
  fillSelectWithOptions,
  createListFromMap
} from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Director.retrieveAll();
Person.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// set up back-to-menu buttons for all use cases
for (let btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener('click', function() {
    refreshManageDataUI();
  });
}
// neutralize the submit event for all use cases
for (let frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function(e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", function() {
  Director.saveAll();
  Person.saveAll();
});

/**********************************************
 Use case Retrieve and List All Directors
 **********************************************/


document.getElementById("retrieveAndListAll").addEventListener("click", function() {
  const tableBodyEl = document.querySelector("section#Director-R > table > tbody");
  tableBodyEl.innerHTML = "";
  for (let key of Object.keys(Director.instances)) {
    const director = Director.instances[key];
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = director.personId;
    row.insertCell().textContent = director.name;
    row.insertCell().textContent = director.agent;
    /*        // create list of movies directed by this artist
           const listEldirMovies = createListFromMap(person.directedMovies, "title");
           row.insertCell().appendChild(listEldirMovies);
           // create list of movies plyed by this artist
           const listElplayMovies = createListFromMap(person.playedMovies, "title");
           row.insertCell().appendChild(listElplayMovies);
           // create list of movies about this artist
           const listElaboutMovies = createListFromMap(person.aboutMovies, "title");
           row.insertCell().appendChild(listElaboutMovies); */
  }
  document.getElementById("Director-M").style.display = "none";
  document.getElementById("Director-R").style.display = "block";
  document.getElementById("Director-C").style.display = "none";
  document.getElementById("Director-U").style.display = "none";
  document.getElementById("Director-D").style.display = "none";
});


/**********************************************
 Use case Create Director
 **********************************************/
const createFormEl = document.querySelector("section#Director-C > form");
document.getElementById("create")
  .addEventListener("click", function() {
    document.getElementById("Director-M").style.display = "none";
    document.getElementById("Director-R").style.display = "none";
    document.getElementById("Director-C").style.display = "block";
    document.getElementById("Director-U").style.display = "none";
    document.getElementById("Director-D").style.display = "none";
    createFormEl.reset();
  });
// set up event handlers for responsive constraint validation
createFormEl.personId.addEventListener("input", function() {
  createFormEl.personId.setCustomValidity(
    Person.checkPersonAsId(createFormEl.personId.value).message);
});
createFormEl.name.addEventListener("input", function() {
  createFormEl.name.setCustomValidity(
    Person.checkName(createFormEl.name.value).message);
});

// handle Save button click events
createFormEl["commit"].addEventListener("click", function() {
  const slots = {
    personId: createFormEl.personId.value,
    name: createFormEl.name.value,
  };
  // check all input fields and show error messages
  createFormEl.personId.setCustomValidity(Person.checkPersonAsId(slots.personId).message);
  createFormEl.name.setCustomValidity(Person.checkName(slots.name).message);
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) Director.add(slots);
});

/**********************************************
 Use case Update Director
 **********************************************/
const updateFormEl = document.querySelector("section#Director-U > form");
const selectUpdateDirectorEl = updateFormEl.selectDirector;
document.getElementById("update").addEventListener("click", function() {
  document.getElementById("Director-M").style.display = "none";
  document.getElementById("Director-R").style.display = "none";
  document.getElementById("Director-C").style.display = "none";
  document.getElementById("Director-U").style.display = "block";
  document.getElementById("Director-D").style.display = "none";
  // set up the director selection list
  selectUpdateDirectorEl.innerHTML = "";
  fillSelectWithOptions(selectUpdateDirectorEl, Director.instances,
    "personId", {
      displayProp: "name"
    });
  updateFormEl.reset();
});
updateFormEl.name.addEventListener("input", function() {
  updateFormEl.name.setCustomValidity(
    Person.checkName(updateFormEl.name.value).message);
});

selectUpdateDirectorEl.addEventListener("change", handlePersonSelectChangeEvent);
updateFormEl.name.addEventListener("input", function() {
  updateFormEl.name.setCustomValidity(
    Person.checkName(updateFormEl.name.value).message);
});

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function() {
  const personIdRef = selectUpdateDirectorEl.value;
  if (!personIdRef) return;
  const slots = {
    personId: updateFormEl.personId.value,
    name: updateFormEl.name.value
  }
  // check all property constraints
  updateFormEl.name.setCustomValidity(
    Person.checkName(slots.name).message);
  // save the input data only if all of the form fields are valid
  if (selectUpdateDirectorEl.checkValidity()) {
    Director.update(slots);
    // update the author selection list's option element
    selectUpdateDirectorEl.options[selectUpdateDirectorEl.selectedIndex].text = slots.name;
  }
});
/**
 * handle person selection events
 * when a person is selected, populate the form with the data of the selected person
 */
function handlePersonSelectChangeEvent() {
  var key = "",
    auth = null;
  key = updateFormEl.selectDirector.value;
  if (key) {
    let person = Director.instances[key];
    updateFormEl.personId.value = person.personId;
    updateFormEl.name.value = person.name;
  } else {
    updateFormEl.reset();
  }
}

/**********************************************
 Use case Delete Director
 **********************************************/
const deleteFormEl = document.querySelector("section#Director-D > form");
const selectDeleteDirectorEl = deleteFormEl.selectDirector;
document.getElementById("destroy").addEventListener("click", function() {
  document.getElementById("Director-M").style.display = "none";
  document.getElementById("Director-R").style.display = "none";
  document.getElementById("Director-C").style.display = "none";
  document.getElementById("Director-U").style.display = "none";
  document.getElementById("Director-D").style.display = "block";
  // set up the author selection list
  fillSelectWithOptions(selectDeleteDirectorEl, Director.instances,
    "personId", {
      displayProp: "name"
    });
  deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function() {
  const personIdRef = selectDeleteDirectorEl.value;
  if (!personIdRef) return;
  if (confirm("Do you really want to delete this person?")) {
    Director.destroy(personIdRef);
    selectDeleteDirectorEl.remove(deleteFormEl.selectDirector.selectedIndex);
  }


});

/**********************************************
 * Refresh the Manage Director Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage author UI and hide the other UIs
  document.getElementById("Director-M").style.display = "block";
  document.getElementById("Director-R").style.display = "none";
  document.getElementById("Director-C").style.display = "none";
  document.getElementById("Director-U").style.display = "none";
  document.getElementById("Director-D").style.display = "none";
}

// Set up Manage Authors UI
refreshManageDataUI();
