import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCompass } from 'react-icons/fi';

const NotFound = () => (
  <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden px-4">
    <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl animate-blob" />
    <div className="absolute -bottom-24 -right-16 w-[28rem] h-[28rem] rounded-full bg-violet-500/20 blur-3xl animate-blob-slow" />
    <div className="relative text-center max-w-md animate-scale-in">
      <div className="mx-auto mb-6 w-16 h-16 rounded-2xl glass flex items-center justify-center shadow-large animate-float">
        <FiCompass className="w-8 h-8 text-primary-500" />
      </div>
      <h1 className="font-display text-[7rem] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-fuchsia-500 to-violet-500 bg-[length:200%_auto] animate-gradient-pan">
        404
      </h1>
      <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Looks like you're off the map</h2>
      <p className="mt-3 text-gray-600 dark:text-gray-400">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2 mt-8 !rounded-full">
        <FiArrowLeft /> Back to home
      </Link>
    </div>
  </section>
);

export default NotFound;
