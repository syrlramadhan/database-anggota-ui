'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <div className="text-sm text-gray-600">
          © {currentYear} Coconut Lab • Crafted with ❤️ by hacklab.
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <a href="#" className="hover:text-blue-600 transition-colors">
            Bantuan
          </a>
          <a href="#" className="hover:text-blue-600 transition-colors">
            Kebijakan Privasi
          </a>
          <a href="#" className="hover:text-blue-600 transition-colors">
            Syarat & Ketentuan
          </a>
        </div>
      </div>
    </footer>
  );
}
