import { useState, useCallback, useRef } from 'react';

export interface LightboxState {
  isOpen: boolean;
  currentSrc: string | null;
  currentAlt: string;
  images: string[];
  currentIndex: number;
  open: (src: string, alt?: string) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  registerImages: (container: HTMLElement) => void;
}

export function useImageLightbox(): LightboxState {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [currentAlt, setCurrentAlt] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const previousBodyOverflow = useRef<string>('');

  const findImageIndex = useCallback((src: string): number => {
    // Normalize the src for comparison (resolve relative URLs)
    const normalizedSrc = new URL(src, window.location.href).href;
    const idx = images.findIndex(
      (img) => new URL(img, window.location.href).href === normalizedSrc
    );
    return idx !== -1 ? idx : 0;
  }, [images]);

  const open = useCallback((src: string, alt: string = '') => {
    const idx = findImageIndex(src);
    setIsOpen(true);
    setCurrentSrc(src);
    setCurrentAlt(alt);
    setCurrentIndex(idx);
    // Prevent body scroll while lightbox is open
    previousBodyOverflow.current = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';
  }, [findImageIndex]);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = previousBodyOverflow.current;
  }, []);

  const next = useCallback(() => {
    if (images.length <= 1) return;
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    setCurrentSrc(images[newIndex]);
  }, [images, currentIndex]);

  const prev = useCallback(() => {
    if (images.length <= 1) return;
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
    setCurrentSrc(images[newIndex]);
  }, [images, currentIndex]);

  const registerImages = useCallback((container: HTMLElement) => {
    const imgElements = container.querySelectorAll<HTMLImageElement>('img');
    const srcs: string[] = [];

    imgElements.forEach((img) => {
      // Store original src for display, but also capture it
      if (img.src) {
        srcs.push(img.src);
      }
    });

    setImages(srcs);
  }, []);

  return {
    isOpen,
    currentSrc,
    currentAlt,
    images,
    currentIndex,
    open,
    close,
    next,
    prev,
    registerImages,
  };
}
