import { ApprovalIcon } from './ApprovalIcon'

interface ApprovalPaginationProps {
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function ApprovalPagination({ total, page, pageSize, onPageChange, onPageSizeChange }: ApprovalPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const first = total ? (page - 1) * pageSize + 1 : 0
  const last = Math.min(page * pageSize, total)
  const firstPage = Math.max(1, Math.min(page - 2, pageCount - 4))
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, index) => firstPage + index)
  return <footer className="approval-pagination">
    <span>Showing {first}–{last} of {total} requests</span>
    <div className="approval-pagination__controls">
      <label>Rows per page <select aria-label="Rows per page" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}><option value={8}>8</option><option value={16}>16</option><option value={24}>24</option></select></label>
      <nav aria-label="Request pages">
        <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onPageChange(page - 1)}><ApprovalIcon name="chevron-left" size={17} /></button>
        {pages.map((pageNumber) => <button type="button" key={pageNumber} aria-label={`Page ${pageNumber}`} aria-current={pageNumber === page ? 'page' : undefined} onClick={() => onPageChange(pageNumber)}>{pageNumber}</button>)}
        <button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}><ApprovalIcon name="chevron-right" size={17} /></button>
      </nav>
    </div>
  </footer>
}
