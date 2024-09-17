import React, { Component } from "react";
import "./Joke.css";

/** A single joke, along with vote up/down buttons. 
 * Renders a joke, vote buttons, and the current vote count.
 * 
 * @param {string} text - The joke text.
 * @param {number} votes - The current vote count.
 * @param {function} upvote - Function to handle upvoting the joke.
 * @param {function} downvote - Function to handle downvoting the joke.
*/


function Joke({ text, votes, upvote, downvote }) {
  return (
    <div className="Joke">
      <div className="Joke-votearea">
        <button onClick={upvote}>
          <i className="fas fa-thumbs-up" />
        </button>

        {votes}
      </div>

      <div className="Joke-text">{text}</div>
    </div>
  );
}

export default Joke;
