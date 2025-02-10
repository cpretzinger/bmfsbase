interface Sticker {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary';
}

interface StickerAlbumProps {
  stickers: Sticker[];
}

export default function StickerAlbum({ stickers }: StickerAlbumProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {stickers.map((sticker) => (
        <div
          key={sticker.id}
          className="relative aspect-square bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow"
        >
          <img
            src={sticker.imageUrl}
            alt={sticker.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-end">
            <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <h4 className="font-semibold">{sticker.name}</h4>
              <p className="text-sm">{sticker.description}</p>
              <span className="text-xs uppercase tracking-wide">
                {sticker.rarity}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}