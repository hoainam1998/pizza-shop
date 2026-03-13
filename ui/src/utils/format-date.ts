/**
 * Format timestamp to format string.
 *
 * @param {string|number} timestamp - The timestamp.
 * @param {[string]} pattern - The date format pattern.
 * @returns {string} - The format date string.
 */
const formatDate = (timestamp: string | number, pattern?: string): string => {
  const date = new Date(+timestamp);
  const year = date.getFullYear();
  const months = date.getMonth() + 1;
  const day = date.getDate();

  switch (pattern) {
    case 'dd-MM-yyyy':
      return `${day}-${months}-${year}`;
    default:
      return `${day}/${months}/${year}`;
  }
};

/**
 * Format timestamp to format string with hyphen mark.
 *
 * @param {string|number} timestamp - The timestamp.
 * @returns {string} - The format date string.
 */
const formatDateHyphen = (timestamp: string | number) => formatDate(timestamp, 'dd-MM-yyyy');

/**
 * Format timestamp to format string with slash mark.
 *
 * @param {string|number} timestamp - The timestamp.
 * @returns {string} - The format date string.
 */
const formatDateSlash = formatDate;

export {
  formatDateHyphen,
  formatDateSlash,
};
