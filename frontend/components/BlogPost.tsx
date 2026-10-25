import { useEffect, useRef, useState } from 'react';
import { Calendar, MapPin, Clock, User, Users, ChevronDown, ChevronUp, Images } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PostImageCarousel } from './PostImageCarousel';

// Rich-text editors (and pasted content from Word/Docs) inject inline `color`
// on body text — e.g. a near-black `rgba(33,41,50,…)` or a dark brand color
// like `rgb(17,32,60)`. Inline colors override the theme, so in dark mode that
// text stays dark and unreadable. Strip inline colors that are either grayscale
// (the editor's default black/white/gray) OR simply dark (pasted body text),
// so the text follows the `.prose` theme color and flips with light/dark mode.
// Only bright, intentional highlight colors are left untouched.
function neutralizeDefaultTextColors(html: string): string {
  const parseRgb = (value: string): [number, number, number] | null => {
    const v = value.trim().toLowerCase();
    if (v === 'black') return [0, 0, 0];
    if (v === 'white') return [255, 255, 255];
    const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
    if (hex) {
      let h = hex[1];
      if (h.length === 3) h = h.split('').map((c) => c + c).join('');
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    if (v.startsWith('rgb')) {
      const nums = v.match(/\d+(\.\d+)?/g);
      if (nums && nums.length >= 3) return [Number(nums[0]), Number(nums[1]), Number(nums[2])];
    }
    return null;
  };

  // The leading delimiter group keeps this from matching `background-color`.
  return html.replace(/(^|[;\s"'{])color\s*:\s*([^;"']+)/gi, (match, prefix: string, colorValue: string) => {
    const rgb = parseRgb(colorValue);
    if (!rgb) return match; // keep unknown / named colors
    const [r, g, b] = rgb;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);
    // Perceived luminance (0–255, Rec. 601).
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    // Drop the inline color (so the theme color applies) when it's grayscale
    // OR dark — both are unreadable on the dark-mode background. Bright,
    // intentional highlight colors stay.
    return saturation < 40 || luminance < 80 ? prefix : match;
  });
}

interface BlogPostProps {
  id: number;
  titleEn: string;
  titleEs: string;
  contentEn: string;
  contentEs: string;
  imageUrl?: string | null;
  /** Full photo set. `imageUrl` is the first of these; kept for older data. */
  imageUrls?: string[] | null;
  date: string;
  author?: string;
  location?: string;
  type: 'announcement' | 'event';
  priority?: string;
  eventDate?: string;
  maxAttendees?: number;
  rsvpCount?: number;
  actions?: React.ReactNode;
  /** Open the full view (e.g. when a notification points at this post). */
  forceExpanded?: boolean;
}

export function BlogPost({
  id,
  titleEn,
  titleEs,
  contentEn,
  contentEs,
  imageUrl,
  imageUrls,
  date,
  author,
  location,
  type,
  priority,
  eventDate,
  maxAttendees,
  rsvpCount,
  actions,
  forceExpanded = false,
}: BlogPostProps) {
  const { language, t } = useLanguage();
  // Posts start as a compact row (photo + title) so long lists don't need
  // much scrolling; "Read more" / "More details" opens the full post.
  const [expanded, setExpanded] = useState(forceExpanded);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (forceExpanded) setExpanded(true);
  }, [forceExpanded]);

  const collapse = () => {
    setExpanded(false);
    // If the top of the post is above the screen after shrinking, bring it
    // back into view so the reader doesn't lose their place.
    requestAnimationFrame(() => {
      const el = articleRef.current;
      if (el && el.getBoundingClientRect().top < 0) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const title = language === 'en' ? titleEn : titleEs;
  const content = language === 'en' ? contentEn : contentEs;

  // Posts created before galleries existed only have `imageUrl`; posts created
  // since have the full set. Fall back so both render the same way.
  const photos = (imageUrls && imageUrls.length > 0
    ? imageUrls
    : imageUrl
      ? [imageUrl]
      : []
  ).filter(Boolean);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      language === 'en' ? 'en-US' : 'es-ES',
      { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: eventDate ? '2-digit' : undefined,
        minute: eventDate ? '2-digit' : undefined,
        hour12: true
      }
    );
  };

  const formatShortDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', {
      weekday: eventDate ? 'short' : undefined,
      month: 'short',
      day: 'numeric',
      hour: eventDate ? 'numeric' : undefined,
      minute: eventDate ? '2-digit' : undefined,
    });

  const getTypeLabel = () => {
    if (type === 'event') {
      return t('Event', 'Evento');
    }
    return t('Announcement', 'Anuncio');
  };

  const moreLabel = type === 'event' ? t('More details', 'Más detalles') : t('Read more', 'Leer más');

  // ── Compact view ──────────────────────────────────────────────────────────
  if (!expanded) {
    return (
      <article ref={articleRef} className="warm-card rounded-2xl overflow-hidden scroll-mt-24">
        {priority === 'urgent' && (
          <div className="h-1 w-full" style={{ backgroundColor: "var(--terra)" }} />
        )}
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-4 p-3 text-left [-webkit-tap-highlight-color:transparent]"
          aria-expanded={false}
        >
          {photos.length > 0 && (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[--surface-mid]">
              <img src={photos[0]} alt="" className="h-full w-full object-cover" loading="lazy" draggable={false} />
              {photos.length > 1 && (
                <span className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  <Images className="h-2.5 w-2.5" />
                  {photos.length}
                </span>
              )}
            </div>
          )}
          <div className={`min-w-0 flex-1 ${photos.length > 0 ? '' : 'px-2 py-1'}`}>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[--ink-mid]">
              <span className="rounded-full bg-[--sage-light] px-2 py-0.5 font-medium text-[--sage]">
                {getTypeLabel()}
              </span>
              <span className="inline-flex items-center gap-1">
                {eventDate ? <Calendar className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {formatShortDate(eventDate || date)}
              </span>
            </div>
            <h2 className="mt-1.5 line-clamp-2 serif-heading text-lg font-bold leading-snug text-[--ink-dark]">
              {title}
            </h2>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[--sage]">
              {moreLabel}
              <ChevronDown className="h-4 w-4" />
            </span>
          </div>
        </button>
      </article>
    );
  }

  // ── Full view ─────────────────────────────────────────────────────────────
  return (
    <article
      ref={articleRef}
      className="warm-card blogpost-expand rounded-2xl overflow-hidden scroll-mt-24 transition-all hover:shadow-lg"
      style={{ border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.07)" }}
    >
      {/* Urgent accent bar */}
      {priority === 'urgent' && (
        <div className="h-1 w-full" style={{ backgroundColor: "var(--terra)" }} />
      )}

      {/* Header photo(s) — full card width, sized to the photo's own shape */}
      {photos.length > 0 && <PostImageCarousel images={photos} alt={title} />}

      {/* Content */}
      <div className="p-6 md:p-8">
        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-[--ink-mid] mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[--sage-light] text-[--sage] rounded-full font-medium">
            {getTypeLabel()}
          </span>
          
          {eventDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={eventDate}>{formatDate(eventDate)}</time>
            </div>
          )}
          
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
          
          {maxAttendees && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{rsvpCount || 0}/{maxAttendees} {t('attending', 'asistentes')}</span>
            </div>
          )}
          
          {type !== 'event' && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <time dateTime={date}>{formatDate(date)}</time>
            </div>
          )}
        </div>
        
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-[--ink-dark] mb-4 serif-heading">
          {title}
        </h1>
        
        {/* Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-[--sage] prose-a:text-[--sage] hover:prose-a:text-[--sage-mid] prose-strong:text-[--ink-dark]"
          dangerouslySetInnerHTML={{ __html: neutralizeDefaultTextColors(content) }}
        />
        
        {/* Author */}
        {author && (
          <div className="mt-6 pt-6 border-t border-[--border-color]">
            <div className="flex items-center gap-2 text-sm text-[--ink-mid]">
              <User className="h-4 w-4" />
              <span>{t('Posted by', 'Publicado por')} {author}</span>
            </div>
          </div>
        )}
        
        {/* Actions slot at the bottom */}
        {actions && (
          <div className="mt-6 pt-6 border-t border-[--border-color] flex justify-end gap-2">
            {actions}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={collapse}
            aria-expanded={true}
            className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-[--sage] hover:bg-[--sage-light] [-webkit-tap-highlight-color:transparent]"
          >
            {t('Show less', 'Mostrar menos')}
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
