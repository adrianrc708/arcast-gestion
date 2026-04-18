import { useEffect, useState } from 'react'
import './index.css'

function App() {
  const [movies, setMovies] = useState([])
  const [hero, setHero] = useState(null)

  useEffect(() => {
    fetch('/api/movies')
      .then(res => res.json())
      .then(data => {
        setMovies(data)
        if (data.length > 0) {
          const validMovies = data.filter(m => m.backdropUrl)
          setHero(validMovies[Math.floor(Math.random() * validMovies.length)])
        }
      })
      .catch(err => console.error(err))
  }, [])

  return (
    <div>
      {hero && (
        <div 
          className="hero" 
          style={{ backgroundImage: `linear-gradient(to top, #141414 5%, transparent 95%), url(${hero.backdropUrl})` }}
        >
          <h1 className="hero-title">{hero.title}</h1>
        </div>
      )}
      
      <div className="row">
        <h2 className="row-title">Catálogo Principal</h2>
        <div className="posters">
          {movies.map(movie => (
            movie.posterUrl && (
              <img 
                key={movie._id} 
                className="poster" 
                src={movie.posterUrl} 
                alt={movie.title} 
                onClick={() => setHero(movie)}
              />
            )
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
