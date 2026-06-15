const fs   = require('fs');
const path = require('path');

// Tipos MIME por extensión
const MIME_TYPES = {
    '.mp4':  'video/mp4',
    '.mkv':  'video/x-matroska',
    '.webm': 'video/webm',
    '.avi':  'video/x-msvideo',
    '.mov':  'video/quicktime',
};

const CHUNK_SIZE = 1024 * 1024; // 1 MB por fragmento por defecto

/**
 * Verifica que el archivo existe y es un video soportado.
 * Lanza un error con código si no cumple.
 */
function validateVideoFile(filePath) {
    if (!fs.existsSync(filePath)) {
        const err = new Error('Archivo de video no encontrado en el servidor');
        err.statusCode = 404;
        throw err;
    }
    const ext = path.extname(filePath).toLowerCase();
    if (!MIME_TYPES[ext]) {
        const err = new Error(`Formato de video no soportado: ${ext}`);
        err.statusCode = 415;
        throw err;
    }
    return { ext, mimeType: MIME_TYPES[ext] };
}

/**
 * Parsea el header Range: bytes=start-end y devuelve { start, end }.
 * Si no viene header Range devuelve null (se servirá el archivo completo).
 */
function parseRange(rangeHeader, fileSize) {
    if (!rangeHeader) return null;

    const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
    if (!match) return null;

    const start = match[1] !== '' ? parseInt(match[1], 10) : 0;
    const end   = match[2] !== '' ? parseInt(match[2], 10) : fileSize - 1;

    if (start > end || end >= fileSize) {
        const err = new Error('Rango de bytes fuera de límites');
        err.statusCode = 416;
        err.headers = { 'Content-Range': `bytes */${fileSize}` };
        throw err;
    }

    return { start, end };
}

/**
 * Escribe la respuesta de streaming al objeto `res` de Express.
 * Soporta 206 Partial Content (Range Requests) y 200 completo.
 *
 * @param {string} filePath  - Ruta absoluta al archivo de video
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
function streamVideo(filePath, req, res) {
    const { mimeType } = validateVideoFile(filePath);
    const { size: fileSize } = fs.statSync(filePath);

    const range = parseRange(req.headers['range'], fileSize);

    const onStreamError = (err) => {
        console.error(`[streaming] Error leyendo archivo ${filePath}: ${err.message}`);
        if (!res.headersSent) res.status(500).end();
        else res.end();
    };

    if (range) {
        // Servir fragmento con 206 Partial Content
        const { start, end } = range;
        const chunkSize = end - start + 1;

        res.writeHead(206, {
            'Content-Range':  `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges':  'bytes',
            'Content-Length': chunkSize,
            'Content-Type':   mimeType,
        });

        fs.createReadStream(filePath, { start, end })
            .on('error', onStreamError)
            .pipe(res);
    } else {
        // Sin header Range: enviar archivo completo con soporte declarado de rangos
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type':   mimeType,
            'Accept-Ranges':  'bytes',
        });

        fs.createReadStream(filePath, { highWaterMark: CHUNK_SIZE })
            .on('error', onStreamError)
            .pipe(res);
    }
}

module.exports = { streamVideo, validateVideoFile };
