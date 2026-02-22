type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
};

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), Math.max(totalPages, 1));
}

function buildPageItems(currentPage: number, totalPages: number, maxVisible: number): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  const windowSize = Math.max(1, maxVisible);
  const halfWindow = Math.floor(windowSize / 2);
  let start = Math.max(1, currentPage - halfWindow);
  let end = start + windowSize - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - windowSize + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 3,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const safePage = clampPage(currentPage, totalPages);
  const pageItems = buildPageItems(safePage, totalPages, maxVisible);

  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-gray-200/70 p-1">
      <button
        type="button"
        onClick={() => onPageChange(safePage - 1)}
        disabled={safePage <= 1}
        className="inline-flex h-7 min-w-[52px] items-center justify-center rounded-md bg-gray-300 px-2 text-xs font-semibold text-gray-700 disabled:opacity-60"
      >
        Prev
      </button>

      {pageItems.map((item, idx) => {
        return (
          <button
            key={`${item}-${idx}`}
            type="button"
            onClick={() => onPageChange(item)}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold ${
              safePage === item ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
            }`}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(safePage + 1)}
        disabled={safePage >= totalPages}
        className="inline-flex h-7 min-w-[52px] items-center justify-center rounded-md bg-gray-300 px-2 text-xs font-semibold text-gray-700 disabled:opacity-60"
      >
        Next
      </button>
    </div>
  );
}
