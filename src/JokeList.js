import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";
import { keyboard } from "@testing-library/user-event/dist/cjs/keyboard/index.js";

/** List of jokes. */

const JokeList = ({ numJokesToGet = 5 }) => {
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch Jokes from the API when the component mounts.
   * Ensures no duplicate jokes are shown by using a Set ti track joke IDs.
   */
  useEffect(() => {
    getJokes();
  }, []);

  /** Fetches jokes from the ICanHazDadJoke API.
   * Ensures no duplicate jokes are added to the joke list.
   */

  const getJokes = async () => {
    try {
      let jokes = [];
      let seenJokes = new Set();

      while (jokes.length < numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let {...joke } = res.data;

        if (!seenJokes.has(joke.id)) {
          jokes.push({...joke, votes: 0});
        } else {
          console.log("duplicate found!");
        }
      }

      setJokes(jokes);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Generates new Jokes by resetting the loading state and calling the getJokes function.
   */
  const generateNewJokes = () => {
    setIsLoading(true);
    getJokes();
  };

  /**
   * Handles the voting by updating the vote count of the specific joke.
   */
  const vote = (id, delta) => {
    setJokes(jokes.map(j => j.id === id ? {...j, votes: j.votes + delta } : j));
  };

  // Sort jokes by votes in descending order
  let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
  
  // Render loading spinner or the list of jokes
  if (isLoading) {
    return (
      <div className="loading">
        <i className="fas fa-4x fa-spinner fa-spin" />
      </div>
    );
  }

  return (
    <div className="JokeList">
      <button className="JokeList-getmore" onClick={generateNewJokes}>
        Get New Jokes
      </button>

      {sortedJokes.map(j => (
        <Joke key={j.id} text={j.joke} votes={j.votes} upvote={() => vote(j.id, 1)} downvote={() => vote(j.id, -1)} />
      ))}
    </div>
  );
};


export default JokeList;
