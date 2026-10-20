import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-kh-cream flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-extrabold text-kh-orange/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 bg-kh-orange text-white px-5 py-2.5 rounded-full font-medium hover:bg-kh-orange-dark transition-colors"
          >
            <Home size={16} />
            Go Home
          </Link>
          <Link
            to="/restaurants"
            className="flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-full font-medium border border-gray-200 hover:border-kh-orange transition-colors"
          >
            <Search size={16} />
            Browse Restaurants
          </Link>
        </div>
      </div>
    </div>
  );
}
