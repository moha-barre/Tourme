import TourCard from "./TourCard";

const tournaments = [
  {
    imageUrl: "/images/1.jpeg",
    name: "Champions League",
    description: "Europe's top football clubs compete for glory in this prestigious tournament.",
    type: "Football",
    playersCount: 32,
    status: "Starts in 3 Days",
  },
  {
    imageUrl: "/images/2.jpeg",
    name: "Grandmaster Showdown",
    description: "Elite chess players battle for the ultimate checkmate.",
    type: "Chess",
    playersCount: 16,
    status: "Ongoing",
  },
  {
    imageUrl: "/images/3.jpeg",
    name: "eSports Arena",
    description: "Top gamers face off in a high-stakes eSports tournament.",
    type: "eSports",
    playersCount: 24,
    status: "Finals Soon",
  },
  {
    imageUrl: "/images/4.jpeg",
    name: "Legends Cup",
    description: "A legendary football tournament for the ages.",
    type: "Football",
    playersCount: 20,
    status: "Registration Open",
  },
  {
    imageUrl: "/images/5..jpeg",
    name: "Mind Masters",
    description: "A chess tournament for strategic masterminds.",
    type: "Chess",
    playersCount: 12,
    status: "Starts Tomorrow",
  },
  {
    imageUrl: "/images/6.jpeg",
    name: "Battle Royale Bash",
    description: "The ultimate eSports battle royale event.",
    type: "eSports",
    playersCount: 100,
    status: "Ongoing",
  },
];

const TournamentGrid = () => (
  <div className="w-full max-w-7xl mx-auto py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
    {tournaments.map((t, i) => (
      <TourCard
        key={i}
        imageUrl={t.imageUrl}
        name={t.name}
        description={t.description}
        type={t.type}
        playersCount={t.playersCount}
        status={t.status}
        onView={() => {}}
        onJoin={() => {}}
      />
    ))}
  </div>
);

export default TournamentGrid; 