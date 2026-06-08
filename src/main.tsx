// main.tsx
// This is the very first file that runs. It finds the <div> in your HTML and puts the whole React app inside it.

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { store } from "./store";
import "./index.css";
import "./assets/styles/globals.css";

// Looks for the HTML element where the app should live. Tries "app" first, then "root".
const rootElement =
  document.getElementById("app") || document.getElementById("root");

// If we can't find the element, stop everything and show an error.
if (!rootElement) {
  throw new Error("Root element not found");
}

// Puts the whole app into the HTML element we found above.
// StrictMode = React's helper that warns you about mistakes during development.
// Provider = gives every page access to the Redux store (the app's memory).
// BrowserRouter = lets React read the URL and show the right page.
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);