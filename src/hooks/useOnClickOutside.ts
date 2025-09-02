import { useEffect, RefObject } from 'react';

type Event = MouseEvent | TouchEvent;

export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void,
  buttonRef?: RefObject<HTMLElement>
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref?.current;
      const buttonEl = buttonRef?.current;

      // Do nothing if clicking ref's element or descendent elements
      // Also do nothing if clicking the button that opens the element
      if (!el || el.contains(event.target as Node) || buttonEl?.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, buttonRef]);
};
