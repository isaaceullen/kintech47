'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProductGallery({ images, sku, name, isOutOfStock }: { images: string[], sku: string, name: string, isOutOfStock: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const displayImages = images && images.length > 0 ? images : [`https://picsum.photos/seed/${sku}/800/800`];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-background-secondary border border-background-tertiary">
        <Image
          src={displayImages[currentIndex]}
          alt={`${name} - Imagem ${currentIndex + 1}`}
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
          priority
        />
        {isOutOfStock && (
          <div className="absolute top-4 right-4 z-10 bg-danger text-white font-bold px-3 py-1.5 rounded-md">
            Esgotado
          </div>
        )}
      </div>
      
      {displayImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {displayImages.map((img, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${currentIndex === idx ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
