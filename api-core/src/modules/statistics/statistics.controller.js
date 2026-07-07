const statisticsService = require('./statistics.service');
const { catchAsync } = require('../../common/error.utils');
const PlaybackLog = require('./playback.model');

exports.getTrafficMetrics = catchAsync(async (req, res, _next) => {
    const days = parseInt(req.query.days) || 7;
    const data = await statisticsService.getTrafficPeaks(days);
    res.json(data);
});

exports.recordPlayback = catchAsync(async (req, res, _next) => {
    const { contentId, contentType, durationMinutes } = req.body;
    await PlaybackLog.create({
        userId: req.user.id,
        contentId, contentType, durationMinutes
    });
    res.status(201).json({ message: 'Tiempo de reproducción registrado exitosamente' });
});

exports.getPlaybackMetrics = catchAsync(async (req, res, _next) => {
    const days = parseInt(req.query.days) || 7;
    const data = await statisticsService.getAveragePlayback(days);
    res.json(data);
});
