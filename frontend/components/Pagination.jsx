"use client";

export default function Pagination({
  page,
  totalPages,
  onChange
}) {
  if (!totalPages || totalPages <= 1) return null;

  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, start + 4);
  const pages = [];
  for (let number = start; number <= end; number += 1) {
    pages.push(number);
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>
      {pages.map((number) => (
        <button
          type="button"
          key={number}
          className={number === page ? "active" : ""}
          onClick={() => onChange(number)}
        >
          {number + 1}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </nav>
  );
}
