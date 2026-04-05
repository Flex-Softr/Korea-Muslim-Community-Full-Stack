import { HomeActions } from "./components/home-actions";
import { HomeHero } from "./components/home-hero";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 sm:py-32">
      <HomeHero />
      <HomeActions />
    </div>
  );
}
