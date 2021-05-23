import Person from "./Person.mjs";
import {cloneObject,isIntegerOrIntegerString} from "../../lib/util.mjs";
import {NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, PatternConstraintViolation, UniquenessConstraintViolation}
  from "../../lib/errorTypes.mjs";
import Enumeration from "../../lib/Enumeration.mjs"

// Enumerations
const MovieRatingEL = new Enumeration({
    "pg13":"Not Under 13",
    "g":"General Audiences",
    "pg":"Parental Guidance",
    "nc17":"Not Under 17",
    "r":"Restricted",});
  const GenreEL = new Enumeration(["Action","Animation","Adventure","Crime","Comedy","Documentary","Drama","Fantasy","Family","Noire","Horror","Musical","Romance","SciFi","War"]);

class Movie {
  constructor ({movieId, title, releaseDate, movieRating, movieGenre, director, directorIdRef, actors, actorIdRefs}) {
    this.movieId = movieId;
    this.title = title;
    this.releaseDate = releaseDate;
    this.movieRating = movieRating;
    this.movieGenre = movieGenre;
    this.director = director || directorIdRef;
    this.actors = actors || actorIdRefs ;
  }

  // movieId
  get movieId() {
    return this._movieId;
  }
  static checkId( movieId) {
    if (!movieId) {
      return new MandatoryValueConstraintViolation("The Movie Id must not be empty!");
    } else if (!isIntegerOrIntegerString( movieId)) {
      return new RangeConstraintViolation("The value of Movie Id must be an integer!");
    } else {
      if (typeof movieId === "string") movieId = parseInt(movieId);
      if (movieId <= 0) {
        return new IntervalConstraintViolation("The Movie Id value must be higher than zero");
      } else {
        return new NoConstraintViolation();
      }
    }
  }
  static checkMovieIdAsId( movieId) {
    var constraintViolation = Movie.checkId( movieId);
    if ((constraintViolation instanceof NoConstraintViolation)) {
      if (!movieId) {
      constraintViolation = new MandatoryValueConstraintViolation(
          "A value for Movie Id must be provided!");
      } else if (Movie.instances[movieId]) {  
      constraintViolation = new UniquenessConstraintViolation(
          "There is already a movie record with this Id!");
      } else {
      constraintViolation = new NoConstraintViolation();
      } 
    }
    return constraintViolation;
  }
  set movieId( movieId) {
    const validationResult = Movie.checkMovieIdAsId( movieId);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieId = movieId;
    } else {
      throw validationResult;
    }
  }
  // title
  get title() {
    return this._title;
  }
  static checkTitle( title) {
    if (!title) {
      return new MandatoryValueConstraintViolation( 
          "The Title must not be empty!");
    } else if (typeof title !== "string" || title.trim() === "" || title.length > 120) {
      return new RangeConstraintViolation( 
          "The title must be a string with a max lenght of 120 chars");
    } else {
      return new NoConstraintViolation();
    }
  }
  set title( title) {
    const validationResult = Movie.checkTitle( title);
    if (validationResult instanceof NoConstraintViolation) {
        this._title = title;
    } else {
        throw validationResult;
    }
  }
  // releaseDate
  get releaseDate() {
    return this._releaseDate;
  }
  static checkReleaseDate( releaseDate) {
    var minDate = new Date(1895, 12, 28);
    if (!releaseDate) {
      return new MandatoryValueConstraintViolation( 
        "The Releasedate must not be empty!");
    } else {
      var checkReleaseDate = new Date(releaseDate);
      if (checkReleaseDate < minDate) {
      return new RangeConstraintViolation("The Release Date must be after 1895-12-28");
      } else {
      return new NoConstraintViolation();
      }
    }
  }
  set releaseDate(releaseDate) {
    const validationResult = Movie.checkReleaseDate( releaseDate);
    if (validationResult instanceof NoConstraintViolation) {
        this._releaseDate = new Date(releaseDate);
    } else {
        throw validationResult;
    }
  }

  
  // movieRating
  get movieRating() {
    return this._movieRating;
  }
  static checkMovieRating( movieRating) {
    if (!movieRating) {
      return new NoConstraintViolation();
    } else if (!isIntegerOrIntegerString( movieRating)) {
      return new MandatoryValueConstraintViolation(
      "Movie Rating value is wrong!");
    } else {
    return new NoConstraintViolation();
    }
  }

  set movieRating( movieRating) {
    const validationResult = Movie.checkMovieRating( movieRating);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieRating = parseInt( movieRating);
    } else {
      throw validationResult;
    }
  }
  // movieGenre
  get movieGenre() {
    return this._movieGenre;
  }
  static checkMovieGenre( movieGenre) {
    if (!movieGenre) {
      return new MandatoryValueConstraintViolation(
        "No movie genre form provided!");
    } else if (!Number.isInteger( movieGenre) || movieGenre < 1 ||
    movieGenre > GenreEL.MAX) {
      return new RangeConstraintViolation(
        `Invalid value for movie genre form: ${movieGenre}`);
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkMovieGenres( movieGenre) {
    if (!movieGenre || (Array.isArray( movieGenre) &&
    movieGenre.length === 0)) {
      return new MandatoryValueConstraintViolation(
        "No movie genre form provided!");
    } else if (!Array.isArray( movieGenre)) {
      return new RangeConstraintViolation(
        "The value of publicationForms must be an array!");
    } else {
      for (let i of movieGenre.keys()) {
        const validationResult = Movie.checkMovieGenre( movieGenre[i]);
        if (!(validationResult instanceof NoConstraintViolation)) {
          return validationResult;
        }
      }
      return new NoConstraintViolation();
    }
  }

  set movieGenre( movieGenre) {
    const validationResult = Movie.checkMovieGenres( movieGenre);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieGenre = movieGenre;
    } else {
      throw validationResult;
    }
  }

  // director
  get director() {
    return this._director;
  }
  static checkDirector( person_id) {
    var validationResult = null;
    if (!person_id) {
      return new MandatoryValueConstraintViolation("The director must not be empty!");
    } else {
      validationResult = Person.checkPersonAsIdRef( person_id);
    }
    return validationResult;
  }
  set director( p) {
    if (!p) {  // unset director
      return new MandatoryValueConstraintViolation("The director must not be empty!");
    } else {
      // p can be an ID reference or an object reference
      const person_id = (typeof p !== "object") ? p : p.personId;
      const validationResult = Movie.checkDirector( person_id);
      if (validationResult instanceof NoConstraintViolation) {
        // create the new person reference
        this._director = Person.instances[ person_id];
      } else {
        throw validationResult;
      }
    }
  }

  // actors
  get actors() {
    return this._actors;
  }
  static checkActor( person_id) {
    var validationResult = null;
    if (!person_id) {
      return new MandatoryValueConstraintViolation("The actors must not be empty!");
    } else {
      // invoke foreign key constraint check
      validationResult = Person.checkPersonAsIdRef( person_id);
    }
    return validationResult;
  }
  addActor( a) {
    // a can be an ID reference or an object reference
    const person_id = (typeof a !== "object") ? parseInt( a) : a.personId;
    const validationResult = Movie.checkActor( person_id);
    if (person_id && validationResult instanceof NoConstraintViolation) {
      // add the new author reference
      const key = String( person_id);
      console.log(Person.instances[key]);
      this._actors[key] = Person.instances[ key];
    } else {
      throw validationResult;
    }
  }
  removeActor( a) {
    // a can be an ID reference or an object reference
    const person_id = (typeof a !== "object") ? parseInt( a) : a.personId;
    const validationResult = Movie.checkActor( person_id);
    if (validationResult instanceof NoConstraintViolation) {
      // delete the author reference
      delete this._actors[String( person_id)];
    } else {
      throw validationResult;
    }
  }
  set actors( actors) {
    console.log("set actors");
    console.log(actors);
    this._actors = {};
    if (Array.isArray(actors)) {  // array of IdRefs
      for (const idRef of actors) {
        this.addActor( idRef);
      }
    } else {  // map of IdRefs to object references
      for (const idRef of Object.keys( actors)) {
        this.addActor( a[idRef]);
      }
    }
  }
  // Serialize movie object
  toString() {
    var movieStr = `Movie{ movieId: ${this.movieId}, title: ${this.title}, releaseDate: ${this.releaseDate}, movieRating: ${this.movieRating}, movieGenre: ${this.movieGenre.toString()}, director: ${this.director}}`;
    return `${movieStr}, actors: ${Object.keys( this.actors).join(",")} }`;
  }
  // Convert object to record with ID references
  toJSON() {  // is invoked by JSON.stringify
    var rec = {};
    for (const p of Object.keys( this)) {
      // copy only property slots with underscore prefix
      if (p.charAt(0) !== "_") continue;
      switch (p) {
        case "_publisher":
          // convert object reference to ID reference
          if (this._director) rec.director_id = this._personId.name;
          break;
        case "_actors":
          // convert the map of object references to a list of ID references
          rec.actorsIdRefs = [];
          for (const personIdStr of Object.keys( this.actors)) {
            rec.actorsIdRefs.push( parseInt( personIdStr));
          }
          break;
        default:
          // remove underscore prefix
          rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }
}
/***********************************************
*** Class-level ("static") properties **********
************************************************/
// initially an empty collection (in the form of a map)
Movie.instances = {};

/********************************************************
*** Class-level ("static") storage management methods ***
*********************************************************/
/**
 *  Create a new movie record/object
 */
Movie.add = function (slots) {
  var movie = null;
  try {
    movie = new Movie( slots);
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    movie = null;
  }
  if (movie) {
    console.log("check here");
    console.log(movie);
    Movie.instances[movie.movieId] = movie;
    console.log( `${movie.toString()} created!`);
  }
};
/**
 *  Update an existing Movie record/object
 *  properties are updated with implicit setters for making sure
 *  that the new values are validated
 */
Movie.update = function ({movieId, title, releaseDate, movieRating, movieGenre, director, actorIdRefsToAdd, actorIdRefsToRemove}) {
  const movie = Movie.instances[movieId],
      objectBeforeUpdate = cloneObject( movie);  // save the current state of movie
  var noConstraintViolated = true, updatedProperties = [];
  console.log("Movie.instances");
  console.log(Movie.instances);
  console.log("actorIdRefsToRemove");
  console.log(actorIdRefsToRemove);
  try {
    if (title && movie.title !== title) {
      movie.title = title;
      updatedProperties.push("title");
    }
    if (releaseDate !== movie.releaseDate) {
      movie.releaseDate = releaseDate;
      updatedProperties.push("releaseDate");
    }
    if (movieRating !== movie.movieRating) {
      movie.movieRating = movieRating;
      updatedProperties.push("movieRating");
    }  
    if (movieGenre !== movie.movieGenre) {
      movie.movieGenre = movieGenre;
      updatedProperties.push("movieGenre");
    }
    if (director !== movie.director) {
      movie.director = director;
      updatedProperties.push("director");
    }
    if (actorIdRefsToAdd) {
      updatedProperties.push("actors(added)");
      for (let actorIdRef of actorIdRefsToAdd) {
        console.log("actor");
        console.log(actorIdRef);
        console.log(Object.getOwnPropertyNames(movie));
        movie.addActor( actorIdRef);
      }
    }
    if (actorIdRefsToRemove) {
      updatedProperties.push("actors(removed)");
      for (let actorIdRef of actorIdRefsToRemove) {
        movie.removeActor( actorIdRef);
      }
    }
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Movie.instances[movieId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log( `Propert${ending} ${updatedProperties.toString()} modified for movie ${movieId}`);
    } else {
      console.log( `No property value changed for movie ${movie.movieId}!`);
    }
  }
};
/**
 *  Delete an existing Movie record/object
 */
Movie.destroy = function (movieId) {
  if (Movie.instances[movieId]) {
    console.log( `${Movie.instances[movieId].toString()} deleted!`);
    delete Movie.instances[movieId];
  } else {
    console.log( `There is no movie with movieId ${movieId} in the database!`);
  }
};
/**
 *  Load all movie table rows and convert them to objects 
 *  Precondition: people and people must be loaded first
 */
Movie.retrieveAll = function () {
  var movies = {};
  try {
      if (!localStorage["movies"]) localStorage["movies"] = "{}";
      else {
        movies = JSON.parse( localStorage["movies"]);
        console.log( `${Object.keys( movies).length} movies records loaded.`);
      }
  } catch (e) {
    alert( "Error when reading from Local Storage\n" + e);
  }
  for (let key of Object.keys( movies)) {
      let movieId = movies[key].movieId,
      title = movies[key].title,
      releaseDate = movies[key].releaseDate,
      movieRating = movies[key].movieRating,
      movieGenre = movies[key].movieGenre,
      director = movies[key].director,
      actorsIdRefs = movies[key].actorsIdRefs;
      Movie.instances[key] = new Movie( {
        movieId: movieId,
        title: title,
        releaseDate: releaseDate,
        movieRating: movieRating,
        movieGenre: movieGenre,
        director: director,
        actorIdRefs: actorsIdRefs
    });  // WATCH OUT THIS LINE!!! 
      // Movie.instances[movieId] = movies[movieId];
  }
};





/**
 *  Save all movie objects
 */
Movie.saveAll = function () {
  const nmrOfMovies = Object.keys( Movie.instances).length;
  try {
    localStorage["movies"] = JSON.stringify( Movie.instances);
    console.log( `${nmrOfMovies} movie records saved.`);
  } catch (e) {
    alert( "Error when writing to Local Storage\n" + e);
  }
};


export default Movie;
export { MovieRatingEL, GenreEL };
