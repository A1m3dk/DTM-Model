import { Link, Route, Routes } from "react-router-dom";
import { useData } from "./state/DataContext.jsx";
import Topbar from "./components/Topbar.jsx";
import Home from "./pages/Home.jsx";
import CountryPage from "./pages/CountryPage.jsx";

function Splash() {
  return (
    <div className="splash" role="status">
      <div className="splash-bars" aria-hidden="true"><i /><i /><i /></div>
      <p>Loading the world's population data</p>
    </div>
  );
}

function Problem({ error, retry }) {
  return (
    <div className="splash">
      <div className="err-box" role="alert">
        <b>The map could not load.</b>
        <p>{error}</p>
        <button className="btn" onClick={retry}>Try again</button>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="splash">
      <div className="err-box">
        <b>That page does not exist.</b>
        <Link className="btn" to="/">Back to the world map</Link>
      </div>
    </div>
  );
}

export default function App() {
  const { status, error, retry } = useData();
  return (
    <>
      <a className="skip" href="#main">Skip to the content</a>
      <Topbar />
      <main id="main">
        {status === "loading" && <Splash />}
        {status === "error" && <Problem error={error} retry={retry} />}
        {status === "ready" && (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/country/:iso" element={<CountryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </main>
    </>
  );
}
