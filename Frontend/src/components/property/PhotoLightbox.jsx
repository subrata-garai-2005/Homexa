import { useEffect, useState, useRef, useCallback } from 'react';
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiShare2,
  FiMaximize2,
  FiMinimize2,
  FiCheck
} from 'react-icons/fi';
import { toast } from '../../utils/toast';

const PhotoLightbox = ({ images = [], initialIndex = 0, isOpen, onClose, title = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const filmstripRef = useRef(null);
  const touchX = useRef(null);

  const total = images.length;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => setCurrentIndex(initialIndex), 0);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, initialIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex(i => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentIndex(i => (i - 1 + total) % total);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goNext, goPrev]);

  // Keep active thumbnail in view
  useEffect(() => {
    if (!filmstripRef.current) return;
    const activeThumb = filmstripRef.current.children[currentIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentIndex]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const diff = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) goNext();
      else goPrev();
    }
    touchX.current = null;
  };

  if (!isOpen || total === 0) return null;

  const currentImage = images[currentIndex]?.url || images[currentIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex flex-col justify-between animate-fade-in select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 text-white z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            aria-label="Close photo gallery"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm font-semibold tracking-wide line-clamp-1 max-w-[280px] sm:max-w-md">{title}</p>
            <p className="text-xs text-white/60">
              {currentIndex + 1} / {total} photos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            aria-label="Share photo"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-colors"
          >
            {copied ? <FiCheck className="w-4 h-4 text-emerald-400" /> : <FiShare2 className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            className="hidden sm:flex w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur items-center justify-center transition-colors"
          >
            {isFullscreen ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main photo view */}
      <div className="relative flex-1 flex items-center justify-center px-4 sm:px-16 overflow-hidden">
        {total > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous photo"
              className="absolute left-3 sm:left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white backdrop-blur flex items-center justify-center transition-all z-20 shadow-xl"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goNext}
              aria-label="Next photo"
              className="absolute right-3 sm:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white backdrop-blur flex items-center justify-center transition-all z-20 shadow-xl"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="relative max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center">
          <img
            key={currentIndex}
            src={currentImage}
            alt={`${title} - photo ${currentIndex + 1}`}
            className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl animate-scale-in"
          />
        </div>
      </div>

      {/* Bottom filmstrip */}
      <div className="px-4 sm:px-8 py-4 bg-gradient-to-t from-black/90 to-transparent z-20">
        <div
          ref={filmstripRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 max-w-4xl mx-auto justify-start sm:justify-center"
        >
          {images.map((img, i) => {
            const thumb = img?.thumbnailUrl || img?.url || img;
            const isActive = i === currentIndex;
            return (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`View photo ${i + 1}`}
                className={`relative shrink-0 w-16 h-12 rounded-xl overflow-hidden transition-all duration-300 ${
                  isActive
                    ? 'ring-2 ring-primary-500 scale-105 opacity-100 shadow-lg'
                    : 'opacity-50 hover:opacity-80 scale-95'
                }`}
              >
                <img src={thumb} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PhotoLightbox;
