const moviesService = require("./movies.service");
const tmdbProvider = require("./providers/tmdb.provider");
const { catchAsync, AppError } = require("../../common/error.utils");

exports.getAllMovies = catchAsync(async (req, res, _next) => {
  const { genre, platform, sort, search } = req.query;
  let query = {};

  if (search) query.title = { $regex: search, $options: "i" };
  if (genre && genre !== "Todas") query.genres = genre;
  if (platform && platform !== "Todas")
    query["platforms.name"] = { $regex: platform, $options: "i" };

  const movies = await moviesService.findAll(
    query,
    String(sort || ""),
    String(search || ""),
  );
  res.json(movies);
});

exports.getMovieById = catchAsync(async (req, res, _next) => {
  let movie = null;

  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    movie = await moviesService.findById(req.params.id);
  }

  if (!movie) {
    movie = await tmdbProvider.getMovieDetails(req.params.id);
  }

  if (!movie) throw new AppError("Película no encontrada", 404);
  res.json(movie);
});

exports.createMovie = catchAsync(async (req, res, next) => {
  // Validaciones del RF16
  if (!req.body.title || req.body.title.trim() === "") {
    return next(new AppError("El título de la película es obligatorio.", 400));
  }
  if (req.body.duration !== undefined && req.body.duration < 0) {
    return next(
      new AppError("La duración de la película no puede ser negativa.", 400),
    );
  }

  if (!req.body.tmdbId) {
    req.body.tmdbId = "manual-" + Date.now();
  }
  const savedMovie = await moviesService.create(req.body);
  res.status(201).json(savedMovie);
});

exports.updateMovie = catchAsync(async (req, res, next) => {
  // Validaciones del RF16
  if (req.body.title !== undefined && req.body.title.trim() === "") {
    return next(
      new AppError("El título de la película no puede estar vacío.", 400),
    );
  }
  if (req.body.duration !== undefined && req.body.duration < 0) {
    return next(
      new AppError("La duración de la película no puede ser negativa.", 400),
    );
  }

  const movie = await moviesService.update(req.params.id, req.body);
  if (!movie) throw new AppError("Película no encontrada", 404);
  res.json(movie);
});

exports.deleteMovie = catchAsync(async (req, res, _next) => {
  await moviesService.delete(req.params.id);
  res.json({ message: "Película eliminada exitosamente" });
});

exports.exploreMovies = catchAsync(async (req, res, _next) => {
  const { genre, sort, search, page = 1 } = req.query;
  const { results, totalPages } = await tmdbProvider.explorePeruvianMovies(
    Number(page),
    { genre, sort, search },
  );

  const detailedResults = await Promise.all(
    results.map((m) => tmdbProvider.getMovieDetails(m.id)),
  );

  const movies = detailedResults
    .filter(
      (m) => m.productionCountries && m.productionCountries.includes("PE"),
    )
    .filter((m) => m.posterUrl);

  res.json({ results: movies, totalPages, page: Number(page) });
});
