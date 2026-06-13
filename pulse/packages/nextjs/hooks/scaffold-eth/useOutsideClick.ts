import React, { useEffect } from "react";

/**
 * Handles clicks outside of passed ref element
 * @param ref - react ref of the element
 * @param callback - callback function to call when clicked outside
 */
export const useOutsideClick = (ref: React.RefObject<HTMLElement | null>, callback: { (): void }) => {
  useEffect(() => {
    function handleOutsideClick(event: PointerEvent) {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [ref, callback]);
};
