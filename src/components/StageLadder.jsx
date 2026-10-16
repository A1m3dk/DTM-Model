import { STAGES } from "../lib/dtm.js";

// The five stages as a row. The country's current stage is filled with its colour.
export default function StageLadder({ stage }) {
  return (
    <ol className="ladder" aria-label="The five stages">
      {Object.values(STAGES).map(s => {
        const on = s.id === stage;
        return (
          <li key={s.id} className={on ? "on" : ""} style={on ? { background: s.color, color: s.ink, borderColor: s.color } : { borderColor: s.color }} aria-current={on ? "step" : undefined}>
            <span className="num">{s.id}</span>
            <b>{s.name}</b>
            <small>{s.tag}</small>
          </li>
        );
      })}
    </ol>
  );
}
