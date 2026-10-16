import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./styles.css";
import App from "./App.jsx";
import { DataProvider } from "./state/DataContext.jsx";
import { UIProvider } from "./state/UI.jsx";

// HashRouter keeps the site working on any static host and under VS Code Live Server
// without extra server settings. Page addresses look like /#/country/BRA.
createRoot(document.getElementById("root")).render(
  <HashRouter>
    <DataProvider>
      <UIProvider>
        <App />
      </UIProvider>
    </DataProvider>
  </HashRouter>
);
