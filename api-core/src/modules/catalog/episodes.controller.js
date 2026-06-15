const { catchAsync, AppError } = require('../../common/error.utils');
const Episode = require('./episode.model');

exports.getEpisodes = catchAsync(async (req, res) => {
    const { tvshowId } = req.params;
    const { season } = req.query;

    const query = { tvshowId };
    if (season) query.season = Number(season);

    const episodes = await Episode.find(query).sort({ season: 1, episode: 1 });
    res.json(episodes);
});

exports.createEpisode = catchAsync(async (req, res) => {
    const { tvshowId } = req.params;
    const ep = await Episode.create({ ...req.body, tvshowId });
    res.status(201).json(ep);
});

exports.updateEpisode = catchAsync(async (req, res) => {
    const ep = await Episode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ep) throw new AppError('Episodio no encontrado', 404);
    res.json(ep);
});

exports.deleteEpisode = catchAsync(async (req, res) => {
    await Episode.findByIdAndDelete(req.params.id);
    res.json({ message: 'Episodio eliminado' });
});
