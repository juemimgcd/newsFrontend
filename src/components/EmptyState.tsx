interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="capsule">No data yet</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
