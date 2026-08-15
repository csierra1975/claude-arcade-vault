import { Library } from "@/components/library";
import { GAMES, CATS } from "@/lib/games";

export default function Home() {
  return <Library games={GAMES} cats={CATS} />;
}
