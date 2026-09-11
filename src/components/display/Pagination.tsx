// components/ui/Pagination.tsx
import { cn } from "@/utils/cn";

export interface PaginationProps {
  /** Page actuellement affichée (1-indexed). */
  currentPage: number;
  /** Nombre de pages déjà récupérées côté client (ex: pages.length). */
  pageCount: number;
  /** Le serveur a-t-il encore des pages après la dernière connue ? */
  hasMore: boolean;
  /** Nombre d'entrées affichées, pour le libellé "Showing X entries". */
  entryCount: number;
  onSelectPage: (page: number) => void;
  onPrevious: () => void;
  /** N'est appelé que si `currentPage` est déjà la dernière page connue. */
  onNext: () => void;
  /**
   * "inset"  → footer sans fond/ombre, juste une bordure haute (utilisé
   *            quand le composant est déjà dans un container qui a ses
   *            propres bordures, ex: le pied d'un tableau).
   * "card"   → carte autonome avec bordure + ombre (utilisé quand la
   *            pagination flotte seule sous une grille de cartes).
   */
  variant?: "inset" | "card";
  /** Combre de pages visibles de chaque côté de la page courante. */
  siblingCount?: number;
  className?: string;
}

type PageToken = number | "ellipsis-start" | "ellipsis-end";

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Fenêtre de pagination classique : premier + dernier toujours visibles,
 * une fenêtre de `siblingCount` pages autour de la page courante, le reste
 * condensé en "...". Évite que la barre de pagination wrap sur plusieurs
 * lignes une fois qu'on a accumulé beaucoup de pages côté client.
 */
function getPageTokens(
  current: number,
  total: number,
  siblingCount: number,
): PageToken[] {
  const totalVisible = siblingCount * 2 + 4;

  if (total <= totalVisible) {
    return range(1, total);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, 3 + siblingCount * 2), "ellipsis-end", total];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    return [
      1,
      "ellipsis-start",
      ...range(total - (3 + siblingCount * 2) + 1, total),
    ];
  }

  return [
    1,
    "ellipsis-start",
    ...range(leftSibling, rightSibling),
    "ellipsis-end",
    total,
  ];
}

export function Pagination({
  currentPage,
  pageCount,
  hasMore,
  entryCount,
  onSelectPage,
  onPrevious,
  onNext,
  variant = "card",
  siblingCount = 1,
  className,
}: PaginationProps) {
  const safePageCount = Math.max(pageCount, 1);
  const tokens = getPageTokens(currentPage, safePageCount, siblingCount);

  // Ne retape le serveur que si on est déjà sur la dernière page connue —
  // sinon on navigue simplement vers une page déjà en cache.
  const handleNext = () => {
    if (currentPage < safePageCount) {
      onSelectPage(currentPage + 1);
    } else {
      onNext();
    }
  };

  const isNextDisabled = currentPage >= safePageCount && !hasMore;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-text-secondary",
        variant === "card" &&
          "rounded-xs border border-card-border bg-card-background-100 shadow-xs",
        variant === "inset" && "border-t border-card-border",
        className,
      )}
    >
      <span>Showing {entryCount} entries</span>

      <div className="flex items-center gap-1">
        <button
          disabled={currentPage === 1}
          onClick={onPrevious}
          className="rounded-xs px-2.5 py-1 text-text-secondary hover:bg-background-soft-100 disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-transparent"
        >
          Prev
        </button>

        {tokens.map((token, i) =>
          typeof token === "number" ? (
            <button
              key={token}
              onClick={() => onSelectPage(token)}
              className={cn(
                "rounded-xs px-2.5 py-1",
                token === currentPage
                  ? "bg-foreground-100 text-white-100"
                  : "text-text-secondary hover:bg-background-soft-100",
              )}
            >
              {token}
            </button>
          ) : (
            <span key={`${token}-${i}`} className="px-1 text-text-tertiary">
              ...
            </span>
          ),
        )}

        <button
          disabled={isNextDisabled}
          onClick={handleNext}
          className="rounded-xs px-2.5 py-1 text-text-secondary hover:bg-background-soft-100 disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-transparent"
        >
          Next
        </button>
      </div>
    </div>
  );
}
