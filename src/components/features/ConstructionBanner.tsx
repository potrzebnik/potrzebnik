export function ConstructionBanner() {
  return (
    <aside
      aria-label="Informacja o stanie serwisu"
      className="bg-construction-banner-bg text-construction-banner-fg flex flex-col items-center gap-x-10 gap-y-1 px-6 py-2 text-center sm:flex-row sm:justify-center"
    >
      <p className="text-lg font-semibold">Strona w budowie</p>
      <p className="text-sm">
        Trwają prace nad finalną odsłoną serwisu – startujemy już wkrótce!
      </p>
    </aside>
  );
}
