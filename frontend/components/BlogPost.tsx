import { Calendar, MapPin, Clock, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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
        minute: eventDate ? '2-digit' : undefined
      }
    );
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'normal': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'low': return 'border-gray-500 bg-gray-50 dark:bg-gray-950/20';
      default: return 'border-red-600 bg-neutral-50 dark:bg-neutral-900';
    }
  };

  const getTypeLabel = () => {
    if (type === 'event') {
      return t('Event', 'Evento');
    }
    return t('Announcement', 'Anuncio');
  };

  return (
    <article className={`border-l-4 ${getPriorityColor(priority)} rounded-r-lg shadow-md overflow-hidden transition-all hover:shadow-lg`}>
      {/* Header Image */}
      {imageUrl && (
        <div className="aspect-video overflow-hidden bg-neutral-100">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="p-6 md:p-8">
        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-medium">
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
          
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <time dateTime={date}>{formatDate(date)}</time>
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-4 serif-heading">
          {title}
        </h1>
        
        {/* Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-red-600 prose-a:text-red-600 hover:prose-a:text-red-500 prose-strong:text-neutral-900 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        
        {/* Author */}
        {author && (
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <User className="h-4 w-4" />
              <span>{t('Posted by', 'Publicado por')} {author}</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
