export default function LinkShieldLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-background">
      {children}
    </div>
  );
}
