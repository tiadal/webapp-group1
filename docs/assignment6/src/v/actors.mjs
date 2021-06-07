/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Movie from "../m/Movie.mjs";
import Actor from "../m/Actor.mjs";
import Person from "../m/Person.mjs";
import {
  fillSelectWithOptions,
  createListFromMap
} from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Actor.retrieveAll();
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
  Actor.saveAll();
  Person.saveAll();
});

/**********************************************
 Use case Retrieve and List All Actors
 **********************************************/


document.getElementById("retrieveAndListAll").addEventListener("click", function() {
  const tableBodyEl = document.querySelector("section#Actor-R > table > tbody");
  tableBodyEl.innerHTML = "";
  for (let key of Object.keys(Actor.instances)) {
    const actor = Actor.instances[key];
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = actor.personId;
    row.insertCell().textContent = actor.name;
    row.insertCell().textContent = actor.agent;
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
  document.getElementById("Actor-M").style.display = "none";
  document.getElementById("Actor-R").style.display = "block";
  document.getElementById("Actor-C").style.display = "none";
  document.getElementById("Actor-U").style.display = "none";
  document.getElementById("Actor-D").style.display = "none";
});


/**********************************************
 Use case Create Actor
 **********************************************/
const createFormEl = document.querySelector("section#Actor-C > form");
const selectAgentEl = createFormEl.selectAgent;
document.getElementById("create")
  .addEventListener("click", function() {
    document.getElementById("Actor-M").style.display = "none";
    document.getElementById("Actor-R").style.display = "none";
    document.getElementById("Actor-C").style.display = "block";
    document.getElementById("Actor-U").style.display = "none";
    document.getElementById("Actor-D").style.display = "none";
    // set up the agent selection list
    fillSelectWithOptions(selectAgentEl, Person.instances,
      "personId", {
        displayProp: "name"
      });
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
    agent: createFormEl.selectAgent.value
  };
  // check all input fields and show error messages
  createFormEl.personId.setCustomValidity(Person.checkPersonAsId(slots.personId).message);
  createFormEl.name.setCustomValidity(Person.checkName(slots.name).message);
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) Actor.add(slots);
});

/**********************************************
 Use case Update Actor
 **********************************************/
const updateFormEl = document.querySelector("section#Actor-U > form");
const selectUpdateActorEl = updateFormEl.selectAgent;
const selectActorEl = updateFormEl.selectActor;
document.getElementById("update").addEventListener("click", function() {
  document.getElementById("Actor-M").style.display = "none";
  document.getElementById("Actor-R").style.display = "none";
  document.getElementById("Actor-C").style.display = "none";
  document.getElementById("Actor-U").style.display = "block";
  document.getElementById("Actor-D").style.display = "none";
  // set up the actor selection list
  selectActorEl.innerHTML = "";
  fillSelectWithOptions(selectActorEl, Actor.instances,
    "personId", {
      displayProp: "name"
    });
  updateFormEl.reset();
  // set up the agent selection list
  fillSelectWithOptions(selectUpdateActorEl, Person.instances,
    "personId", {
      displayProp: "name"
    });
  updateFormEl.reset();
});
selectActorEl.addEventListener("change", handlePersonSelectChangeEvent);
updateFormEl.name.addEventListener("input", function() {
  updateFormEl.name.setCustomValidity(
    Person.checkName(updateFormEl.name.value).message);
});

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function() {
  const personIdRef = selectUpdateActorEl.value;
  if (!personIdRef) return;
  const slots = {
    personId: updateFormEl.personId.value,
    name: updateFormEl.name.value,
    agent: updateFormEl.selectAgent.value
  }
  console.log(updateFormEl.selectAgent.value)
  // check all property constraints
  updateFormEl.name.setCustomValidity(
    Person.checkName(slots.name).message);
  // save the input data only if all of the form fields are valid
  if (selectUpdateActorEl.checkValidity()) {
    Actor.update(slots);
    // update the author selection list's option element
    selectUpdateActorEl.options[selectUpdateActorEl.selectedIndex].text = slots.name;
  }
});
/**
 * handle person selection events
 * when a person is selected, populate the form with the data of the selected person
 */
function handlePersonSelectChangeEvent() {
  var key = "",
    auth = null;
  key = updateFormEl.selectActor.value;
  if (key) {
    let actor = Actor.instances[key];
    updateFormEl.personId.value = actor.personId;
    updateFormEl.name.value = actor.name;
    updateFormEl.selectAgent.value = actor.agent;
  } else {
    updateFormEl.reset();
  }
}

/**********************************************
 Use case Delete Actor
 **********************************************/
const deleteFormEl = document.querySelector("section#Actor-D > form");
const selectDeleteActorEl = deleteFormEl.selectActor;
document.getElementById("destroy").addEventListener("click", function() {
  document.getElementById("Actor-M").style.display = "none";
  document.getElementById("Actor-R").style.display = "none";
  document.getElementById("Actor-C").style.display = "none";
  document.getElementById("Actor-U").style.display = "none";
  document.getElementById("Actor-D").style.display = "block";
  // set up the author selection list
  fillSelectWithOptions(selectDeleteActorEl, Actor.instances,
    "personId", {
      displayProp: "name"
    });
  deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function() {
  const personIdRef = selectDeleteActorEl.value;
  if (!personIdRef) return;
  if (confirm("Do you really want to delete this person?")) {
    Actor.destroy(personIdRef);
    selectDeleteActorEl.remove(deleteFormEl.selectActor.selectedIndex);
  }


});

/**********************************************
 * Refresh the Manage Actor Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage author UI and hide the other UIs
  document.getElementById("Actor-M").style.display = "block";
  document.getElementById("Actor-R").style.display = "none";
  document.getElementById("Actor-C").style.display = "none";
  document.getElementById("Actor-U").style.display = "none";
  document.getElementById("Actor-D").style.display = "none";
}

// Set up Manage Authors UI
refreshManageDataUI();
