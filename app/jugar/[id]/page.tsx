import { notFound } from "next/navigation";
import { GamePlayer } from "@/components/game-player";
import { GAMES, getGame } from "@/lib/games";

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: PageProps<"/jugar/[id]">) {
  const { id } = await params;
  const game = getGame(id);
  return { title: game ? `Jugando · ${game.title} · Arcade Vault` : "Arcade Vault" };
}

export default async function GamePlayerPage({ params }: PageProps<"/jugar/[id]">) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();

  return <GamePlayer game={game} />;
}
