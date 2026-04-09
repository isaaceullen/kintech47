'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { X } from 'lucide-react';
import { Popup } from '@/types/database';
import { getActivePopups, getProductBySku } from '@/lib/api';
import { trackEvent } from '@/components/GoogleAnalytics';

export default function PopupModal() {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();

  useEffect(() => {
    async function loadPopup() {
      // Check if already seen in this session
      const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');
      if (hasSeenPopup) return;

      const activePopups = await getActivePopups();
      if (!activePopups || activePopups.length === 0) return;

      let selectedPopup: Popup | null = null;

      // Check for 'all_pages' first
      const allPagesPopup = activePopups.find(p => p.target_type === 'all_pages');
      if (allPagesPopup) {
        selectedPopup = allPagesPopup;
      } else {
        // Determine current page type
        if (pathname === '/') {
          selectedPopup = activePopups.find(p => p.target_type === 'home' || !p.target_type) || null;
        } else if (pathname === '/cart') {
          selectedPopup = activePopups.find(p => p.target_type === 'cart') || null;
        } else if (pathname === '/products') {
          selectedPopup = activePopups.find(p => p.target_type === 'all_products') || null;
        } else if (pathname.startsWith('/') && pathname !== '/' && pathname !== '/cart' && !pathname.startsWith('/admin')) {
          // Might be a specific product page
          const sku = params?.sku as string;
          if (sku) {
            const product = await getProductBySku(sku);
            if (product) {
              selectedPopup = activePopups.find(p => p.target_type === 'specific_product' && p.target_product_id === product.id) || null;
            }
          }
          // Fallback to all_products if no specific popup found
          if (!selectedPopup) {
            selectedPopup = activePopups.find(p => p.target_type === 'all_products') || null;
          }
        }
      }

      if (selectedPopup) {
        setPopup(selectedPopup);
        setIsOpen(true);
      }
    }
    loadPopup();
  }, [pathname, params]);

  const closePopup = () => {
    if (popup) {
      trackEvent('close_popup', { popup_title: popup.title });
    }
    setIsOpen(false);
    sessionStorage.setItem('hasSeenPopup', 'true');
  };

  const handleButtonClick = () => {
    if (popup) {
      trackEvent('click_popup_button', { 
        popup_title: popup.title,
        button_link: popup.button_link 
      });
    }
    closePopup();
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
              onClick={handleButtonClick}
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
