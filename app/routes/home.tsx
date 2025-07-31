import type { Route } from "./+types/home";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import TournamentGrid from "../components/TournamentGrid";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tourme" },
    { name: "description", content: "Welcome to Tourme - Your Travel Companion!" },
  ];

}
export default function Home() {
  return (
      <div className="flex flex-col justify-center items-center mx-auto">
      <Navbar />
      <HeroSection />
      <TournamentGrid />
    </div>
  );

}
