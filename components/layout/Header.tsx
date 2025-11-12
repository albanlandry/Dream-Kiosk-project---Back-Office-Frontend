'use client';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-white px-6 shadow-sm">
      <div className="flex flex-1 items-center justify-between">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
        <div className="flex items-center gap-4">
          {/* Add notifications or other header items here */}
        </div>
      </div>
    </header>
  );
}

