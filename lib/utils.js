export function calcAge(creation_date) {
  const start = new Date(creation_date);
  const now = new Date();
  const diffMs = now - start;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const weeks = Math.floor(days / 7);
  return { days, months, weeks };
}

export function isBirthdayToday(owner_birthday) {
  if (!owner_birthday) return false;
  const today = new Date();
  const [month, day] = owner_birthday.split('-').map(Number);
  return today.getMonth() + 1 === month && today.getDate() === day;
}

export function parseVideoUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0` };
  const igMatch = url.match(/instagram\.com\/(?:[^\/]+\/)?(?:p|reel)\/([^\/?#&]+)/i);
  if (igMatch) return { type: 'instagram', embedUrl: `https://www.instagram.com/p/${igMatch[1]}/embed/` };
  return { type: 'direct', embedUrl: url };
}

export function formatDate(dateStr, lang = 'en') {
  const date = new Date(dateStr);
  return date.toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function hexToRgbStr(hex) {
  let c = (hex || '#4ADE80').replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}
