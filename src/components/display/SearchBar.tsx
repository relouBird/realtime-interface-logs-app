import { useEffect, useRef, useState } from "react";

import { Search } from "lucide-react";

import { useUisfx } from "@/audio/useUisfx";

export function SearchBar({
  handleSearch,
}: {
  handleSearch: (textToSearch: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { play } = useUisfx();

  const [searchQuery, setSearchQuery] = useState("");

  /*  Ctrl + K / Cmd + K  Focus automatiquement la recherche. */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      if (!isShortcut) {
        return;
      }

      event.preventDefault();

      inputRef.current?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* Sons clavier. */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const ignoredKeys = ["Control", "Shift", "Alt", "Meta", "CapsLock", "Tab"];

    if (ignoredKeys.includes(event.key)) {
      return;
    }

    play("typing");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch(searchQuery);
      }}
      className="flex-1 max-w-md mx-8"
    >
      {" "}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-card-border" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search TxID, Account, or Amount..."
          className="max-w-100 w-100 pl-10 pr-4 py-2 border-1.5 border-card-border bg-white text-sm font-light placeholder:font-light focus:outline-none focus:ring focus:ring-primary-300"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute right-3 top-1/2 flex h-6 w-8 -translate-y-1/2 items-center justify-center rounded-[3px] border bg-background-soft-10 font-subtitle text-xs text-card-border">
          <p className="text-center">⌘K</p>
        </div>
      </div>
    </form>
  );
}
