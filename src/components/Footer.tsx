import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">BMFSBase</h3>
            <p className="text-gray-400">
              The ultimate fan resource for Billy Strings concerts, setlists, and community.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/concerts" className="hover:text-white">Concerts</a></li>
              <li><a href="/games" className="hover:text-white">Games</a></li>
              <li><a href="/community" className="hover:text-white">Community</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="https://github.com/bmfsbase" 
                 className="text-gray-400 hover:text-white"
                 target="_blank"
                 rel="noopener noreferrer">
                <Github size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} BMFSBase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}