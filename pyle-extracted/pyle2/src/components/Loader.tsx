import { useEffect, useState } from "react";

const WORD = [
  { char: "P", cls: "text-pink" },
  { char: "Y", cls: "text-pink" },
  { char: "L", cls: "text-forest" },
  { char: "E", cls: "text-forest" },
];

export default function Loader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (count < WORD.length) {
      const t = setTimeout(() => setCount(c => c + 1), 220);
      return () => clearTimeout(t);
    } else {
      // hold for 400ms then fade out
      const t1 = setTimeout(() => setFading(true), 400);
      const t2 = setTimeout(() => { setDone(true); onDone(); }, 850);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [count, onDone]);

  if (done) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] bg-white flex items-center justify-center transition-opacity duration-500 ${fading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-0 select-none">
        {WORD.map((l, i) => (
          <span
            key={l.char}
            className={`font-bold text-6xl leading-none tracking-tight transition-all duration-200 ${l.cls} ${i < count ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
            style={{ transitionDelay: `${i * 20}ms` }}
          >
            {l.char}
          </span>
        ))}
        {/* blinking cursor — visible while typing, hidden once done */}
        <span className={`ml-1 w-[3px] h-12 bg-pink rounded-full ${count >= WORD.length ? "opacity-0" : "animate-blink"}`} />
      </div>
    </div>
  );
}
