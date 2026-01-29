export default function AppHeader() {
  return (
    <header className="flex items-center justify-center gap-3 mb-12">
      {/* Logo mark */}
      <div className="relative w-8 h-8 border-2 border-gray-900 rounded-sm flex items-center justify-center">
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
      </div>
      
      {/* App name */}
      <h1 className="text-xl font-semibold text-gray-900">Color Vibe</h1>
    </header>
  );
}
