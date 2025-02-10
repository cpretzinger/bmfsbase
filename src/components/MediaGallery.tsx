import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  title: string;
  source: string;
}

interface MediaGalleryProps {
  media: MediaItem[];
}

export default function MediaGallery({ media }: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => {
              setSelectedMedia(item);
              setCurrentIndex(media.indexOf(item));
            }}
          >
            <img
              src={item.thumbnail || item.url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
              <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center p-2">
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-6xl mx-4">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center justify-center">
              <button
                onClick={handlePrevious}
                className="text-white hover:text-gray-300 p-4"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <div className="flex-1 max-h-[80vh]">
                {media[currentIndex].type === 'image' ? (
                  <img
                    src={media[currentIndex].url}
                    alt={media[currentIndex].title}
                    className="max-w-full max-h-[80vh] object-contain mx-auto"
                  />
                ) : media[currentIndex].type === 'video' ? (
                  <div className="aspect-video">
                    <iframe
                      src={media[currentIndex].url}
                      title={media[currentIndex].title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4">
                    <audio src={media[currentIndex].url} controls className="w-full" />
                  </div>
                )}
              </div>

              <button
                onClick={handleNext}
                className="text-white hover:text-gray-300 p-4"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            <div className="text-white text-center mt-4">
              <h3 className="text-lg font-medium">{media[currentIndex].title}</h3>
              <p className="text-sm text-gray-300">
                Source:{' '}
                <a
                  href={media[currentIndex].source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 inline-flex items-center gap-1"
                >
                  {media[currentIndex].source} <ExternalLink className="w-4 h-4" />
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}