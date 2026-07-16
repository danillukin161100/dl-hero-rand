import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import "./App.css";
import { getRandomHero, getRandomSelection } from "./helper";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import { Card } from "./components/Card/Card";
import { Exclusions } from "./components/Exclusions/Exclusions";
import { useAppDispatch, useAppSelector } from "./store/store";
import {
  addExcludedIds,
  clearExcludedIds,
  clearRandomHeroes,
  loadHeroes,
  removeExcludedIds,
  setPlayers,
  setRandomHeroes,
  updateRandomHero,
} from "./store/heroes/heroes.action";
import {
  clearErrorMessage,
  setErrorMessage,
} from "./store/global/global.action";
import { getAvailableHeroes } from "./store/heroes/heroes.reducer";
import type { Hero } from "./types";
import { fetchGuildMembers } from "./store/discord/discord.action";
import { UserAutocomplete } from "./components/UserAutocomplete/UserAutocomplete";

function App() {
  const dispatch = useAppDispatch();

  const { heroes, randomHeroes, excludedIds, players } = useAppSelector(
    (state) => state.heroes,
  );
  const { error } = useAppSelector((state) => state.global);
  const availableHeroes = useAppSelector(getAvailableHeroes);

  const [count, setCount] = useState(players.length > 0 ? players.length : 4);
  const [isShowRightSide, setShowRightSide] = useState(true);
  const delayRef = useRef<number | null>(null);

  const setError = useCallback(
    (message: string) => {
      if (delayRef.current) clearTimeout(delayRef.current);
      dispatch(setErrorMessage(message));

      delayRef.current = setTimeout(() => {
        dispatch(clearErrorMessage());
      }, 3000);
    },
    [dispatch],
  );

  // Функция для получения случайных объектов
  const getRandomItems = useCallback(() => {
    dispatch(clearErrorMessage());

    // Проверяем, достаточно ли объектов доступно
    if (availableHeroes.length < count) {
      setError(
        availableHeroes.length === 0
          ? "Нет доступных персонажей"
          : `Недостаточно объектов. Доступно: ${availableHeroes.length}, запрошено: ${count}`,
      );
      return;
    }

    // Получаем случайные объекты и добавляем выбранные ID в исключения
    const selected = getRandomSelection(availableHeroes, count);
    dispatch(setRandomHeroes(selected));
    dispatch(addExcludedIds(selected.map((t) => t.id)));
  }, [availableHeroes, count, dispatch, setError]);

  // Функция для сброса исключений
  const resetExclusions = () => {
    dispatch(clearExcludedIds());
    dispatch(clearRandomHeroes());
    dispatch(clearErrorMessage());
  };

  // Функция для рерола конкретного героя
  const rerollHero = (heroId: Hero["id"]) => {
    dispatch(clearErrorMessage());

    const currentHero = randomHeroes.find((t) => t.id === heroId);
    if (!currentHero) return;

    // Если нет доступных объектов для рерола
    if (availableHeroes.length <= 1) {
      dispatch(setErrorMessage("Нет доступных объектов для рерола"));
      return;
    }

    // Получаем случайный объект, исключая текущий
    const itemsWithoutCurrent = availableHeroes.filter(
      (item) => item.id !== currentHero.id,
    );

    if (itemsWithoutCurrent.length === 0) {
      dispatch(setErrorMessage("Нет других доступных объектов"));
      return;
    }

    const newHero = getRandomHero(itemsWithoutCurrent);

    // Обновляем массив randomItems
    dispatch(updateRandomHero({ heroId, newHero }));

    // Обновляем excludedIds: удаляем старый ID, добавляем новый
    dispatch(removeExcludedIds([currentHero.id]));
    dispatch(addExcludedIds([newHero.id]));
  };

  const showRightSideHandler = () => {
    setShowRightSide((prev) => !prev);
  };

  const changePlayersHandler = (value: string) => {
    const val = value.split("\n").map((line) => line.trim());
    dispatch(setPlayers(val));
    setCount(val.length);
  };

  const onChangeCount = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setCount(val);
  };

  useEffect(() => {
    dispatch(loadHeroes());
    dispatch(fetchGuildMembers());
  }, [dispatch]);

  return (
    <div className="app">
      <div className="left-side">
        <form name="rollForm" className="form-roll">
          <div className="controls">
            <div className="input-group">
              <label htmlFor="count">Количество персонажей:</label>
              <input
                id="count"
                type="number"
                min="1"
                max={heroes.length}
                value={count}
                onChange={onChangeCount}
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
            <UserAutocomplete
              multiUsers
              value={players.join("\n")}
              onChange={changePlayersHandler}
              label="Игроки:"
              rows={4}
            />
          </div>
        </form>

        <div className="results">
          <h2>Случайные герои:</h2>
          <div className="items-grid scrollbar-slim">
            {randomHeroes.map((item, index) => (
              <Card
                key={index}
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
            <Exclusions />

            <div className="stats">
              <p>Всего: {heroes.length}</p>
              <p>Доступно: {heroes.length - excludedIds.length}</p>
              <p>Исключено: {excludedIds.length}</p>
            </div>
          </>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default App;
