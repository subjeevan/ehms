export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  const pages = []
  const start = Math.max(0, page - 2)
  const end = Math.min(totalPages - 1, page + 2)
  for (let current = start; current <= end; current += 1) pages.push(current)

  return (
    <nav className="pagination" aria-label="Patient list pagination">
      <button type="button" disabled={page === 0} onClick={() => onPageChange(page - 1)}>Previous</button>
      {start > 0 && <span>…</span>}
      {pages.map((number) => (
        <button
          type="button"
          key={number}
          className={number === page ? 'active' : ''}
          aria-current={number === page ? 'page' : undefined}
          onClick={() => onPageChange(number)}
        >
          {number + 1}
        </button>
      ))}
      {end < totalPages - 1 && <span>…</span>}
      <button type="button" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>Next</button>
    </nav>
  )
}
