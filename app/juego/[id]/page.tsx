import { notFound } from "next/navigation";
import { GameDetail } from "@/components/game-detail";
import { GAMES, getGame, seededScores } from "@/lib/games";

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: PageProps<"/juego/[id]">) {
  const { id } = await params;
  const game = getGame(id);
  return { title: game ? `${game.title} · Arcade Vault` : "Arcade Vault" };
}

export default async function GameDetailPage({ params }: PageProps<"/juego/[id]">) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();

  const scores = seededScores(id.length * 17 + 3, 10);

  return <GameDetail game={game} scores={scores} />;
}
