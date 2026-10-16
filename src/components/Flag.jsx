import { useState } from "react";

// Flags come from flagcdn.com. If one fails to load, a neutral block is shown instead.
export default function Flag({ iso2, w = 80, className = "" }) {
  const [bad, setBad] = useState(false);
  if (!iso2 || bad) return <span className={"flag flag-empty " + className} aria-hidden="true" />;
  return (
    <img
      className={"flag " + className}
      src={`https://flagcdn.com/w${w}/${iso2.toLowerCase()}.png`}
      alt=""
      loading="lazy"
      onError={() => setBad(true)}
    />
  );
}
