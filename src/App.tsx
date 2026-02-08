import { useRef, useState, type ChangeEvent } from "react";
import "./App.css";
import data from "./assets/heroes.json";
import type { Hero } from "./types";
import { getRandomHero, getRandomSelection } from "./helper";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { Card } from "./components/Card/Card";
import { Exclusions } from "./components/Exclusions/Exclusions";

function App() {
  const [randomItems, setRandomItems] = useState<Hero[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set());
  const [count, setCount] = useState(4);
  const [error, setError] = useState("");
  const [isShowRightSide, setShowRightSide] = useState(true);
  const [playersTextareaRows, setplayersTextareaRows] = useState<number>(4);

  const playersRef = useRef<HTMLTextAreaElement>(null);

  // Функция для получения случайных объектов
  const getRandomItems = () => {
    setError("");

    // Проверяем, достаточно ли объектов доступно
    const availableItems = data.filter((item) => !excludedIds.has(item.id));

    if (availableItems.length < count) {
      setError(
        `Недостаточно объектов. Доступно: ${availableItems.length}, запрошено: ${count}`,
      );
      return;
    }

    // Получаем случайные объекты
    const selected = getRandomSelection(availableItems, count);

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
  const rerollHero = (index: number) => {
    setError("");

    const currentHero = randomItems[index];

    // Доступные объекты для рерола (все, кроме исключенных + текущий)
    const availableItems = data.filter(
      (item) => !excludedIds.has(item.id) || item.id === currentHero.id,
    );

    // Если нет доступных объектов для рерола
    if (availableItems.length <= 1) {
      setError("Нет доступных объектов для рерола");
      return;
    }

    // Получаем случайный объект, исключая текущий
    const itemsWithoutCurrent = availableItems.filter(
      (item) => item.id !== currentHero.id,
    );

    if (itemsWithoutCurrent.length === 0) {
      setError("Нет других доступных объектов");
      return;
    }

    const newHero = getRandomHero(itemsWithoutCurrent);

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
    setplayersTextareaRows(Math.max(val.length, 4));
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
              rows={playersTextareaRows}
              ref={playersRef}
            ></textarea>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="results">
          <h2>Случайные герои:</h2>
          <div className="items-grid">
            {randomItems.map((item, index) => (
              <Card
                hero={item}
                heroIndex={index}
                rerollHero={rerollHero}
                players={players}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        className={`right-side ${isShowRightSide ? "right-side--show" : "right-side--hide"}`}
      >
        <button className="right-side--toggler" onClick={showRightSideHandler}>
          {isShowRightSide ? <IoMdArrowDropright /> : <IoMdArrowDropleft />}
        </button>

        {isShowRightSide && (
          <>
            <Exclusions
              excludedIds={excludedIds}
              removeFromExclusions={removeFromExclusions}
            />

            <div className="stats">
              <p>Всего: {data.length}</p>
              <p>Доступно: {data.length - excludedIds.size}</p>
              <p>Исключено: {excludedIds.size}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
