export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {children}
    </div>
  );
}
