/**
 * Only run last set timeout action.
 *
 * @param {() => void} callback - The callback function.
 * @param {number} [delay=100] - The delay time.
 * @returns {() => void} The action.
 */
export default (callback: () => void, delay: number = 100): () => void => {
  let timeout: NodeJS.Timeout;
  return () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(callback, delay);
  };
};
