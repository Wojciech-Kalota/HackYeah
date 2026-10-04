import { useEffect, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type FocusTrapOptions = {
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  onEscape: () => void;
};

export function useFocusTrap({
  active,
  containerRef,
  initialFocusRef,
  returnFocusRef,
  onEscape,
}: FocusTrapOptions) {
  useEffect(() => {
    if (!active) return;

    const currentContainer = containerRef.current;
    if (!currentContainer) return;
    const container: HTMLElement = currentContainer;

    const focusableElements = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (element) =>
          !element.hasAttribute('disabled') && element.getClientRects().length,
      );

    requestAnimationFrame(() => {
      const initialElement = initialFocusRef?.current ?? focusableElements()[0];
      initialElement?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape();
        return;
      }
      if (event.key !== 'Tab') return;

      const elements = focusableElements();
      if (!elements.length) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      const current = document.activeElement;

      if (
        event.shiftKey &&
        (current === first || !container.contains(current))
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      requestAnimationFrame(() => returnFocusRef?.current?.focus());
    };
  }, [active, containerRef, initialFocusRef, onEscape, returnFocusRef]);
}
