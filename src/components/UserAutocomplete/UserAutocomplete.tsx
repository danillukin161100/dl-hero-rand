import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useAppSelector } from "../../store/store";
import { getDiscordMembersWithoutBots } from "../../store/discord/discord.reducer";
import { DiscordApiService } from "../../services/DiscordApi.service";
import "./UserAutocomplete.css";

interface UserAutocompleteProps {
  /** Single-line input (false) or multi-line textarea (true) */
  multiUsers?: boolean;
  /** Current value(s) as a string. For multiUsers, lines separated by newline. */
  value: string;
  /** Called when the value changes. For multiUsers, lines are separated by newline. */
  onChange: (value: string) => void;
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum rows for textarea (only used when multiUsers is true) */
  rows?: number;
}

interface Suggestion {
  label: string;
  value: string;
  searchText: string;
}

export const UserAutocomplete = ({
  multiUsers = false,
  value,
  onChange,
  label = "Пользователи:",
  placeholder,
  rows = 4,
}: UserAutocompleteProps) => {
  const discordMembers = useAppSelector(getDiscordMembersWithoutBots);

  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>(
    [],
  );
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [dropdownTop, setDropdownTop] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const lineHeightRef = useRef(0);

  // Синхронизируем inputValue с внешним value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Закрываем подсказки при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Общий список подсказок из Discord-пользователей
  const suggestions = useMemo<Suggestion[]>(() => {
    return discordMembers.map((m) => {
      const displayName = DiscordApiService.getDisplayName(m);
      // Собираем все доступные имена для поиска
      const searchParts = [
        m.user.username,
        m.user.global_name,
        m.nick,
      ].filter(Boolean) as string[];
      return {
        label: displayName,
        value: displayName,
        searchText: searchParts.join(" ").toLowerCase(),
      };
    });
  }, [discordMembers]);

  // Получить текущее слово под курсором
  const getCurrentWord = useCallback(
    (cursorPos: number): { word: string; startIdx: number } => {
      if (multiUsers) {
        // Для textarea: ищем слово на текущей строке (разделитель — пробел)
        const beforeCursor = inputValue.slice(0, cursorPos);
        const lineStart = beforeCursor.lastIndexOf("\n") + 1;
        const line = inputValue.slice(lineStart, cursorPos);
        const wordStart = line.lastIndexOf(" ") + 1;
        return {
          word: line.slice(wordStart),
          startIdx: lineStart + wordStart,
        };
      } else {
        // Для input: всё значение — это одно слово
        return { word: inputValue, startIdx: 0 };
      }
    },
    [inputValue, multiUsers],
  );

  // Вычисляем позицию для выпадающего списка под текущей строкой
  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current || !multiUsers) return;

    const textarea = inputRef.current as HTMLTextAreaElement;
    const cursorPos = textarea.selectionStart ?? 0;
    const textBeforeCursor = textarea.value.slice(0, cursorPos);
    const currentLineIndex = textBeforeCursor.split("\n").length - 1;

    // Вычисляем высоту одной строки
    if (!lineHeightRef.current) {
      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = computedStyle.lineHeight;
      lineHeightRef.current = lineHeight === "normal"
        ? parseFloat(computedStyle.fontSize) * 1.4
        : parseFloat(lineHeight);
    }

    // top = высота label + отступ + (номер строки * высота строки) + доп. отступ снизу
    const labelHeight = wrapperRef.current?.querySelector("label")?.offsetHeight ?? 0;
    const paddingTop = 8; // padding у textarea
    const top = labelHeight + 5 + paddingTop + currentLineIndex * lineHeightRef.current + 4;

    setDropdownTop(top);
  }, [multiUsers]);

  // Фильтрация подсказок на основе введённого текста
  const filterSuggestions = useCallback(
    (word: string) => {
      if (!word.trim()) {
        setFilteredSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const lowerWord = word.toLowerCase();
      const filtered = suggestions.filter((s) =>
        s.searchText.includes(lowerWord),
      );

      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && filtered.length < suggestions.length);
      setActiveSuggestionIndex(0);

      // Обновляем позицию дропдауна после открытия
      if (filtered.length > 0 && filtered.length < suggestions.length) {
        requestAnimationFrame(updateDropdownPosition);
      }
    },
    [suggestions, updateDropdownPosition],
  );

  // Обработка ввода
  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    if (multiUsers) {
      const cursorPos = e.target.selectionStart ?? 0;
      const { word } = getCurrentWord(cursorPos);
      filterSuggestions(word);
    } else {
      filterSuggestions(newValue);
    }
  };

  // Вставка выбранной подсказки
  const applySuggestion = useCallback(
    (suggestion: Suggestion) => {
      if (multiUsers) {
        const cursorPos =
          (inputRef.current as HTMLTextAreaElement)?.selectionStart ?? 0;
        const { word, startIdx } = getCurrentWord(cursorPos);

        // Заменяем текущее слово на выбранное + пробел
        const before = inputValue.slice(0, startIdx);
        const after = inputValue.slice(startIdx + word.length);
        const newValue = before + suggestion.value + " " + after;

        setInputValue(newValue);
        onChange(newValue);
      } else {
        setInputValue(suggestion.value);
        onChange(suggestion.value);
      }

      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
      inputRef.current?.focus();
    },
    [inputValue, multiUsers, onChange, getCurrentWord],
  );

  // Клавиатурная навигация
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1,
        );
        break;
      case "Enter":
      case "Tab":
        if (activeSuggestionIndex >= 0) {
          e.preventDefault();
          applySuggestion(filteredSuggestions[activeSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    applySuggestion(suggestion);
  };

  const inputProps = {
    value: inputValue,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onFocus: () => {
      if (multiUsers) {
        const cursorPos =
          (inputRef.current as HTMLTextAreaElement)?.selectionStart ?? 0;
        const { word } = getCurrentWord(cursorPos);
        filterSuggestions(word);
      } else {
        filterSuggestions(inputValue);
      }
    },
    placeholder,
  };

  return (
    <div className="user-autocomplete-wrapper" ref={wrapperRef}>
      {label && <label>{label}</label>}

      {multiUsers ? (
        <textarea
          {...inputProps}
          ref={inputRef as React.Ref<HTMLTextAreaElement>}
          name="players"
          rows={rows}
        />
      ) : (
        <input
          {...inputProps}
          ref={inputRef as React.Ref<HTMLInputElement>}
          type="text"
        />
      )}

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="autocomplete-list" style={{ top: multiUsers ? dropdownTop : "100%" }}>
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={suggestion.value}
              className={`autocomplete-item ${
                index === activeSuggestionIndex ? "autocomplete-item--active" : ""
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionClick(suggestion);
              }}
            >
              {suggestion.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};