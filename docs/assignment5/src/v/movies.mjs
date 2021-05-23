/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Movie, { MovieRatingEL, GenreEL } from "../m/Movie.mjs";
import Person from "../m/Person.mjs";
import { fillSelectWithOptions, fillSelectWithOptionsEl, createListFromMap, createChoiceWidget, createMultipleChoiceWidget } from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Person.retrieveAll();
Movie.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// neutralize the submit event for all use cases
for (let frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", function () {
  console.log("saved");
  Movie.saveAll();
});

/**********************************************
 Use case Retrieve/List All Movies
 **********************************************/
document.getElementById("retrieveAndListAll")
  .addEventListener("click", function () {
    document.getElementById("Movie-M").style.display = "none";
    document.getElementById("Movie-R").style.display = "block";
    document.getElementById("Movie-C").style.display = "none";
    document.getElementById("Movie-U").style.display = "none";
    document.getElementById("Movie-D").style.display = "none";

    const tableBodyEl = document.querySelector("section#Movie-R>table>tbody");
    tableBodyEl.innerHTML = "";  // drop old content

    for (const key of Object.keys(Movie.instances)) {
      let movie = Movie.instances[key];
      const personaObj = Movie.instances[key].director.name;
      const personaStr = Person.instances[Movie.instances[key].director];
      const actorListEl = createListFromMap(movie.actors, "name");
      const row = tableBodyEl.insertRow();

      movie.movieRating = movie.movieRating - 1;

      row.insertCell().textContent = movie.movieId;
      row.insertCell().textContent = movie.title;
      if (movie.releaseDate === null) {
        row.insertCell().textContent = "-";
      } else {
        row.insertCell().textContent = movie.releaseDate.toISOString().split('T')[0];;
      }
      row.insertCell().textContent = GenreEL.stringify(movie.movieGenre);
      row.insertCell().textContent = MovieRatingEL.labels[movie.movieRating];
      if (typeof personaObj !== "undefined") {
        row.insertCell().textContent = personaObj;
      } else if (typeof personaStr !== "undefined") {
        row.insertCell().textContent = personaStr._name;
      } else {
        console.log("error director missing");
      }
      row.insertCell().appendChild(actorListEl);
      movie.movieRating = movie.movieRating + 1;
    }
  });

/**********************************************
  Use case Create Movie
*/

const createFormEl = document.querySelector("section#Movie-C > form"),
  movieRating = createFormEl.movieRating,
  genreFieldSet = createFormEl.querySelector("fieldset[data-bind='movieGenre']"),
  selectActors = createFormEl.selectActors,
  selectDirector = createFormEl.selectDirector;

document.getElementById("create").addEventListener("click", function () {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-R").style.display = "none";
  document.getElementById("Movie-C").style.display = "block";
  document.getElementById("Movie-U").style.display = "none";
  document.getElementById("Movie-D").style.display = "none";

  createChoiceWidget(genreFieldSet, "movieGenre", [], "checkbox", GenreEL.labels);
  fillSelectWithOptionsEl(movieRating, MovieRatingEL.labels,);
  fillSelectWithOptions(selectDirector, Person.instances, "personId", { displayProp: "name" });
  fillSelectWithOptions(selectActors, Person.instances, "personId", { displayProp: "name" });
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.movieId.addEventListener("input", function () {
  createFormEl.movieId.setCustomValidity(
    Movie.checkMovieIdAsId(createFormEl.movieId.value).message);
});
createFormEl.title.addEventListener("input", function () {
  createFormEl.title.setCustomValidity(
    Movie.checkTitle(createFormEl.title.value).message);
});
createFormEl.releaseDate.addEventListener("input", function () {
  createFormEl.releaseDate.setCustomValidity(
    Movie.checkReleaseDate(createFormEl.releaseDate.value).message);
});

createFormEl.selectDirector.addEventListener("input", function () {
  createFormEl.selectDirector.setCustomValidity(
    Movie.checkDirector(createFormEl.selectDirector.value).message);
});

// handle Save button click events
createFormEl.commit.addEventListener("click", function () {
  const slots = {
    movieId: createFormEl.movieId.value,
    title: createFormEl.title.value,
    releaseDate: createFormEl.releaseDate.value,
    movieRating: parseInt(createFormEl.movieRating.value),
    movieGenre: JSON.parse(genreFieldSet.getAttribute("data-value")),
    director: createFormEl.selectDirector.value,
    actorIdRefs: [],
  };
  // check all input fields and show error messages
  createFormEl.movieId.setCustomValidity(
    Movie.checkMovieIdAsId(slots.movieId).message);
  createFormEl.releaseDate.setCustomValidity(
    Movie.checkReleaseDate(slots.releaseDate).message);
  createFormEl.selectDirector.setCustomValidity(
    Movie.checkDirector(slots.director).message);
  // get the list of selected authors
  const selActOptions = createFormEl.selectActors.selectedOptions;
  // check the mandatory value constraint for authors
  createFormEl.selectActors.setCustomValidity(
    selActOptions.length > 0 ? "" : "No author selected!"
  );
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    // construct a list of actors ID references
    for (const opt of selActOptions) {
      slots.actorIdRefs.push(opt.value);
    }
    Movie.add(slots);
    console.log("saved");
    refreshManageDataUI();
  }
});

/**********************************************
 * Use case Update Movie
**********************************************/
const updateFormEl = document.querySelector("section#Movie-U > form"),
  selectUpdateMovieEl = updateFormEl.selectMovie;

document.getElementById("update").addEventListener("click", function () {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-R").style.display = "none";
  document.getElementById("Movie-C").style.display = "none";
  document.getElementById("Movie-U").style.display = "block";
  document.getElementById("Movie-D").style.display = "none";
  // set up the movie selection list
  fillSelectWithOptions(selectUpdateMovieEl, Movie.instances, "movieId", { displayProp: "title" });
  /*     createChoiceWidget( movieGenreFieldsetEl, "movieGenreFieldsetEl", [], "checkbox", GenreEL.labels);
      fillSelectWithOptionsEl( movieRatingEl, MovieRatingEL.labels);
      fillSelectWithOptions( selectDirectorEl, Person.instances, "personId", {displayProp: "name"}); */
  // fillSelectWithOptions( selectActorsEl, Person.instances, "personId", {displayProp: "name"});
  updateFormEl.reset();
});
/**
 * handle movie selection events: when a movie is selected,
 * populate the form with the data of the selected movie
 */
selectUpdateMovieEl.addEventListener("change", function () {
  const formEl = document.querySelector("section#Movie-U > form"),
    saveButton = formEl.commit,

    movieGenreFieldsetEl = formEl.querySelector("fieldset[data-bind='movieGenre']"),
    movieRatingEl = formEl.movieRating,
    selectDirectorEl = formEl.selectDirector,
    selectActorsWidget = formEl.querySelector(".MultiChoiceWidget"),
    movieId = formEl.selectMovie.value;

  if (movieId) {
    const movie = Movie.instances[movieId];
    const realId = Movie.instances[movieId].director.personId;
    const persona = Person.instances[realId];

    formEl.movieId.value = movie.movieId;
    formEl.title.value = movie.title;
    formEl.releaseDate.value = movie.releaseDate.toISOString().split('T')[0];
    fillSelectWithOptionsEl(movieRatingEl, MovieRatingEL.labels);
    formEl.movieRating.value = movie.movieRating;
    createChoiceWidget(movieGenreFieldsetEl, "movieGenre", movie.movieGenre, "checkbox", GenreEL.labels);
    fillSelectWithOptions(selectDirectorEl, Person.instances, "personId", { displayProp: "name" });
    if (typeof movie.director === "string") {
      formEl.selectDirector.value = movie.director.name;
    } else {
      formEl.selectDirector.value = persona._personId;
    }
    createMultipleChoiceWidget(selectActorsWidget, movie.actors,
      Person.instances, "personId", "name", 1);  // minCard=1
    saveButton.disabled = false;

  } else {
    formEl.reset();
    formEl.selectDirector.selectedIndex = 0;
    selectActorsWidget.innerHTML = "";
    saveButton.disabled = true;
  }
});
// handle Save button click events
updateFormEl.commit.addEventListener("click", function () {
  const movieIdRef = selectUpdateMovieEl.value,
    selectActorsWidget = updateFormEl.querySelector(".MultiChoiceWidget"),
    movieGenreFieldsetEl = updateFormEl.querySelector("fieldset[data-bind='movieGenre']"),
    multiChoiceListEl = selectActorsWidget.firstElementChild;
  if (!movieIdRef) return;
  const slots = {
    movieId: movieIdRef,
    title: updateFormEl.title.value,
    releaseDate: updateFormEl.releaseDate.value,
    movieRating: updateFormEl.movieRating.value,
    movieGenre: JSON.parse(movieGenreFieldsetEl.getAttribute("data-value")),
    director: updateFormEl.selectDirector.value,
  };
  // check all input fields and show error messages
  updateFormEl.title.setCustomValidity(Movie.checkTitle(slots.movieId).message);
  updateFormEl.title.reportValidity();
  updateFormEl.releaseDate.setCustomValidity(Movie.checkReleaseDate(slots.releaseDate).message);
  updateFormEl.releaseDate.reportValidity();
  updateFormEl.selectDirector.setCustomValidity(Movie.checkDirector(slots.director).message);
  updateFormEl.selectDirector.reportValidity();
  // add event listeners for responsive validation
  movieGenreFieldsetEl.addEventListener("click", function () {
    const val = movieGenreFieldsetEl.getAttribute("data-value");
    console.log("print" + val.length);
    console.log(typeof (val));
    updateFormEl.movieGenre[0].setCustomValidity( // here
      (!val || Array.isArray(val) && val.length === 0) ?
        "At least one genre form must be selected!" : "");
  });

  // commit the update only if all form field values are valid
  if (updateFormEl.checkValidity()) {
    // construct authorIdRefs-ToAdd/ToRemove lists from the association list
    const actorIdRefsToAdd = [], actorIdRefsToRemove = [];
    for (const mcListItemEl of multiChoiceListEl.children) {
      if (mcListItemEl.classList.contains("removed")) {
        actorIdRefsToRemove.push(mcListItemEl.getAttribute("data-value"));
      }
      if (mcListItemEl.classList.contains("added")) {
        actorIdRefsToAdd.push(mcListItemEl.getAttribute("data-value"));
      }
    }
    // if the add/remove list is non-empty create a corresponding slot
    if (actorIdRefsToRemove.length > 0) {
      slots.actorIdRefsToRemove = actorIdRefsToRemove;
    }
    if (actorIdRefsToAdd.length > 0) {
      slots.actorIdRefsToAdd = actorIdRefsToAdd;
    }
  }
  Movie.update(slots);
  // update the movie selection list's option element
  selectUpdateMovieEl.options[selectUpdateMovieEl.selectedIndex].text = slots.title;
  selectActorsWidget.innerHTML = "";
});




/**********************************************
 * Use case Delete Movie
**********************************************/
const deleteFormEl = document.querySelector("section#Movie-D > form");
const selectDeleteMovieEl = deleteFormEl.selectMovie;
document.getElementById("destroy")
  .addEventListener("click", function () {
    document.getElementById("Movie-M").style.display = "none";
    document.getElementById("Movie-R").style.display = "none";
    document.getElementById("Movie-C").style.display = "none";
    document.getElementById("Movie-U").style.display = "none";
    document.getElementById("Movie-D").style.display = "block";
    // set up the author selection list
    fillSelectWithOptions(selectDeleteMovieEl, Movie.instances,
      "movieId", { displayProp: "title" });
    deleteFormEl.reset();
  });
// handle Delete button click events
deleteFormEl.commit.addEventListener("click", function () {
  const movieIdRef = selectDeleteMovieEl.value;
  if (!movieIdRef) return;
  if (confirm("Do you really want to delete this movie?")) {
    Movie.destroy(movieIdRef);
    // remove deleted moive from select options
    deleteFormEl.selectMovie.remove(deleteFormEl.selectMovie.selectedIndex);
  }
});

/**********************************************
 * Refresh the Manage Movies Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage book UI and hide the other UIs
  document.getElementById("Movie-M").style.display = "block";
  document.getElementById("Movie-R").style.display = "none";
  document.getElementById("Movie-C").style.display = "none";
  document.getElementById("Movie-U").style.display = "none";
  document.getElementById("Movie-D").style.display = "none";
}

// Set up Manage Book UI
refreshManageDataUI();