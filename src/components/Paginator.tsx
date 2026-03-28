interface PaginatorProps {
  page: number;
  hasMore: boolean;
  onChange: (page: number) => void;
}

export function Paginator({ page, hasMore, onChange }: PaginatorProps) {
  return (
    <div className="paginator">
      <button type="button" className="ghost-button ghost-button--outlined" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span className="paginator__label">Page {page}</span>
      <button type="button" className="ghost-button ghost-button--outlined" disabled={!hasMore} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
