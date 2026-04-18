import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import './index.css'

const MovieCard = ({ movie }) => {
    const navigate = useNavigate()
    return (
        <div className="card" onClick={() => navigate(`/movie/${movie._id}`)}>
            <img className="poster" src={movie.posterUrl} alt={movie.title} />
            <h3 className="card-title">{movie.title}</h3>
        </div>
    )
}

const MovieDetails = () => {
    const { id } = useParams()
    const [movie, setMovie] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        // Ruta actualizada al módulo catalog
        fetch(`/api/catalog/movies/${id}`).then(res => res.json()).then(setMovie)
    }, [id])

    if (!movie) return <div className="loader">Cargando...</div>

    return (
        <div className="details-view" style={{ backgroundImage: `linear-gradient(to right, #141414 40%, transparent), url(${movie.backdropUrl})` }}>
            <button onClick={() => navigate('/')} className="back-btn">← Volver</button>
            <div className="details-content">
                <h1>{movie.title}</h1>
                <p className="overview">{movie.overview}</p>
                <div className="meta">
                    <span>⭐ {movie.voteAverage}</span>
                    <span>📅 {movie.releaseDate}</span>
                </div>
            </div>
        </div>
    )
}

const Home = ({ movies }) => {
    const [hero, setHero] = useState(null)
    useEffect(() => {
        if (movies.length > 0) setHero(movies[Math.floor(Math.random() * movies.length)])
    }, [movies])

    return (
        <>
            {hero && (
                <div className="hero" style={{ backgroundImage: `linear-gradient(to top, #141414 10%, transparent), url(${hero.backdropUrl})` }}>
                    <h1 className="hero-title">{hero.title}</h1>
                </div>
            )}
            <div className="content">
                <h2 className="section-title">Catálogo Arcast</h2>
                <div className="grid">
                    {movies.map(m => <MovieCard key={m._id} movie={m} />)}
                </div>
            </div>
        </>
    )
}

function App() {
    const [movies, setMovies] = useState([])
    useEffect(() => {
        // Ruta actualizada al módulo catalog
        fetch('/api/catalog/movies').then(res => res.json()).then(setMovies)
    }, [])

    return (
        <Routes>
            <Route path="/" element={<Home movies={movies} />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
        </Routes>
    )
}

export default App