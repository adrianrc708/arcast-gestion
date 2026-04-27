const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

/**
 * @type {any}
 */
const Movie = require('./src/modules/catalog/movie.model');
/** @type {any} */
const TVShow = require('./src/modules/catalog/tvshow.model');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMG_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

const GENRES_TO_FETCH = [28, 35, 27, 878, 16];
const PAGES_TO_FETCH = 5;
const GENRES_TO_EXCLUDE = [99];

/**
 * @typedef {Object} TMDBVideo
 * @property {string} type
 * @property {string} site
 * @property {string} key
 *
 * @typedef {Object} TMDBProvider
 * @property {string} provider_name
 * @property {string} logo_path
 *
 * @typedef {Object} TMDBDetail
 * @property {number} id
 * @property {string} [title]
 * @property {string} [name]
 * @property {string} overview
 * @property {string} poster_path
 * @property {string} backdrop_path
 * @property {string} release_date
 * @property {string} first_air_date
 * @property {number} vote_average
 * @property {number} runtime
 * @property {number} number_of_seasons
 * @property {Array<{name: string}>} genres
 * @property {Array<{name: string}>} spoken_languages
 * @property {{results: TMDBVideo[]}} videos
 * @property {{results: Object.<string, {flatrate: TMDBProvider[], link: string}>}} [watch/providers]
 */

// --- HELPERS ---
const findTrailer = (videos) => {
    if (!videos || !videos.results) return null;
    // noinspection JSUnresolvedVariable
    let v = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    // noinspection JSUnresolvedVariable
    if (!v) v = videos.results.find(v => v.type === 'Teaser' && v.site === 'YouTube');
    // noinspection JSUnresolvedVariable
    if (!v) v = videos.results.find(v => v.site === 'YouTube');
    return v ? v.key : null;
};

const isInTheaters = (releaseDateStr) => {
    if (!releaseDateStr) return false;
    const release = new Date(releaseDateStr);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 60;
};

const getWatchProviders = (providers, releaseDate) => {
    let results = [];
    // noinspection JSUnresolvedVariable
    if (providers && providers.results && providers.results.PE && providers.results.PE.flatrate) {
        // noinspection JSUnresolvedVariable
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
        for (let page = 1; page <= PAGES_TO_FETCH; page++) {
            const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: 'es-ES',
                    include_adult: 'false',
                    'vote_count.gte': 50,
                    without_genres: GENRES_TO_EXCLUDE.join(','),
                    with_genres: genreId,
                    sort_by: 'popularity.desc',
                    page: page
                }
            });

            for (const basicData of response.data.results) {
                // noinspection JSUnresolvedFunction
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
                        /** @type {TMDBDetail} */
                        const d = detailRes.data;

                        // ✅ Añadimos noinspection para release_date
                        // noinspection JSUnresolvedVariable
                        const releaseDate = d.release_date;
                        const platforms = getWatchProviders(d['watch/providers'], releaseDate);

                        // noinspection JSUnresolvedVariable
                        const movie = new Movie({
                            title: d.title,
                            overview: d.overview,
                            // noinspection JSUnresolvedVariable
                            posterUrl: d.poster_path ? `${TMDB_IMG_URL}${d.poster_path}` : null,
                            // noinspection JSUnresolvedVariable
                            backdropUrl: d.backdrop_path ? `${TMDB_BACKDROP_URL}${d.backdrop_path}` : null,
                            tmdbId: d.id,
                            releaseDate: releaseDate,
                            voteAverage: d.vote_average,
                            genres: d.genres.map(g => g.name),
                            trailerKey: findTrailer(d.videos),
                            duration: d.runtime,
                            languages: d.spoken_languages.map(l => l.name),
                            platforms: platforms,
                            watchLink: platforms.length > 0 ? platforms[0].link : null
                        });
                        // noinspection JSUnresolvedFunction
                        await movie.save();
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
        console.error(`Error en género ${genreId}:`, err.message);
    }
}

async function importPopularTVShows() {
    try {
        console.log('\n\n📺 Importando Series Populares...');
        for (let page = 1; page <= PAGES_TO_FETCH; page++) {
            const response = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: 'es-ES',
                    include_adult: 'false',
                    'vote_count.gte': 50,
                    page: page
                }
            });

            for (const basicData of response.data.results) {
                // noinspection JSUnresolvedFunction
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
                        /** @type {TMDBDetail} */
                        const d = detailRes.data;

                        // ✅ Añadimos noinspection para first_air_date
                        // noinspection JSUnresolvedVariable
                        const firstAirDate = d.first_air_date;
                        const platforms = getWatchProviders(d['watch/providers'], firstAirDate);

                        // noinspection JSUnresolvedVariable
                        const show = new TVShow({
                            name: d.name,
                            overview: d.overview,
                            // noinspection JSUnresolvedVariable
                            posterUrl: d.poster_path ? `${TMDB_IMG_URL}${d.poster_path}` : null,
                            // noinspection JSUnresolvedVariable
                            backdropUrl: d.backdrop_path ? `${TMDB_BACKDROP_URL}${d.backdrop_path}` : null,
                            tmdbId: d.id,
                            firstAirDate: firstAirDate,
                            voteAverage: d.vote_average,
                            genres: d.genres.map(g => g.name),
                            trailerKey: findTrailer(d.videos),
                            seasons: d.number_of_seasons,
                            languages: d.spoken_languages.map(l => l.name),
                            platforms: platforms,
                            watchLink: platforms.length > 0 ? platforms[0].link : null
                        });
                        // noinspection JSUnresolvedFunction
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

// ✅ Manejo de promesa para evitar 'Promise returned is ignored'
runSeed().catch(err => {
    console.error(err);
    process.exit(1);
});