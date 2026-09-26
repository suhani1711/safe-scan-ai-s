export function PageHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <header className="mb-8 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-2xl">{icon}</span>
      <h1 className="mt-4 text-3xl font-bold md:text-4xl">{title}</h1>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{subtitle}</p>
    </header>
  );
}
