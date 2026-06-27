const { GoogleGenAI } = require('@google/genai');
const Movie = require('../catalog/movie.model');
const TVShow = require('../catalog/tvshow.model');

const performSemanticSearch = async (queryText) => {
    // 1. Inicializar cliente de Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno");
    }

    const ai = new GoogleGenAI({ apiKey });

    // 2. Preparar el Prompt para la extracción semántica
    const prompt = `Analiza la siguiente consulta de búsqueda para un catálogo de películas y series: "${queryText}".
Extrae los términos de búsqueda clave, géneros cinematográficos o países mencionados. Para los países, intenta usar su código de 2 letras ISO 3166-1 (por ejemplo: "Perú" -> "PE", "España" -> "ES", "Estados Unidos" -> "US").

CRITICAL: Ignora frases conversacionales o intenciones de visualización que no aporten al filtro directo de contenido (por ejemplo: "para ver con amigos", "recomendaciones de", "quiero ver", "algo para", "que sea", "buena película"). Solo extrae palabras clave reales que describan el tema o argumento (por ejemplo: "fantasmas", "vampiros", "espacio", "secuestro").

Devuelve ÚNICAMENTE un objeto JSON (sin texto adicional ni formato markdown como bloques \`\`\`) con la siguiente estructura:
{
  "keywords": ["termino1", "termino2"],
  "genres": ["genero1"],
  "country": ["código_país_2_letras"]
}
Si no encuentras algún dato para una categoría, devuelve un array vacío. Trata de deducir el país y el género correctamente (ej: "peruano" -> "PE").`;

    // 3. Llamar a Gemini (gemini-2.5-flash es óptimo para tareas rápidas de texto)
    let semanticData;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        // Limpiar el texto por si Gemini devolvió backticks de markdown
        let responseText = response.text || '';
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        semanticData = JSON.parse(responseText);
    } catch (error) {
        console.error("Error consultando o parseando respuesta de Gemini:", error);
        throw new Error("Error interpretando la búsqueda semántica. Intenta con otra consulta.");
    }

    const { keywords = [], genres = [], country = [] } = semanticData;

    // Mapa de países comunes a códigos ISO de 2 letras
    const countryMap = {
        'peru': 'PE',
        'perú': 'PE',
        'peruano': 'PE',
        'peruana': 'PE',
        'españa': 'ES',
        'español': 'ES',
        'española': 'ES',
        'estados unidos': 'US',
        'eeuu': 'US',
        'usa': 'US',
        'argentina': 'AR',
        'argentino': 'AR',
        'mexico': 'MX',
        'méxico': 'MX',
        'chile': 'CL',
        'chileno': 'CL',
        'colombia': 'CO',
        'colombiano': 'CO',
        'venezuela': 'VE',
        'bolivia': 'BO',
        'ecuador': 'EC'
    };

    const normalizedCountries = country.map(c => {
        const key = c.toLowerCase().trim();
        return countryMap[key] || c.toUpperCase();
    });

    // Actualizar la interpretación devuelta con los códigos normalizados
    semanticData.country = normalizedCountries;

    // Si Gemini no pudo extraer absolutamente nada útil, retornamos vacío temprano
    if (keywords.length === 0 && genres.length === 0 && normalizedCountries.length === 0) {
        return {
            interpretation: semanticData,
            results: []
        };
    }

    // 4. Construir la consulta en Mongoose
    const queryBuilder = {};
    const orConditions = [];

    if (genres.length > 0) {
        const genreRegexes = genres.map(g => new RegExp(g, 'i'));
        queryBuilder.genres = { $in: genreRegexes };
    }

    if (normalizedCountries.length > 0) {
        const countryRegexes = normalizedCountries.map(c => new RegExp(c, 'i'));
        queryBuilder.originCountry = { $in: countryRegexes };
    }

    if (keywords.length > 0) {
        const keywordRegexes = keywords.map(k => new RegExp(k, 'i'));
        orConditions.push({ title: { $in: keywordRegexes } });
        orConditions.push({ overview: { $in: keywordRegexes } });
    }

    let finalQuery = { ...queryBuilder };
    
    // Si extrajo keywords, buscamos en título o overview que coincidan con las palabras,
    // Y (AND) que también coincidan con el género/país si fueron proporcionados.
    if (orConditions.length > 0) {
        if (Object.keys(queryBuilder).length > 0) {
             finalQuery = { $and: [ queryBuilder, { $or: orConditions } ] };
        } else {
             finalQuery = { $or: orConditions };
        }
    }

    // 5. Consultar los modelos Movie y TVShow
    const movies = await Movie.find(finalQuery).lean();
    const tvShows = await TVShow.find(finalQuery).lean();

    const moviesWithType = movies.map(m => ({ ...m, mediaType: 'movie' }));
    const tvShowsWithType = tvShows.map(t => ({ ...t, mediaType: 'tv' }));

    const combinedResults = [...moviesWithType, ...tvShowsWithType];

    return {
        interpretation: semanticData,
        results: combinedResults
    };
};

module.exports = {
    performSemanticSearch
};
