export const preloadImages = (imagePaths) => {
  return Promise.all(imagePaths.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = resolve;
      img.onerror = reject;
    });
  }));
};