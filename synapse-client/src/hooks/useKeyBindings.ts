/**
 * This hook registers keybindings. The map of keybindings can be found in the `docs` folder
 */
import { useEffect } from "react";

const useKeyBindings = (keyMap) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = [
        event.ctrlKey ? "Ctrl" : "",
        event.shiftKey ? "Shift" : "",
        event.altKey ? "Alt" : "",
        event.metaKey ? "Meta" : "",
        event.key
      ]
        .filter(Boolean) // Remove empty strings
        .join("+"); // Join with "+" (e.g., "Ctrl+S")

      if (keyMap[key]) {
        event.preventDefault(); // Prevent default browser actions if needed
        keyMap[key](event);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [keyMap]);
}

export default useKeyBindings;