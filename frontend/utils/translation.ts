// Google Cloud Translation API integration
// Requires GOOGLE_TRANSLATION_API_KEY environment variable

export interface TranslationService {
  translateText(text: string, fromLang: string, toLang: string): Promise<string>;
  detectLanguage(text: string): Promise<string>;
}

class GoogleTranslationService implements TranslationService {
  private apiKey: string;
  private baseUrl = 'https://translation.googleapis.com/language/translate/v2';

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_TRANSLATION_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Google Translation API key not found. Falling back to basic translation.');
    }
  }

  async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    if (!this.apiKey) {
      return fallbackTranslationService.translateText(text, fromLang, toLang);
    }

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: fromLang,
          target: toLang,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Google Translation API failed, using fallback:', error);
      return fallbackTranslationService.translateText(text, fromLang, toLang);
    }
  }

  async detectLanguage(text: string): Promise<string> {
    if (!this.apiKey) {
      return fallbackTranslationService.detectLanguage(text);
    }

    try {
      const response = await fetch(`${this.baseUrl}/detect?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text
        })
      });

      if (!response.ok) {
        throw new Error(`Language detection API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.detections[0][0].language;
    } catch (error) {
      console.error('Google Language Detection failed, using fallback:', error);
      return fallbackTranslationService.detectLanguage(text);
    }
  }
}

// Fallback translation service for when Google API is unavailable
class FallbackTranslationService implements TranslationService {
  async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    const translations: Record<string, Record<string, string>> = {
      "en": {
        "es": this.getSpanishTranslation(text)
      },
      "es": {
        "en": this.getEnglishTranslation(text)
      }
    };

    return translations[fromLang]?.[toLang] || text;
  }

  async detectLanguage(text: string): Promise<string> {
    const spanishWords = ['¿', 'ñ', 'él', 'ella', 'dios', 'biblia', 'pregunta', 'mandamientos'];
    const hasSpanishChars = /[¿ñáéíóúü]/i.test(text);
    const hasSpanishWords = spanishWords.some(word => text.toLowerCase().includes(word));
    
    return hasSpanishChars || hasSpanishWords ? 'es' : 'en';
  }

  private getSpanishTranslation(englishText: string): string {
    // Simple translation map for common Bible trivia terms
    const translations: Record<string, string> = {
      "Who was the first man created by God according to Genesis?": "¿Quién fue el primer hombre creado por Dios según Génesis?",
      "How many commandments did God give to Moses on Mount Sinai?": "¿Cuántos mandamientos dio Dios a Moisés en el Monte Sinaí?",
      "Who baptized Jesus in the Jordan River?": "¿Quién bautizó a Jesús en el río Jordán?",
      "What is the Golden Rule found in Matthew 7:12?": "¿Cuál es la Regla de Oro encontrada en Mateo 7:12?",
      "Who was thrown into the lion's den but was protected by God?": "¿Quién fue arrojado al foso de los leones pero fue protegido por Dios?",
      "Noah": "Noé",
      "Adam": "Adán",
      "Abraham": "Abraham",
      "Moses": "Moisés",
      "Peter": "Pedro",
      "Paul": "Pablo",
      "John the Baptist": "Juan el Bautista",
      "Matthew": "Mateo",
      "David": "David",
      "Daniel": "Daniel",
      "Joseph": "José",
      "Samuel": "Samuel",
      "Love your neighbor as yourself": "Ama a tu prójimo como a ti mismo",
      "Do to others what you would have them do to you": "Haz a los demás lo que quieres que ellos te hagan a ti",
      "Honor your father and mother": "Honra a tu padre y a tu madre",
      "Love God with all your heart": "Ama a Dios con todo tu corazón",
      "Correct! Well done!": "¡Correcto! ¡Bien hecho!",
      "Incorrect. The correct answer was:": "Incorrecto. La respuesta correcta era:",
      "Next Question": "Siguiente Pregunta",
      "See Results": "Ver Resultados",
      "Game Complete!": "¡Juego Terminado!",
      "Perfect! You're a Bible expert!": "¡Perfecto! ¡Eres un experto en la Biblia!",
      "Excellent! Great knowledge!": "¡Excelente! ¡Gran conocimiento!",
      "Good job! Keep studying!": "¡Buen trabajo! ¡Sigue estudiando!",
      "Keep learning! God loves you!": "¡Sigue aprendiendo! ¡Dios te ama!",
      "Play Again": "Jugar de Nuevo",
      "Correct": "Correctas",
      "Score": "Puntuación",
      "Question": "Pregunta",
      "of": "de",
      "Back": "Volver",
      "Translate": "Traducir",
      "Show Original": "Mostrar Original"
    };

    return translations[englishText] || englishText;
  }

  private getEnglishTranslation(spanishText: string): string {
    // Reverse translation map
    const translations: Record<string, string> = {
      "¿Quién fue el primer hombre creado por Dios según Génesis?": "Who was the first man created by God according to Genesis?",
      "¿Cuántos mandamientos dio Dios a Moisés en el Monte Sinaí?": "How many commandments did God give to Moses on Mount Sinai?",
      "¿Quién bautizó a Jesús en el río Jordán?": "Who baptized Jesus in the Jordan River?",
      "¿Cuál es la Regla de Oro encontrada en Mateo 7:12?": "What is the Golden Rule found in Matthew 7:12?",
      "¿Quién fue arrojado al foso de los leones pero fue protegido por Dios?": "Who was thrown into the lion's den but was protected by God?",
      "Noé": "Noah",
      "Adán": "Adam",
      "Abraham": "Abraham",
      "Moisés": "Moses",
      "Pedro": "Peter",
      "Pablo": "Paul",
      "Juan el Bautista": "John the Baptist",
      "Mateo": "Matthew",
      "David": "David",
      "Daniel": "Daniel",
      "José": "Joseph",
      "Samuel": "Samuel",
      "Ama a tu prójimo como a ti mismo": "Love your neighbor as yourself",
      "Haz a los demás lo que quieres que ellos te hagan a ti": "Do to others what you would have them do to you",
      "Honra a tu padre y a tu madre": "Honor your father and mother",
      "Ama a Dios con todo tu corazón": "Love God with all your heart",
      "¡Correcto! ¡Bien hecho!": "Correct! Well done!",
      "Incorrecto. La respuesta correcta era:": "Incorrect. The correct answer was:",
      "Siguiente Pregunta": "Next Question",
      "Ver Resultados": "See Results",
      "¡Juego Terminado!": "Game Complete!",
      "¡Perfecto! ¡Eres un experto en la Biblia!": "Perfect! You're a Bible expert!",
      "¡Excelente! ¡Gran conocimiento!": "Excellent! Great knowledge!",
      "¡Buen trabajo! ¡Sigue estudiando!": "Good job! Keep studying!",
      "¡Sigue aprendiendo! ¡Dios te ama!": "Keep learning! God loves you!",
      "Jugar de Nuevo": "Play Again",
      "Correctas": "Correct",
      "Puntuación": "Score",
      "Pregunta": "Question",
      "de": "of",
      "Volver": "Back",
      "Traducir": "Translate",
      "Mostrar Original": "Show Original"
    };

    return translations[spanishText] || spanishText;
  }
}

// Create fallback service instance
const fallbackTranslationService = new FallbackTranslationService();

// Export the main translation service
export const translationService = new GoogleTranslationService();

// For backward compatibility
export class BrowserTranslationService extends FallbackTranslationService {}
