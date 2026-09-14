function StatusBadge({ aberto }) {
  if (!aberto) return null;
  return (
    <span className="sage-status">
      <span aria-hidden="true" />
      Inscrições abertas
    </span>
  );
}

export default StatusBadge;
