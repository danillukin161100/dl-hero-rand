import type { FC } from "react";
import { GrUpdate } from "react-icons/gr";
import type { Hero } from "../../types";

export interface CardProps {
  hero: Hero;
  heroIndex: number;
  players: string[];
  rerollHero: (heroIndex: number) => void;
}

export const Card: FC<CardProps> = ({
  hero,
  heroIndex,
  players,
  rerollHero,
}) => {
  return (
    <div key={`${hero.id}-${heroIndex}`} className="item-card">
      <img src={hero.avatar} alt={hero.name} className="item-avatar" />
      <div className="item-info">
        {players[heroIndex] && (
          <h3 className="item-player">{players[heroIndex]}</h3>
        )}
        <h3 className="item-name">{hero.name}</h3>
        <button
          onClick={() => rerollHero(hero.id)}
          className="btn-reroll btn-secondary"
          title="Получить другого случайного героя"
        >
          <GrUpdate />
        </button>
        {/* <p className="item-id">ID: {hero.id}</p> */}
      </div>
    </div>
  );
};
