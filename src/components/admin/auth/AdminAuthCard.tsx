
type AdminAuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AdminAuthCard({
  title,
  subtitle,
  children,
}: AdminAuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-admin-muted to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600/70">
            Admin Panel
          </p>
          <p className="mt-1 text-xl font-bold text-blue-950">Vrindavan Rasa</p>
        </div>

        <div className="rounded-2xl border border-admin-border bg-white p-8 shadow-lg shadow-blue-900/5">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-blue-950">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
