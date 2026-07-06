const AuditLog = require('../../common/audit.model');
const PlaybackLog = require('./playback.model');

/**
 * Obtiene los picos de tráfico agrupados por hora usando el registro de auditoría.
 * @param {number} days - Días a analizar hacia atrás.
 */
exports.getTrafficPeaks = async (days = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await AuditLog.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp", timezone: "America/Lima" }
                },
                valor: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                fecha: "$_id",
                valor: 1
            }
        }
    ]);
};

/**
 * Obtiene el tiempo de reproducción promedio por día.
 * @param {number} days - Días a analizar hacia atrás.
 */
exports.getAveragePlayback = async (days = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await PlaybackLog.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp", timezone: "America/Lima" } },
                promedio: { $avg: "$durationMinutes" }
            }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, fecha: "$_id", valor: { $round: ["$promedio", 2] } } }
    ]);
};
