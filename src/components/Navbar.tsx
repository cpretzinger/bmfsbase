import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Music, GamepadIcon, Users, User, LogOut } from 'lucide-react';
import { authService } from '../services/authService';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl">BMFSBase</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/concerts" className="flex items-center space-x-1 hover:text-blue-200">
              <Music size={20} />
              <span>Concerts</span>
            </Link>
            <Link to="/games" className="flex items-center space-x-1 hover:text-blue-200">
              <GamepadIcon size={20} />
              <span>Games</span>
            </Link>
            <Link to="/community" className="flex items-center space-x-1 hover:text-blue-200">
              <Users size={20} />
              <span>Community</span>
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="flex items-center space-x-1 hover:text-blue-200">
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 hover:text-blue-200"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}