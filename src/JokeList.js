import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";


/** List of jokes. */

const JokeList = ({ numJokesToGet = 5 }) => {
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch Jokes from the API when the component mounts.
   * Ensures no duplicate jokes are shown by using a Set ti track joke IDs.
   * Load jokes from localStorage if available, otherwise fetch new jokes.
   */
  useEffect(() => {
    if (savedJokes) {
      setJokes(savedJokes);
      setIsLoading(false);
    } else {
    getJokes();
  }
  }, []);

  /** Fetches jokes from the ICanHazDadJoke API.
   * Ensures no duplicate jokes are added to the joke list.
   */

  const getJokes = async () => {
    try {
      let jokes = [...jokes];
      let seenJokes = new Set(jokes.map(j => j.id));

      while (jokes.length < numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let {...joke } = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          jokes.push({...joke, votes: 0, locked: false });
        } else {
          console.log("duplicate found!");
        }
      }

      setJokes(jokes);
      setIsLoading(false);
      localStorage.setItem("jokes", JSON.stringify(jokes)); // Save jokes to localStorage
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Generates new Jokes by resetting the loading state and calling the getJokes function.
   */
  const generateNewJokes = () => {
    setIsLoading(true);
    setJokes(jokes.filter(j => j.locked));
    getJokes();
  };

  /**
   * Handles the voting by updating the vote count of the specific joke.
   */
  const vote = (id, delta) => {
    setJokes(jokes => {
      const updatedJokes = jokes.map(j =>
        j.id === id ? { ...j, votes: j.votes + delta } : j
      );
      localStorage.setItem("jokes", JSON.stringify(updatedJokes));  // Save updated votes to localStorage
      return updatedJokes;
    });
  };

  /**
   * Toggles the locked state for a specific joke.
   * @param {string} id - The ID of the joke to lock/unlock.
   */

  const toggleLock = (id) => {
    setJokes(jokes => {
      const updatedJokes = jokes.map(j =>
        j.id === id ? {...j, locked: !j.locked } : j
      );
      localStorage.setItem("jokes", JSON.stringify(updatedJokes)); // Save lock state to localStorage
      return updatedJokes;
    });
  };

  /**
   * Resets the vote counts for all jokes to zero and clears the localStorage.
   */

  const resetVotes = () => {
    const resetJokes = jokes.map(j => ({ ...j, votes: 0}));
    setJokes(resetJokes);
    localStorage.removeItem("jokes"); // Clear localStorage
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
      <button className="JokeList-reset" onClick={resetVotes}>
        Reset Votes
      </button>

      {sortedJokes.map(j => (
        <Joke 
        key={j.id} 
        text={j.joke} 
        votes={j.votes} 
        upvote={() => vote(j.id, 1)} 
        downvote={() => vote(j.id, -1)}
        locked={j.locked}
        toggleLock={() => toggleLock(j.id)} 
        />
      ))}
    </div>
  );
};


export default JokeList;
