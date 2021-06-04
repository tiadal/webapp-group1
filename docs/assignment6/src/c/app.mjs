import Person from "../m/Person.mjs";
import Movie, {MovieTypeEL} from "../m/Movie.mjs";
import Enumeration from "../../lib/Enumeration.mjs";

// Enumerations
const MovieRatingEL = new Enumeration({
  "pg13":"Not Under 13",
  "g":"General Audiences",
  "pg":"Parental Guidance",
  "nc17":"Not Under 17",
  "r":"Restricted"});
const GenreEL = new Enumeration(["Action","Animation","Adventure","Crime","Comedy","Documentary","Drama","Fantasy","Family","Noire","Horror","Musical","Romance","SciFi","War"]);
/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Create and save test data
 */
function generateTestData() {
    // generate people
    Person.instances["1"] = new Person({
      personId: 1,
      name: "Stephen Frears"
    });
    Person.instances["2"] = new Person({
      personId: 2,
      name: "George Lucas"
    });
    Person.instances["3"] = new Person({
      personId: 3,
      name: "Quentin Tarantino"
    });
    Person.instances["5"] = new Person({
        personId: 5,
        name: "Uma Thurman"
    });
    Person.instances["6"] = new Person({
        personId: 6,
        name: "John Travolta"
    });
    Person.instances["7"] = new Person({
        personId: 7,
        name: "Ewan McGregor"
    });
    Person.instances["8"] = new Person({
        personId: 8,
        name: "Natalie Portman"
    });
    Person.instances["9"] = new Person({
        personId: 9,
        name: "Keanu Reeves"
    });
    Person.saveAll();
    // generate movies
    Movie.instances["1"] = new Movie({
      movieId: 1,
      title: "Dangerous Liaisons",
      releaseDate: "1988-12-16",
      movieRating: MovieRatingEL.PG,
      movieGenre: [GenreEL.ACTION, GenreEL.ADVENTURE, GenreEL.FANTASY, GenreEL.SCIFI],
      directorIdRef: 1,
      actorIdRefs: [9, 5],
      movieType: MovieTypeEL.TVSERIESEPISODE,
      tvSeriesName: "The best",
      episodeNo: 1
  });
    Movie.instances["2"] = new Movie({
      movieId: 2,
      title: "Pulp Fiction",
      releaseDate: "1994-05-12",
      movieRating: MovieRatingEL.R,
      movieGenre: [GenreEL.CRIME, GenreEL.DRAMA],
      directorIdRef: 3,
      actorIdRefs: [5, 6],
      movieType: MovieTypeEL.BIOGRAPHY,
      aboutIdRef: 5
    });
    Movie.instances["3"] = new Movie({
        movieId: 3,
        title: "Star Wars",
        releaseDate: "1977-05-25",
        movieRating: MovieRatingEL.PG,
        movieGenre: [GenreEL.ACTION, GenreEL.ADVENTURE, GenreEL.FANTASY, GenreEL.SCIFI],
        directorIdRef: 2,
        actorIdRefs: [7, 8],
        movieType: MovieTypeEL.BIOGRAPHY,
        aboutIdRef: 5
    });
    Movie.instances["4"] = new Movie({
        movieId: 4,
        title: "TEST",
        releaseDate: "1990-12-16",
        movieRating: MovieRatingEL.R,
        movieGenre: [GenreEL.ACTION, GenreEL.ADVENTURE, GenreEL.FANTASY, GenreEL.SCIFI],
        directorIdRef: 2,
        actorIdRefs: [9, 5],
        movieType: MovieTypeEL.TVSERIESEPISODE,
        tvSeriesName: "The worst",
        episodeNo: 2
    });
    console.log(Movie.instances["3"]);
    Movie.saveAll();
}
/**
 * Clear data
 */
function clearData() {
  if (confirm( "Do you really want to delete the entire database?")) {
    try {
      Person.instances = {};
      localStorage["people"] = "{}";
      Movie.instances = {};
      localStorage["movies"] = "{}";
      console.log("All data cleared.");
    } catch (e) {
      console.log( `${e.constructor.name}: ${e.message}`);
    }
  }
}

export { generateTestData, clearData };
