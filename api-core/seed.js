const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const Movie = require('./models/movie.model');
const TVShow = require('./models/tvshow.model');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

// GÉNEROS A IMPORTAR
// SE HA ELIMINADO EL ID 18 (Drama)
const GENRES_TO_FETCH = [28, 35, 27, 878, 16];
// CANTIDAD DE PÁGINAS A RECORRER POR GÉNERO/CATEGORÍA (Aumenta este número para más datos)
const PAGES_TO_FETCH = 5;

// ID del género Documental (ID 99).
const GENRES_TO_EXCLUDE = [99];

// --- HELPERS ---
const findTrailer = (videos) => {
    if (!videos || !videos.results) return null;
    let v = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    if (!v) v = videos.results.find(v => v.type === 'Teaser' && v.site === 'YouTube');
    if (!v) v = videos.results.find(v => v.site === 'YouTube');
    return v ? v.key : null;
};

const isInTheaters = (releaseDateStr) => {
    if (!releaseDateStr) return false;
    const release = new Date(releaseDateStr);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - release) / (1000 * 60 * 60 * 24));
    return diffDays <= 60;
};

const getWatchProviders = (providers, releaseDate) => {
    let results = [];
    if (providers && providers.results && providers.results.PE && providers.results.PE.flatrate) {
        results = providers.results.PE.flatrate.map(p => ({
            name: p.provider_name,
            logo: `${TMDB_IMG_URL}${p.logo_path}`,
            link: providers.results.PE.link
        }));
    }
    if (results.length === 0 && isInTheaters(releaseDate)) {
        results.push({
            name: 'Cineplanet / Cinemark',
            logo: 'https://img.icons8.com/color/48/cinema-.png',
            link: 'https://www.cineplanet.com.pe/'
        });
    }
    return results;
};

async function importMoviesByGenre(genreId) {
    try {
        console.log(`\n🎬 Importando género ID ${genreId}...`);

        // BUCLE PARA TRAER MÁS PÁGINAS
        for (let page = 1; page <= PAGES_TO_FETCH; page++) {
            console.log(`   ↳ Procesando página ${page}...`);

            const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: 'es-ES',
                    include_adult: 'false',

                    // FILTRO: Exigir un mínimo de votos (para filtrar contenido de nicho)
                    'vote_count.gte': 50,

                    // FILTRO: Excluir géneros no deseados (Documental)
                    without_genres: GENRES_TO_EXCLUDE.join(','),

                    with_genres: genreId,
                    sort_by: 'popularity.desc',
                    page: page // Paginación dinámica
                }
            });

            for (const basicData of response.data.results) {
                const existing = await Movie.findOne({ tmdbId: basicData.id });
                if (!existing) {
                    try {
                        const detailRes = await axios.get(`${TMDB_BASE_URL}/movie/${basicData.id}`, {
                            params: {
                                api_key: TMDB_API_KEY,
                                language: 'es-ES',
                                append_to_response: 'videos,watch/providers',
                                include_video_language: 'es,en,null'
                            }
                        });
                        const d = detailRes.data;
                        const platforms = getWatchProviders(d['watch/providers'], d.release_date);

                        const movie = new Movie({
                            title: d.title,
                            overview: d.overview,
                            posterUrl: d.poster_path ? `${TMDB_IMG_URL}${d.poster_path}` : null,
                            backdropUrl: d.backdrop_path ? `${TMDB_BACKDROP_URL}${d.backdrop_path}` : null,
                            tmdbId: d.id,
                            releaseDate: d.release_date,
                            voteAverage: d.vote_average,
                            genres: d.genres.map(g => g.name),
                            trailerKey: findTrailer(d.videos),
                            duration: d.runtime,
                            languages: d.spoken_languages.map(l => l.name),
                            platforms: platforms,
                            watchLink: platforms.length > 0 ? platforms[0].link : null
                        });
                        await movie.save();
                        process.stdout.write('+'); // Indicador visual de guardado
                    } catch (innerErr) {
                        process.stdout.write('x'); // Error puntual en una peli
                    }
                } else {
                    process.stdout.write('.'); // Ya existía
                }
            }
        }
    } catch (err) {
        console.error(`Error en género ${genreId}:`, err.message);
    }
}

async function importPopularTVShows() {
    try {
        console.log('\n\n📺 Importando Series Populares...');

        // BUCLE PARA TRAER MÁS PÁGINAS DE SERIES
        for (let page = 1; page <= PAGES_TO_FETCH; page++) {
            console.log(`   ↳ Procesando página ${page}...`);

            const response = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: 'es-ES',
                    include_adult: 'false',

                    // FILTRO: Exigir un mínimo de votos (50)
                    'vote_count.gte': 50,

                    page: page
                }
            });

            for (const basicData of response.data.results) {
                const existing = await TVShow.findOne({ tmdbId: basicData.id });
                if (!existing) {
                    try {
                        const detailRes = await axios.get(`${TMDB_BASE_URL}/tv/${basicData.id}`, {
                            params: {
                                api_key: TMDB_API_KEY,
                                language: 'es-ES',
                                append_to_response: 'videos,watch/providers',
                                include_video_language: 'es,en,null'
                            }
                        });
                        const d = detailRes.data;
                        const platforms = getWatchProviders(d['watch/providers'], d.first_air_date);

                        const show = new TVShow({
                            name: d.name,
                            overview: d.overview,
                            posterUrl: d.poster_path ? `${TMDB_IMG_URL}${d.poster_path}` : null,
                            backdropUrl: d.backdrop_path ? `${TMDB_BACKDROP_URL}${d.backdrop_path}` : null,
                            tmdbId: d.id,
                            firstAirDate: d.first_air_date,
                            voteAverage: d.vote_average,
                            genres: d.genres.map(g => g.name),
                            trailerKey: findTrailer(d.videos),
                            seasons: d.number_of_seasons,
                            languages: d.spoken_languages.map(l => l.name),
                            platforms: platforms,
                            watchLink: platforms.length > 0 ? platforms[0].link : null
                        });
                        await show.save();
                        process.stdout.write('+');
                    } catch (innerErr) {
                        process.stdout.write('x');
                    }
                } else {
                    process.stdout.write('.');
                }
            }
        }
    } catch (err) {
        console.error('Error Series:', err.message);
    }
}

async function runSeed() {
    console.log('🚀 Iniciando Seeding Masivo...');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conectado a MongoDB.');

        // ----------------------------------------------------
        // RECUERDA: Eliminar colecciones 'movies' y 'tvshows' de Atlas
        // antes de correr este script para que los cambios sean efectivos.
        // ----------------------------------------------------

        for (const genreId of GENRES_TO_FETCH) {
            await importMoviesByGenre(genreId);
        }

        await importPopularTVShows();

        console.log('\n\n✅ ¡Base de datos poblada exitosamente!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

runSeed();