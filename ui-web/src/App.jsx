import { useEffect, useState } from 'react'

function App() {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    fetch('http://localhost:5000/api/movies')
      .then(res => res.json())
      .then(data => setMovies(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div style={{ backgroundColor: '#0f1014', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <h1>FilmLog / Arcast</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {movies.map(movie => (
          <div key={movie._id} style={{ backgroundColor: '#1b1d24', padding: '10px', borderRadius: '8px' }}>
            <img src={movie.posterUrl} alt={movie.title} style={{ width: '100%', borderRadius: '4px' }} />
            <h3>{movie.title}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
