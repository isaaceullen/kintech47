'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

export default function ProductGallery({ 
  images, 
  videoUrls,
  sku, 
  name, 
  isOutOfStock,
  isPromoActive,
  discountType,
  discountAmount,
  pixPrice
}: { 
  images: string[], 
  videoUrls?: string[],
  sku: string, 
  name: string, 
  isOutOfStock: boolean,
  isPromoActive?: boolean,
  discountType?: 'percentage' | 'fixed',
  discountAmount?: number,
  pixPrice?: number
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const validImages = Array.isArray(images) ? images.filter(img => typeof img === 'string' && img.startsWith('http')) : [];
  const validVideos = Array.isArray(videoUrls) ? videoUrls.filter(vid => typeof vid === 'string' && vid.startsWith('http')) : [];
  
  const mediaItems = [...validImages.map(url => ({ type: 'image', url })), ...validVideos.map(url => ({ type: 'video', url }))];
  if (mediaItems.length === 0) {
    mediaItems.push({ type: 'image', url: 'https://via.placeholder.com/800' });
  }

  let discountPercentage = 0;
  if (isPromoActive) {
    if (discountType === 'percentage') {
      discountPercentage = discountAmount || 0;
    } else if (pixPrice && pixPrice > 0) {
      discountPercentage = Math.round(((discountAmount || 0) / pixPrice) * 100);
    }
  }

  const renderGalleryItem = (item: { type: string, url: string }) => {
    if (item.type === 'video') {
      const isYouTubeOrVimeo = item.url.includes('youtube.com') || item.url.includes('vimeo.com') || item.url.includes('youtu.be');
      
      if (isYouTubeOrVimeo) {
        // Convert watch urls to embed format if necessary depending on the input
        let embedUrl = item.url;
        if (item.url.includes('youtube.com/watch?v=')) {
          embedUrl = item.url.replace('/watch?v=', '/embed/');
        } else if (item.url.includes('youtu.be/')) {
          embedUrl = item.url.replace('youtu.be/', 'youtube.com/embed/');
        }
        
        return (
          <iframe 
            src={embedUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        );
      }
      
      return (
        <video 
          controls 
          className="w-full h-full object-contain bg-black"
          preload="metadata"
        >
          <source src={item.url} />
          Seu navegador não suporta a tag de vídeo.
        </video>
      );
    }

    return (
      <Image
        src={item.url}
        alt={`${name} - Imagem`}
        fill
        className="object-cover"
        referrerPolicy="no-referrer"
        priority
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-background-secondary border border-background-tertiary">
        {renderGalleryItem(mediaItems[currentIndex])}
        
        {isOutOfStock && (
          <div className="absolute top-4 right-4 z-20 bg-danger text-white font-bold px-3 py-1.5 rounded-md pointer-events-none">
            Esgotado
          </div>
        )}
        {isPromoActive && !isOutOfStock && (
          <div className="absolute top-4 right-4 z-20 bg-primary text-background-main font-bold px-3 py-1.5 rounded-md shadow-lg pointer-events-none">
            {discountPercentage}% OFF
          </div>
        )}
      </div>
      
      {mediaItems.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {mediaItems.map((item, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${currentIndex === idx ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'} bg-background-secondary flex justify-center items-center`}
            >
              {item.type === 'video' ? (
                <>
                  <div className="w-full h-full bg-black/80 flex items-center justify-center text-white">
                    <Play className="w-8 h-8 opacity-80" />
                  </div>
                </>
              ) : (
                <Image
                  src={item.url}
                  alt={`${name} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
