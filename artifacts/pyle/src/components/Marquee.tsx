const PHRASES = [
  "Buy anything", "Sell anything",
  "One marketplace for commerce",
  "Artist marketplace — coming soon",
  "Influencer hub — coming soon",
  "Fast checkout · Secure payments",
  "Built for buyers and sellers",
  "Nigeria's marketplace",
];

export default function Marquee() {
  const group = (
    <span className="flex items-center shrink-0">
      {PHRASES.map((p, i) => (
        <span key={i} className="flex items-center gap-5 px-5 text-white font-medium text-[13.5px] whitespace-nowrap">
          <span className="w-1 h-1 rounded-full bg-pink inline-block flex-none" />
          {p}
        </span>
      ))}
    </span>
  );

  return (
    <div className="bg-forest overflow-hidden py-3">
      <div className="flex animate-marquee w-max">
        {group}{group}
      </div>
    </div>
  );
}
