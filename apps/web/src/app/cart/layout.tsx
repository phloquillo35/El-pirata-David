export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {children}
    </div>
  );
}
