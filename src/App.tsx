import { useRef, useState, type ChangeEvent } from "react";
import "./App.css";
import data from "./assets/heroes.json";
import type { Hero } from "./types";
import { getRandomHero, getRandomSelection } from "./helper";
import { GrUpdate } from "react-icons/gr";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";

function App() {
  const [randomItems, setRandomItems] = useState<Hero[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set());
  const [count, setCount] = useState(4);
  const [error, setError] = useState("");
  const [isShowRightSide, setShowRightSide] = useState(true);

  const playersRef = useRef<HTMLTextAreaElement>(null);

  // Функция для получения случайных объектов
  const getRandomItems = async () => {
    setError("");

    // Проверяем, достаточно ли объектов доступно
    const availableItems = data.filter((item) => !excludedIds.has(item.id));

    if (availableItems.length < count) {
      setError(
        `Недостаточно объектов. Доступно: ${availableItems.length}, запрошено: ${count}`
      );
      return;
    }

    // Получаем случайные объекты
    const selected = await getRandomSelection(availableItems, count);

    setRandomItems(selected);

    // Добавляем выбранные ID в исключения
    const newExcludedIds = new Set(excludedIds);
    selected.forEach((item) => newExcludedIds.add(item.id));
    setExcludedIds(newExcludedIds);
  };

  // Функция для сброса исключений
  const resetExclusions = () => {
    setExcludedIds(new Set());
    setRandomItems([]);
    setError("");
  };

  // Функция для удаления конкретного объекта из исключений
  const removeFromExclusions = (id: number) => {
    const newExcludedIds = new Set(excludedIds);
    newExcludedIds.delete(id);
    setExcludedIds(newExcludedIds);
  };

  // Функция для рерола конкретного героя
  const rerollHero = async (index: number) => {
    setError("");

    const currentHero = randomItems[index];

    // Доступные объекты для рерола (все, кроме исключенных + текущий)
    const availableItems = data.filter(
      (item) => !excludedIds.has(item.id) || item.id === currentHero.id
    );

    // Если нет доступных объектов для рерола
    if (availableItems.length <= 1) {
      setError("Нет доступных объектов для рерола");
      return;
    }

    // Получаем случайный объект, исключая текущий
    const itemsWithoutCurrent = availableItems.filter(
      (item) => item.id !== currentHero.id
    );

    if (itemsWithoutCurrent.length === 0) {
      setError("Нет других доступных объектов");
      return;
    }

    const newHero = await getRandomHero(itemsWithoutCurrent);

    // Обновляем массив randomItems
    const updatedItems = [...randomItems];
    updatedItems[index] = newHero;
    setRandomItems(updatedItems);

    // Обновляем excludedIds: удаляем старый ID, добавляем новый
    const newExcludedIds = new Set(excludedIds);
    newExcludedIds.delete(currentHero.id);
    newExcludedIds.add(newHero.id);
    setExcludedIds(newExcludedIds);
  };

  const showRightSideHandler = () => {
    setShowRightSide((prev) => !prev);
  };

  const changePlayersHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { current: ref } = playersRef;
    const val = e.target.value.split("\n").map((line) => line.trim());

    if (ref) {
      ref.innerText = e.target.value;
    }

    setPlayers(val);
    setCount(val.length);
  };

  return (
    <div className="app">
      <div className="left-side">
        <div className="controls">
          <div className="input-group">
            <label htmlFor="count">Количество персонажей:</label>
            <input
              id="count"
              type="number"
              min="1"
              max={data.length}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="buttons">
            <button onClick={getRandomItems} className="btn-primary">
              Получить случайных персонажей
            </button>
            <button onClick={resetExclusions} className="btn-secondary">
              Сбросить исключения
            </button>
          </div>
        </div>

        <div className="controls">
          <div className="input-group input-group__players">
            <label htmlFor="count">Игроки:</label>
            <textarea
              onChange={changePlayersHandler}
              name="players"
              rows={4}
              ref={playersRef}
            ></textarea>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="results">
          <h2>Случайные герои:</h2>
          <div className="items-grid">
            {randomItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="item-card">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="item-avatar"
                />
                <div className="item-info">
                  {players[index] && (
                    <h3 className="item-player">{players[index]}</h3>
                  )}
                  <h3 className="item-name">{item.name}</h3>
                  <button
                    onClick={() => rerollHero(index)}
                    className="btn-reroll"
                    title="Получить другого случайного героя"
                  >
                    <GrUpdate />
                  </button>
                  <p className="item-id">ID: {item.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="right-side--toggler" onClick={showRightSideHandler}>
        {isShowRightSide ? <IoMdArrowDropright /> : <IoMdArrowDropleft />}
      </button>

      {isShowRightSide && (
        <div className="right-side">
          <div className="exclusions">
            {excludedIds.size > 0 ? (
              <div className="excluded-list">
                {data
                  .filter((item) => excludedIds.has(item.id))
                  .map((item) => (
                    <div key={item.id} className="excluded-item">
                      <span>
                        {item.name} (ID: {item.id})
                      </span>
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

          <div className="stats">
            <p>Всего персонажей: {data.length}</p>
            <p>Доступно персонажей: {data.length - excludedIds.size}</p>
            <p>Исключено персонажей: {excludedIds.size}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
