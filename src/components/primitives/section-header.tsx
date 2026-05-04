interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}

export function SectionHeader({ eyebrow, title, action }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        {eyebrow && (
          <div className="label-eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>
        )}
        <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.005em' }}>{title}</div>
      </div>
      {action}
    </div>
  );
}
