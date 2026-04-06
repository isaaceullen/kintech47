'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Popup } from '@/types/database';
import { getActivePopup } from '@/lib/api';

export default function PopupModal() {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadPopup() {
      // Check if already seen in this session
      const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');
      if (hasSeenPopup) return;

      const activePopup = await getActivePopup();
      if (activePopup) {
        setPopup(activePopup);
        setIsOpen(true);
      }
    }
    loadPopup();
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenPopup', 'true');
  };

  if (!isOpen || !popup) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-main/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-[90%] md:max-w-md lg:max-w-lg bg-background-secondary rounded-2xl border border-accent/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
      >
        <button 
          onClick={closePopup}
          className="absolute top-3 right-3 z-10 p-2 bg-background-main/50 hover:bg-background-main rounded-full text-text-main transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {popup.image_url && (
          <div className="relative w-full h-48 sm:h-64">
            <Image
              src={popup.image_url}
              alt={popup.title}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-accent mb-4">
            {popup.title}
          </h2>
          <p className="text-text-reading mb-8 whitespace-pre-line">
            {popup.description}
          </p>

          {popup.button_text && popup.button_link && (
            <Link 
              href={popup.button_link}
              onClick={closePopup}
              className="inline-block w-full sm:w-auto px-8 py-3 bg-accent hover:bg-accent-hover text-background-main font-bold rounded-lg transition-colors"
            >
              {popup.button_text}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
