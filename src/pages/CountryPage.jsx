import { useEffect, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useData } from "../state/DataContext.jsx";
import { useUI } from "../state/UI.jsx";
import { useCountryData } from "../state/useCountryData.js";
import { STAGES } from "../lib/dtm.js";
import { NOTES } from "../lib/notes.js";
import { dataInsights } from "../lib/insights.js";
import { verdict } from "../lib/verdict.js";
import StageLadder from "../components/StageLadder.jsx";
import Flag from "../components/Flag.jsx";
import Silhouette from "../components/Silhouette.jsx";
import SearchBox from "../components/SearchBox.jsx";
import Pyramid from "../components/Pyramid.jsx";
import KeyNumbers from "../components/KeyNumbers.jsx";
import StoryChart from "../components/StoryChart.jsx";
import TrendChart from "../components/TrendChart.jsx";

function Loading({ text }) {
  return <div className="skeleton" role="status">{text}</div>;
}
function Failed({ error, onRetry }) {
  return (
    <div className="err-box" role="alert">
      <b>This page could not load its numbers.</b>
      <p>{error}</p>
      <button className="btn" onClick={onRetry}>Try again</button>
    </div>
  );
}

export default function CountryPage() {
  const { iso } = useParams();
  const [sp, setSp] = useSearchParams();
  const vsParam = sp.get("vs");
  const { hasData, stageFor, info, name, T } = useData();
  const { openHelp } = useUI();

  const ok = hasData(iso);
  const vs = vsParam && vsParam !== iso && hasData(vsParam) ? vsParam : null;
  const cur = useCountryData(ok ? iso : null);
  const cmp = useCountryData(vs);

  useEffect(() => { window.scrollTo(0, 0); }, [iso]);
  useEffect(() => {
    document.title = ok ? `${name(iso)} | DTM Atlas` : "DTM Atlas";
    return () => { document.title = "DTM Atlas: how every country's population is changing"; };
  }, [iso, ok, name]);

  const stage = ok ? stageFor(iso) : null;
  const meta = ok ? info(iso) : null;
  const s = cur.status === "ready" ? cur.data.s : null;
  const nm = ok ? name(iso) : iso;
  const cmpName = vs ? name(vs) : "";
  const cmpS = cmp.status === "ready" ? cmp.data.s : null;

  const insights = useMemo(() => (s ? dataInsights(nm, s, T) : []), [s, nm, T]);
  const text = s ? verdict(nm, stage, s) : "";

  if (!ok) {
    return (
      <div className="country">
        <div className="err-box">
          <b>There is no data for "{iso}".</b>
          <p>The World Bank does not publish birth and death figures for this place, or the address is wrong. Very small countries are not on this map.</p>
          <Link className="btn" to="/">Back to the world map</Link>
        </div>
      </div>
    );
  }

  const pickCompare = code => setSp({ vs: code }, { replace: true });
  const clearCompare = () => setSp({}, { replace: true });

  return (
    <div className="country">
      <section className="hero">
        <div className="hero-copy">
          <Link className="back" to="/">
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to the world map
          </Link>
          <div className="hero-id">
            <Flag iso2={meta.iso2} className="flag-xl" w={160} />
            <span className="hero-region">{meta.region}</span>
          </div>
          <h1>{nm}</h1>
          <StageLadder stage={stage} />
          {s ? <p className="verdict">{text}</p> : <Loading text="Loading the numbers…" />}
          <div className="compare">
            {vs ? (
              <p>Comparing with <b>{cmpName}</b> <button className="chip" onClick={clearCompare}>Stop comparing</button></p>
            ) : (
              <>
                <label className="compare-label" htmlFor="cmp-box">Want to compare it with another country?</label>
                <SearchBox onPick={pickCompare} exclude={iso} placeholder="Type a second country" label="Compare with another country" />
              </>
            )}
            {vs && cmp.status === "loading" && <p className="muted-small">Loading {cmpName}…</p>}
            {vs && cmp.status === "error" && <p className="muted-small">Could not load {cmpName}. {cmp.error}</p>}
          </div>
        </div>
        <div className="hero-art">
          <Silhouette iso={iso} color={stage ? STAGES[stage].color : "#c9d5de"} label={nm} />
          <dl className="facts">
            {meta.capital && (<><dt>Capital</dt><dd>{meta.capital}</dd></>)}
            {meta.income && (<><dt>Income group</dt><dd>{meta.income}</dd></>)}
          </dl>
        </div>
      </section>

      {cur.status === "loading" && <Loading text={`Loading ${nm}'s history. The first visit takes a few seconds, later visits are instant.`} />}
      {cur.status === "error" && <Failed error={cur.error} onRetry={cur.reload} />}

      {cur.status === "ready" && (
        <>
          <section className="block">
            <h2>Population pyramid</h2>
            <p className="sub">Each bar is a group of people of similar age, from babies at the bottom to the oldest at the top. Press Play to watch the shape change over time.</p>
            <Pyramid name={nm} data={cur.data} cmpName={cmpName} cmpData={cmp.status === "ready" ? cmp.data : null} />
          </section>

          <section className="block">
            <h2>The latest numbers</h2>
            <KeyNumbers s={s} />
          </section>

          <section className="block">
            <h2>Births and deaths over time</h2>
            <p className="sub">This is the heart of the model. Watch how the two lines move apart, then come back together.</p>
            <StoryChart name={nm} s={s} T={T} cmpName={cmpName} cmpS={cmpS} />
          </section>

          <section className="block two">
            <div className="box">
              <span className="tag tag-data">From the data</span>
              <h3>What the numbers show</h3>
              <ul className="plain">{insights.map(t => <li key={t}>{t}</li>)}</ul>
            </div>
            {NOTES[iso] && (
              <div className="box box-opinion">
                <span className="tag tag-opinion">Opinion, not data</span>
                <h3>Our reading</h3>
                <p>{NOTES[iso]}</p>
              </div>
            )}
          </section>

          <section className="block">
            <h2>Explore more charts</h2>
            <TrendChart name={nm} s={s} cmpName={cmpName} cmpS={cmpS} />
          </section>

          <section className="block about">
            <h2>About this page</h2>
            <p>
              The stage comes from one simple rule on birth and death rates. If births per 1,000 people are lower than deaths, the country is Shrinking. Otherwise it is Steady when births are under {T.s34}, Slowing down when under {T.s23}, and Booming above that. This rule is ours, not an official label.{" "}
              <button className="link" onClick={openHelp}>Read more or change the rule</button>
            </p>
            <ul className="plain">
              <li>Birth and death rates ignore migration and age. An older country can look "Shrinking" even if its women have a moderate number of babies.</li>
              <li>The fifth stage is not part of the original model and not every textbook uses it.</li>
              <li>Recent years can be estimates. Different measures have different latest years, shown on each number.</li>
            </ul>
            <p>
              Data: <a href="https://data.worldbank.org/" target="_blank" rel="noreferrer">World Bank Open Data</a>, which mostly republishes{" "}
              <a href="https://population.un.org/wpp/" target="_blank" rel="noreferrer">United Nations population estimates</a>.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
