'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm">
            <span className="text-gray-600 font-medium">
              © {currentYear} Coconut Lab
            </span>
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-gray-500">
              Crafted with <span className="text-red-500">❤️</span> by hacklab.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
