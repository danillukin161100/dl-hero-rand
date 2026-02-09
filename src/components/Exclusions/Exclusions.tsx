import type { FC } from "react";
import { getHeroImage } from "../../helper";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { removeExcludedIds } from "../../store/heroes/heroes.action";
import { getExcludedHeroes } from "../../store/heroes/heroes.reducer";

export const Exclusions: FC = () => {
  const dispatch = useAppDispatch();

  const { excludedIds } = useAppSelector((state) => state.heroes);
  const excludedHeroes = useAppSelector(getExcludedHeroes);

  // Функция для удаления конкретного объекта из исключений
  const removeFromExclusions = (id: number) => {
    dispatch(removeExcludedIds([id]));
  };

  return (
    <div className="exclusions">
      {excludedIds.length > 0 ? (
        <div className="excluded-list">
          {excludedHeroes.map((hero) => (
            <div key={hero.id} className="excluded-item">
              <img
                src={getHeroImage(hero.avatar)}
                alt={hero.name}
                className="excluded-item__avatar"
              />
              <span>{hero.name}</span>
              <button
                onClick={() => removeFromExclusions(hero.id)}
                className="btn-remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Нет исключенных объектов</p>
      )}
    </div>
  );
};
