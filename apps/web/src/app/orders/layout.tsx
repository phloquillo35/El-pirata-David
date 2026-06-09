export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {children}
    </div>
  );
}
