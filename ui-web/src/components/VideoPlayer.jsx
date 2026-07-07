import React, { useState, useRef, useEffect, useCallback } from 'react';

const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const VideoPlayer = ({ src, title, onProgress }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hideControlsTimer = useRef(null);

    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [buffered, setBuffered] = useState(0);
    const [error, setError] = useState(null);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play().catch(() => setError('No se pudo reproducir el video.'));
            setPlaying(true);
        } else {
            video.pause();
            setPlaying(false);
        }
    };

    const handleSeek = (e) => {
        const video = videoRef.current;
        if (!video) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        video.currentTime = ratio * video.duration;
    };

    const handleVolume = (e) => {
        const val = parseFloat(e.target.value);
        videoRef.current.volume = val;
        setVolume(val);
        setMuted(val === 0);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        video.muted = !video.muted;
        setMuted(video.muted);
    };

    const toggleFullscreen = () => {
        const el = containerRef.current;
        if (!document.fullscreenElement) {
            el.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const resetHideTimer = useCallback(() => {
        setShowControls(true);
        clearTimeout(hideControlsTimer.current);
        hideControlsTimer.current = setTimeout(() => {
            if (playing) setShowControls(false);
        }, 3000);
    }, [playing]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            if (onProgress && video.duration) {
                onProgress(video.currentTime, video.duration);
            }
            // Calcular buffer
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1));
            }
        };
        const onLoadedMetadata = () => setDuration(video.duration);
        const onEnded = () => setPlaying(false);
        const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('ended', onEnded);
        document.addEventListener('fullscreenchange', onFullscreenChange);

        return () => {
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('ended', onEnded);
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            clearTimeout(hideControlsTimer.current);
        };
    }, [onProgress]);

    if (!src) {
        return (
            <div style={{
                width: '100%', aspectRatio: '16/9', background: '#0a0a0a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)'
            }}>
                <p style={{ color: '#64748b', fontWeight: 700 }}>Contenido local no disponible</p>
            </div>
        );
    }

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;
    const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            onMouseMove={resetHideTimer}
            onMouseLeave={() => playing && setShowControls(false)}
            style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                background: '#000',
                borderRadius: isFullscreen ? '0' : '16px',
                overflow: 'hidden',
                cursor: showControls ? 'default' : 'none',
            }}
        >
            {/* VIDEO */}
            <video
                ref={videoRef}
                src={src}
                style={{ width: '100%', height: '100%', display: 'block' }}
                onClick={togglePlay}
                onError={() => setError('Error al cargar el video. Verifica el archivo.')}
            />

            {/* ERROR */}
            {error && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <p style={{ color: '#ef4444', fontWeight: 700 }}>{error}</p>
                </div>
            )}

            {/* TÍTULO */}
            {showControls && title && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    padding: '20px',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
                    color: 'white', fontWeight: 700, fontSize: '1rem',
                    transition: 'opacity 0.3s'
                }}>
                    {title}
                </div>
            )}

            {/* CONTROLES */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '12px 16px 16px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                opacity: showControls ? 1 : 0,
                transition: 'opacity 0.3s',
                display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
                {/* BARRA DE PROGRESO */}
                <div
                    onClick={handleSeek}
                    style={{
                        width: '100%', height: '5px', background: 'rgba(255,255,255,0.2)',
                        borderRadius: '5px', cursor: 'pointer', position: 'relative'
                    }}
                >
                    {/* Buffer */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, height: '100%',
                        width: `${bufferedPercent}%`,
                        background: 'rgba(255,255,255,0.35)', borderRadius: '5px'
                    }} />
                    {/* Progreso */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, height: '100%',
                        width: `${progressPercent}%`,
                        background: '#38bdf8', borderRadius: '5px',
                        transition: 'width 0.1s linear'
                    }} />
                    {/* Thumb */}
                    <div style={{
                        position: 'absolute', top: '50%',
                        left: `${progressPercent}%`,
                        transform: 'translate(-50%, -50%)',
                        width: '13px', height: '13px',
                        background: 'white', borderRadius: '50%',
                        boxShadow: '0 0 6px rgba(56,189,248,0.8)'
                    }} />
                </div>

                {/* FILA DE BOTONES */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Play/Pause */}
                    <button onClick={togglePlay} style={btnStyle}>
                        {playing ? '⏸' : '▶'}
                    </button>

                    {/* Volumen */}
                    <button onClick={toggleMute} style={btnStyle}>
                        {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                    </button>
                    <input
                        type="range" min="0" max="1" step="0.05"
                        value={muted ? 0 : volume}
                        onChange={handleVolume}
                        style={{ width: '80px', accentColor: '#38bdf8', cursor: 'pointer' }}
                    />

                    {/* Tiempo */}
                    <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600, marginLeft: '4px' }}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    {/* Spacer */}
                    <div style={{ flex: 1 }} />

                    {/* Fullscreen */}
                    <button onClick={toggleFullscreen} style={btnStyle}>
                        {isFullscreen ? '⛶' : '⛶'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const btnStyle = {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

export default VideoPlayer;