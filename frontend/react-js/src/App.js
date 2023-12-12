import { useRef, useEffect, useState, useReducer } from "react";
import Gun from "gun";
import "gun/lib/path.js";
import moment from "moment";

// initialize gun locally
const gun = Gun({
  peers: ["http://localhost:3030/gun"],
});

const root = gun.get("data");
const gunDataPath = "messages";

// create the initial state to hold the messages
const initialState = {
  messages: [],
};

const takenUsernames = new Set();
const myUsernames = new Set();

// create a reducer that will update the messages array
function reducer(state, message) {
  return {
    messages: [message, ...state.messages],
  };
}

export default function App() {
  // the form state manages the form input for creating a new message
  const [formState, setFormState] = useState({
    username: "",
    message: "",
  });

  // used to scroll to bottom of page whenever we make a new message
  const dummy = useRef();

  // initialize the reducer & state for holding the messages array
  const [state, dispatch] = useReducer(reducer, initialState);

  // when the app loads, fetch the current messages and load them into the state
  useEffect(() => {
    const messages = root.get(gunDataPath);
    messages.map().on((m) => {
      if (!!m) {
        dispatch({
          username: m.username,
          message: m.message,
          createdAt: m.createdAt,
        });
        //find all existing usernames here to avoid conflict when we set our name
        takenUsernames.add(m.username);
      }
    });
  }, []);

  // set a new message in gun, update the local state to reset the form field
  function saveMessage() {
    if (!formState.username) {
      window.alert("You must set a name!");
      return;
    }
    // user can only set their name to something that no one else has taken
    // users can use their old username from the same session
    if (takenUsernames.has(formState.username) && !myUsernames.has(formState.username)) {
      window.alert("This name is already taken, please choose a new one!");
      return;
    }
    if (!formState.message) {
      window.alert("You can't send a blank message!");
      return;
    }
    myUsernames.add(formState.username);
    const messages = root.get(gunDataPath);
    messages.set({
      username: formState.username,
      message: formState.message,
      createdAt: Date.now(),
    });
    setFormState({
      username: formState.username,
      message: "",
    });
    dummy.current.scrollIntoView({
      behavior: "smooth",
    });
  }

  // based on username, display message bubbles to left or right side of screen
  const getMessageBubbleClass = (username) => {
    if (myUsernames.has(username)) {
      return "message-bubble my-message";
    }
    return "message-bubble others-message";
  };

  // update the form state as the user types
  function onChange(e) {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  }

  return (
    <div>
      <div className="message-container">
        {new Set(state.messages
          .map((message) => (
            <div
              className={getMessageBubbleClass(message.username)}
              key={message.createdAt}
            >
              <h3>
                {message.username}: {message.message}
              </h3>
              <p>
                Date: {moment(message.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
              </p>
            </div>
          ))
          .sort((message) => message.createdAt)
          .reverse())}
        <span ref={dummy}> </span>
      </div>
      <div className="user-input-fields">
        <span> Posting as: </span>
        <input
          onChange={onChange}
          placeholder="Name"
          name="username"
          value={formState.username}
        />
        <br />
        <textarea
          className="message-textbox"
          onChange={onChange}
          placeholder="Message"
          name="message"
          value={formState.message}
        />
        <button onClick={saveMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
}
