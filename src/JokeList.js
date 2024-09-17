import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

/**
 * JokeList component.
 * Manages fetching jokes, storing them in localStorage, and allowing
 * locking, voting, and resetting of jokes.
 *
 * @param {number} numJokesToGet - The number of jokes to fetch from the API. Default is 5.
 */
const JokeList = ({ numJokesToGet = 5 }) => {
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load jokes from localStorage if available, otherwise fetch new jokes.
  useEffect(() => {
    const savedJokes = JSON.parse(localStorage.getItem("jokes"));
    if (savedJokes) {
      setJokes(savedJokes);
      setIsLoading(false);
    } else {
      // Move getJokes inside useEffect to avoid missing dependency warning
      const getJokes = async () => {
        try {
          let newJokes = [];
          let seenJokes = new Set(jokes.map(j => j.id));  // Refer to state properly

          while (newJokes.length < numJokesToGet) {
            let res = await axios.get("https://icanhazdadjoke.com", {
              headers: { Accept: "application/json" }
            });
            let { ...joke } = res.data;

            if (!seenJokes.has(joke.id)) {
              seenJokes.add(joke.id);
              newJokes.push({ ...joke, votes: 0, locked: false });
            } else {
              console.log("duplicate found!");
            }
          }

          setJokes(newJokes);  // Update jokes state with new jokes
          setIsLoading(false);
          localStorage.setItem("jokes", JSON.stringify(newJokes));  // Save jokes to localStorage
        } catch (err) {
          console.error(err);
        }
      };

      getJokes();  // Call the function inside useEffect
    }
  }, [numJokesToGet]);  // Use numJokesToGet as a dependency to trigger re-fetching if it changes

  /**
   * Updates the vote count for a specific joke by delta.
   * @param {string} id - The ID of the joke to vote on.
   * @param {number} delta - The vote change (+1 for upvote, -1 for downvote).
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
        j.id === id ? { ...j, locked: !j.locked } : j
      );
      localStorage.setItem("jokes", JSON.stringify(updatedJokes));  // Save lock state to localStorage
      return updatedJokes;
    });
  };

  /**
   * Resets the vote count for all jokes to zero and clears localStorage.
   */
  const resetVotes = () => {
    const resetJokes = jokes.map(j => ({ ...j, votes: 0 }));
    setJokes(resetJokes);
    localStorage.removeItem("jokes");  // Clear localStorage
  };

  /**
   * Generates new jokes, keeping locked jokes intact.
   */
  const generateNewJokes = () => {
    setIsLoading(true);
    setJokes(jokes.filter(j => j.locked));  // Keep only locked jokes
    const getJokes = async () => {
      try {
        let newJokes = [];
        let seenJokes = new Set(jokes.map(j => j.id));

        while (newJokes.length < numJokesToGet) {
          let res = await axios.get("https://icanhazdadjoke.com", {
            headers: { Accept: "application/json" }
          });
          let { ...joke } = res.data;

          if (!seenJokes.has(joke.id)) {
            seenJokes.add(joke.id);
            newJokes.push({ ...joke, votes: 0, locked: false });
          } else {
            console.log("duplicate found!");
          }
        }

        setJokes(prevJokes => [...prevJokes, ...newJokes]);  // Merge locked and new jokes
        setIsLoading(false);
        localStorage.setItem("jokes", JSON.stringify([...jokes, ...newJokes]));  // Save all jokes to localStorage
      } catch (err) {
        console.error(err);
      }
    };

    getJokes();
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
