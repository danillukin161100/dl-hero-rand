import type { FC } from "react";
import data from "../../assets/heroes.json";
import { getHeroImage } from "../../helper";

export interface ExclusionsProps {
  excludedIds: Set<number>;
  removeFromExclusions: (id: number) => void;
}

export const Exclusions: FC<ExclusionsProps> = ({
  excludedIds,
  removeFromExclusions,
}) => {
  return (
    <div className="exclusions">
      {excludedIds.size > 0 ? (
        <div className="excluded-list">
          {data
            .filter((item) => excludedIds.has(item.id))
            .map((item) => (
              <div key={item.id} className="excluded-item">
                <img
                  src={getHeroImage(item.avatar)}
                  alt={item.name}
                  className="excluded-item__avatar"
                />
                <span>{item.name}</span>
                <button
                  onClick={() => removeFromExclusions(item.id)}
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
