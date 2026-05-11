export const safeRender = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object' && value !== null) {
    return value.int || value.decimal || value.bool || fallback;
  }
  return value;
};
