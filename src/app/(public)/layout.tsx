export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header>
        <nav>{/* Add navigation links */}</nav>
      </header>

      <main>{children}</main>

      <footer>{/* Add footer content */}</footer>
    </div>
  );
}
