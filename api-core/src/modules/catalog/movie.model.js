const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
  title: { type: String, required: true },
  overview: { type: String },
  posterUrl: { type: String },
  backdropUrl: { type: String },
  tmdbId: { type: String }, // LIBERADO: Ya no es obligatorio para el contenido local
  releaseDate: { type: String },
  genres: [{ type: String }],
  trailerKey: { type: String },
  voteAverage: { type: Number },
  duration: { type: Number },
  languages: [{ type: String }],
  originCountry: [{ type: String }],

  // Array de plataformas
  platforms: [
    {
      name: String,
      logo: String,
      link: String,
    },
  ],

  watchLink: { type: String },

  // Ruta absoluta al archivo de video almacenado localmente (streaming RF11)
  localPath: { type: String },

  // Búsqueda semántica: vector de embedding del título+sinopsis y el texto con
  // el que se generó (para detectar cambios). `select: false` para no arrastrar
  // el vector en las consultas normales del catálogo.
  embedding: { type: [Number], default: undefined, select: false },
  embeddingText: { type: String, select: false },
});

module.exports = mongoose.model("Movie", MovieSchema);
