/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Movie, { MovieRatingEL, GenreEL, MovieTypeEL } from "../m/Movie.mjs";
import Person from "../m/Person.mjs";
import { displaySegmentFields, undisplayAllSegmentFields } from "./app.mjs"
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
      if (movie.movieType === 1) {
        var aboutObj = Movie.instances[key].about.name;
        console.log(aboutObj)
        console.log(typeof aboutObj)
        var aboutStr = Person.instances[Movie.instances[key].about];
        console.log(aboutStr)
        console.log(typeof aboutStr)
      }
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
      if (movie.movieType) {
        switch (movie.movieType) {
          case 1: 
            row.insertCell().textContent = MovieTypeEL.labels[movie.movieType - 1];
            row.insertCell().textContent = "";
            row.insertCell().textContent = "";
            console.log(aboutObj)
            if (typeof aboutObj === "string") {
              row.insertCell().textContent = aboutObj;
            } else if (typeof aboutStr === "object") {
              row.insertCell().textContent = aboutStr._name;
            } else {
              console.log("error about person missing");
            }
            break;
          case 2:
            row.insertCell().textContent = MovieTypeEL.labels[movie.movieType - 1];
            row.insertCell().textContent = movie.tvSeriesName;
            row.insertCell().textContent = movie.episodeNo;
            break;
          }
      }
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
  selectDirector = createFormEl.selectDirector,
  selectAbout = createFormEl.selectAbout,
  movieType = createFormEl.movieType;
document.getElementById("create").addEventListener("click", function () {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-R").style.display = "none";
  document.getElementById("Movie-C").style.display = "block";
  document.getElementById("Movie-U").style.display = "none";
  document.getElementById("Movie-D").style.display = "none";

  createChoiceWidget(genreFieldSet, "movieGenre", [], "checkbox", GenreEL.labels);
  fillSelectWithOptionsEl(movieRating, MovieRatingEL.labels);
  fillSelectWithOptions(selectDirector, Person.instances, "personId", { displayProp: "name" });
  fillSelectWithOptions(selectActors, Person.instances, "personId", { displayProp: "name" });
  createChoiceWidget(genreFieldSet, "movieGenre", [], "checkbox", GenreEL.labels);
  fillSelectWithOptionsEl(movieType, MovieTypeEL.labels);
  fillSelectWithOptions(selectAbout, Person.instances, "personId", { displayProp: "name" });
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

createFormEl.tvSeriesName.addEventListener("input", function () {
  createFormEl.tvSeriesName.setCustomValidity(
    Movie.checkTvSeriesName( createFormEl.tvSeriesName.value,parseInt( createFormEl.movieType.value)).message);
});
createFormEl.episodeNo.addEventListener("input", function () {
  createFormEl.episodeNo.setCustomValidity(
    Movie.checkEpisodeNo( createFormEl.episodeNo.value, createFormEl.movieType.value).message);
});

createFormEl.selectAbout.addEventListener("input", function () {
  createFormEl.selectAbout.setCustomValidity(
    Movie.checkAbout( createFormEl.selectAbout.value, createFormEl.movieType.value).message);
});

// set up the movie type selection list
movieType.addEventListener("change", handleCategorySelectChangeEvent);

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
    movieType: parseInt(createFormEl.movieType.value),
    tvSeriesName: createFormEl.tvSeriesName.value,
    episodeNo: createFormEl.episodeNo.value,
    about: createFormEl.selectAbout.value,
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
  createFormEl.movieType.setCustomValidity(
    Movie.checkMovieType(slots.movieType).message);
  createFormEl.tvSeriesName.setCustomValidity(
    Movie.checkTvSeriesName(slots.tvSeriesName, slots.movieType).message);
  createFormEl.episodeNo.setCustomValidity(
    Movie.checkEpisodeNo(slots.episodeNo, slots.movieType).message);
  createFormEl.selectAbout.setCustomValidity(
      Movie.checkAbout(slots.about, slots.movieType).message);
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
    movieTypeEl = formEl.movieType,
    selectDirectorEl = formEl.selectDirector,
    selectAboutEl = formEl.selectAbout,
    selectActorsWidget = formEl.querySelector(".MultiChoiceWidget"),
    movieId = formEl.selectMovie.value;

  if (movieId) {
    const movie = Movie.instances[movieId];
    const realId = Movie.instances[movieId].director.personId;
    const persona = Person.instances[realId];
    if (typeof Movie.instances[movieId].about !== "undefined") {
      var aboutId = Movie.instances[movieId].about.personId;
      var aboutPersona = Person.instances[aboutId];
      formEl.movieId.value = movie.movieId;
    }
    formEl.title.value = movie.title;
    formEl.releaseDate.value = movie.releaseDate.toISOString().split('T')[0];
    if (movie.tvSeriesName !== undefined) {
      formEl.tvSeriesName.value = movie.tvSeriesName;
    }
    if (movie.episodeNo !== undefined) {
      formEl.episodeNo.value = movie.episodeNo;
    }
    fillSelectWithOptionsEl(movieRatingEl, MovieRatingEL.labels);
    formEl.movieRating.value = movie.movieRating;
    fillSelectWithOptionsEl(movieTypeEl, MovieTypeEL.labels);
    formEl.movieType.value = movie.movieType;
    createChoiceWidget(movieGenreFieldsetEl, "movieGenre", movie.movieGenre, "checkbox", GenreEL.labels);
    createMultipleChoiceWidget(selectActorsWidget, movie.actors,
      Person.instances, "personId", "name", 1);  // minCard=1
    fillSelectWithOptions(selectDirectorEl, Person.instances, "personId", { displayProp: "name" });
    if (typeof movie.director === "string") {
      formEl.selectDirector.value = movie.director.name;
    } else {
      formEl.selectDirector.value = persona._personId;
    }
    fillSelectWithOptions(selectAboutEl, Person.instances, "personId", { displayProp: "name" });

    if (movie._about) {
      if (typeof movie.about === "string") {
        formEl.selectAbout.value = movie.about.name;
      } else {
        formEl.selectAbout.value = aboutPersona._personId;
      }
    }
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
    movieType: updateFormEl.movieType.value,
    tvSeriesName: updateFormEl.tvSeriesName.value,
    episodeNo: updateFormEl.episodeNo.value,
    about: updateFormEl.selectAbout.value,
  };
  // check all input fields and show error messages
  updateFormEl.title.setCustomValidity(Movie.checkTitle(slots.movieId).message);
  updateFormEl.title.reportValidity();
  updateFormEl.releaseDate.setCustomValidity(Movie.checkReleaseDate(slots.releaseDate).message);
  updateFormEl.releaseDate.reportValidity();
  updateFormEl.selectDirector.setCustomValidity(Movie.checkDirector(slots.director).message);
  updateFormEl.selectDirector.reportValidity();
  updateFormEl.movieType.setCustomValidity(Movie.checkMovieType(slots.movieType).message);
  updateFormEl.movieType.reportValidity();

  updateFormEl.selectDirector.addEventListener("input", function () {
    updateFormEl.selectDirector.setCustomValidity(
      Movie.checkDirector(updateFormEl.selectDirector.value).message);
  });

  updateFormEl.episodeNo.addEventListener("input", function () {
    updateFormEl.episodeNo.setCustomValidity(
      Movie.checkEpisodeNo( updateFormEl.episodeNo.value,parseInt( updateFormEl.movieType.value)).message);
  });
  
  updateFormEl.tvSeriesName.addEventListener("input", function () {
    updateFormEl.tvSeriesName.setCustomValidity(
      Movie.checkTvSeriesName( updateFormEl.tvSeriesName.value,parseInt( updateFormEl.movieType.value)).message);
  });

  updateFormEl.selectAbout.addEventListener("input", function () {
    updateFormEl.selectAbout.setCustomValidity(
      Movie.checkAbout(updateFormEl.selectAbout.value,parseInt( updateFormEl.movieType.value)).message);
  });
  // add event listeners for responsive validation
  movieGenreFieldsetEl.addEventListener("click", function () {
    const val = movieGenreFieldsetEl.getAttribute("data-value");
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

function handleCategorySelectChangeEvent (e) {
  const formEl = e.currentTarget.form,
        // the array index of MovieTypeEL.labels
        categoryIndexStr = formEl.movieType.value;
  if (categoryIndexStr) {
    displaySegmentFields( formEl, MovieTypeEL.labels,
        parseInt( categoryIndexStr) + 1);
  } else {
    undisplayAllSegmentFields( formEl, MovieTypeEL.labels);
  }
};



// Set up Manage Book UI
refreshManageDataUI();
