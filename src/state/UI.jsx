import { createContext, useContext, useMemo, useState } from "react";
import Explainer from "../components/Explainer.jsx";

const UI = createContext({ openHelp: () => {} });
export const useUI = () => useContext(UI);

export function UIProvider({ children }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ openHelp: () => setOpen(true) }), []);
  return (
    <UI.Provider value={value}>
      {children}
      {open && <Explainer onClose={() => setOpen(false)} />}
    </UI.Provider>
  );
}
