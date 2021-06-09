import Person from "./Person.mjs";
import {
  cloneObject
} from "../../lib/util.mjs";

class Director extends Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor({
    personId,
    name
  }) {
    super({
      personId,
      name
    }); // invoke Person constructor
  }
  toString() {
    return `Director{ persID: ${this.personId}, name: ${this.name} }`;
  }
}
/*****************************************************
 *** Class-level ("static") properties ***************
 *****************************************************/
// initially an empty collection (in the form of a map)
Director.instances = {};
// add Director to the list of Person subtypes
Person.subtypes.push(Director);

/**********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
/**
 *  Create a new director record
 */
Director.add = function(slots) {
  var director = null;
  try {
    director = new Director(slots);
  } catch (e) {
    console.log(`${e.constructor.name + ": " + e.message}`);
    director = null;
  }
  if (director) {
    Director.instances[director.personId] = director;
    //Person.instances[director.personId] = director;
    console.log(`Saved: ${director.name}`);
  }
};
/**
 *  Update an existing director record
 */
Director.update = function({
  personId,
  name,
  agent
}) {
  const director = Director.instances[personId],
    objectBeforeUpdate = cloneObject(director);
  var noConstraintViolated = true,
    updatedProperties = [];
  try {
    if (name && director.name !== name) {
      director.name = name;
      updatedProperties.push("name");
    }
    if (agent && director.agent !== agent) {
      director.agent = agent;
      updatedProperties.push("agent");
    }
  } catch (e) {
    console.log(e.constructor.name + ": " + e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Director.instances[personId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for director ${name}`);
    } else {
      console.log(`No property value changed for director ${name}!`);
    }
  }
};
/**
 *  Delete an existing director record
 */
Director.destroy = function(personId) {
  const director = Director.instances[personId];
  delete Director.instances[personId];
  delete Person.instances[personId];
  console.log(`Director ${director.name} deleted.`);
};
/**
 *  Retrieve all director objects as records
 */
Director.retrieveAll = function() {
  var directors = {};
  if (!localStorage["directors"]) localStorage["directors"] = "{}";
  console.log(localStorage["directors"])
  try {
    directors = JSON.parse(localStorage["directors"]);
  } catch (e) {
    console.log("Error when reading from Local Storage\n" + e);
  }
  for (const key of Object.keys(directors)) {
    try { // convert record to (typed) object
      Director.instances[key] = new Director(directors[key]);
      console.log(Director.instances[key])
      // create superclass extension
      Person.instances[key] = Director.instances[key];
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing director ${key}: ${e.message}`);
    }
  }
  console.log(`${Object.keys( Director.instances).length} Director records loaded.`);
};
/**
 *  Save all director objects as records
 */
Director.saveAll = function() {
  try {
    localStorage["directors"] = JSON.stringify(Director.instances);
    console.log(Object.keys(Director.instances).length + " directors saved.");
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};

export default Director;
