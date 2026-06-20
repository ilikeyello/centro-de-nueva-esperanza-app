import { Calendar, MapPin, Clock, User, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Rich-text editors inject a default near-black inline `color` on body text
// (e.g. `color: rgba(33,41,50,…)`). Inline colors override the theme, so in
// dark mode that text stays dark and unreadable. Strip inline colors that are
// effectively grayscale (the editor's default black/white/gray) so the text
// follows the `.prose` theme color and flips with light/dark mode. Saturated
// colors are intentional highlights and are left untouched.
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
    // Low saturation == grayscale → drop so the theme color applies.
    return saturation < 40 ? prefix : match;
  });
}

interface BlogPostProps {
  id: number;
  titleEn: string;
  titleEs: string;
  contentEn: string;
  contentEs: string;
  imageUrl?: string | null;
  date: string;
  author?: string;
  location?: string;
  type: 'announcement' | 'event';
  priority?: string;
  eventDate?: string;
  maxAttendees?: number;
  rsvpCount?: number;
  actions?: React.ReactNode;
}

export function BlogPost({
  id,
  titleEn,
  titleEs,
  contentEn,
  contentEs,
  imageUrl,
  date,
  author,
  location,
  type,
  priority,
  eventDate,
  maxAttendees,
  rsvpCount,
  actions,
}: BlogPostProps) {
  const { language, t } = useLanguage();
  
  const title = language === 'en' ? titleEn : titleEs;
  const content = language === 'en' ? contentEn : contentEs;
  
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

  const getTypeLabel = () => {
    if (type === 'event') {
      return t('Event', 'Evento');
    }
    return t('Announcement', 'Anuncio');
  };

  return (
    <article
      className="warm-card rounded-2xl overflow-hidden transition-all hover:shadow-lg"
      style={{ border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.07)" }}
    >
      {/* Urgent accent bar */}
      {priority === 'urgent' && (
        <div className="h-1 w-full" style={{ backgroundColor: "var(--terra)" }} />
      )}

      {/* Header Image */}
      {imageUrl && (
        <div className="aspect-video overflow-hidden bg-[--surface-mid]">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain"
          />
        </div>
      )}

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
      </div>
    </article>
  );
}
