import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ConcertsPage from './pages/ConcertsPage';
import ConcertDetailsPage from './pages/ConcertDetailsPage';
import GamesPage from './pages/GamesPage';
import CommunityPage from './pages/CommunityPage';
import NewPostPage from './pages/NewPostPage';
import PostDetailsPage from './pages/PostDetailsPage';
import ProfilePage from './pages/ProfilePage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/concerts" element={<ConcertsPage />} />
                <Route path="/concerts/:id" element={<ConcertDetailsPage />} />
                <Route path="/games" element={<GamesPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/community/new" element={<NewPostPage />} />
                <Route path="/community/posts/:id" element={<PostDetailsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;