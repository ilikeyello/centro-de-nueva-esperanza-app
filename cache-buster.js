// Add this to your frontend to prevent caching
const CACHE_BUST = Date.now();

// Update all API calls to include cache busting
const fetchWithCacheBust = async (url, options = {}) => {
  const urlWithBust = `${url}${url.includes('?') ? '&' : '?'}_cb=${CACHE_BUST}`;
  return fetch(urlWithBust, {
    ...options,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      ...options.headers
    }
  });
};

// Use this instead of fetch for API calls
export default fetchWithCacheBust;
