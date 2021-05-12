import Movie from "./Movie.mjs";
import {cloneObject,isIntegerOrIntegerString} from "../../lib/util.mjs";
import { NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, UniquenessConstraintViolation,
  ReferentialIntegrityConstraintViolation }
  from "../../lib/errorTypes.mjs";

class Person {
    constructor ({personId, name}) {
        this.personId = personId;
        this.name = name;
    }
    get personId() {
        return this._personId;
    }
    static checkPersonId( personId ) {
        if (!personId) {
            return new MandatoryValueConstraintViolation("The director must not be empty!");
        } else {
            personId = parseInt(personId);
            if (isNaN( personId) || !Number.isInteger( personId) || personId < 1) {
              return new RangeConstraintViolation("The person ID must be a positive integer!");
            } else {
              return new NoConstraintViolation();               
            }
        }
    } 

    static checkPersonAsId( personId ) {
        var constraintViolation = Person.checkPersonId( personId);
        if ((constraintViolation instanceof NoConstraintViolation)) {
            personId = parseInt(personId);
            if (isNaN( personId)) {
                return new MandatoryValueConstraintViolation( "A positive integer value for the person ID is required!");
            } else if (Person.instances[String( personId)]) {
                constraintViolation = new UniquenessConstraintViolation("There is already a person record with this author ID!");  
            } else {
              constraintViolation = new NoConstraintViolation();
            }
        }
        return constraintViolation;
    }

    static checkPersonAsIdRef( personId) {
        var constraintViolation = Person.checkPersonId( personId);
        if  ((constraintViolation instanceof NoConstraintViolation) && personId) {
            if(!Person.instances[String( personId)]) {
                constraintViolation = new ReferentialIntegrityConstraintViolation(
                    "There is no person record with this ID!"); 
            }
        }
        return constraintViolation;
    }

    set personId( personId) {
        var constraintViolation = Person.checkPersonAsId( personId);
        if (constraintViolation instanceof NoConstraintViolation) {
          this._personId = parseInt( personId);
        } else {
          throw constraintViolation;
        }
    }

    // name
    get name() {
        return this._name;
    }
    static checkName( name){
      if (!name) {
        return new MandatoryValueConstraintViolation("The name must not be empty!");
      } else {
          if (typeof name !== "string") {
            return new RangeConstraintViolation("The name must be a string!");
          } else {
            return new NoConstraintViolation();               
          }
      }
    } 
    set name( name) {
        var constraintViolation = Person.checkName( name);
        if (constraintViolation instanceof NoConstraintViolation) {
          this._name = name
        } else {
          throw constraintViolation;
        }
    }

    // other methods
    toJSON() {  // is invoked by JSON.stringify
        var rec = {};
        for (const p of Object.keys( this)) {
          // remove underscore prefix
          if (p.charAt(0) === "_") rec[p.substr(1)] = this[p];
        }
        return rec;
      }
}
/****************************************************
*** Class-level ("static") properties ***************
*****************************************************/
Person.instances = {}

/**********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
Person.add = function (slots) {
    var person = null;
    try {
        person = new Person( slots);
    } catch (e) {
        console.log( `${e.constructor.name}: ${e.message}`);
        person = null;
    }
    if (person) {
        Person.instances[person.personId] = person;
        console.log(`Saved: ${person.name}`);
      }
};


Person.update = function ({personId, name}) {
    const person = Person.instances[String( personId)], objectBeforeUpdate = cloneObject( person);
    var noConstraintViolated = true, ending="", updatedProperties=[];
    try {
        if (name && person.name !== name) {
            person.name = name;
            updatedProperties.push("name");
        }
    } catch (e) {
        console.log( `${e.constructor.name}: ${e.message}`);
        noConstraintViolated = false;
        Person.instances[personId] = objectBeforeUpdate;
    }
    if (noConstraintViolated) {
        if (updatedProperties.length > 0) {
            ending = updatedProperties.length > 1 ? "ies" : "y";
            console.log( `Propert${ending} ${updatedProperties.toString()} modified for person ${name}`);
          } else {
            console.log( `No property value changed for person ${name}!`);
          }
    }
}

Person.destroy = function ( personId) {
    const person = Person.instances[personId];
    for (const key of Object.keys( Movie.instances)) {
        const movie = Movie.instances[key];
        let movieId = movie.movieId;
        // case if actor
        let actIds = movie.actors;
        var actIdArray = []
        console.log(actIds);
        for (const key of Object.keys( actIds)) {
          actIdArray.push(key);
        }
        if (actIdArray.includes(personId)) {
          delete Movie.instances[movieId];
          // Movie.instances[movieId].actors = [];
          // Movie.instances[movieId].actorIdRefs = [];
          // console.log( `Actors of Movie ${movie.movieId} changed.`);
          console.log( `Movie ${movie.movieId} deleted.`);
        }
        // case if director
        let dirId = String(movie.director.personId);
        if (dirId === personId && movieId) {
          delete Movie.instances[movieId];
          console.log( `Movie ${movie.movieId} deleted.`);
        }
    };
    console.log(actIdArray);
    delete Person.instances[personId];
    console.log( `Person ${person.name} deleted.`);
}

Person.retrieveAll = function () {
    var people = {};
    if (!localStorage["people"]) localStorage["people"] = "{}";
    try {
      people = JSON.parse( localStorage["people"]);
    } catch (e) {
      console.log( "Error when reading from Local Storage\n" + e);
      people = {};
    }
    for (const key of Object.keys( people)) {
        // convert record to (typed) object
        Person.instances[key] = new Person( people[key]);
    }
    console.log( `${Object.keys( people).length} people records loaded.`);
  };

Person.saveAll = function () {
    const nmrOfPeople = Object.keys( Person.instances).length;
    try {
      localStorage["people"] = JSON.stringify( Person.instances);
      console.log( `${nmrOfPeople} people records saved.`);
    } catch (e) {
      alert( "Error when writing to Local Storage\n" + e);
    }
  };


export default Person;