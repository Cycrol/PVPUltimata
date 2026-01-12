// Background Music Manager
const musicManager = {
    audio: null,
    gameOverAudio: null,
    musicFiles: [
        'sound/bgm/cinematic-battle-music-271343.mp3',
        'sound/bgm/cinematic-music-epic-fighting-270919.mp3',
        'sound/bgm/cinematic-trailer-music-270911.mp3',
        'sound/bgm/fighting-warrior-defense-music-354629.mp3',
        'sound/bgm/soldier-soldier-warrior-fighting-music-261172.mp3',
        'sound/bgm/soldier-soldier-warrior-fighting-music-277977.mp3',
        'sound/bgm/soldier-warrior-fighting-music-261893.mp3',
        'sound/bgm/soldier-warrior-fighting-soldier-music-269377.mp3',
        'sound/bgm/warrior-defense-fighting-music-335681 (1).mp3'
    ],
    
    init() {
        // Create audio element if it doesn't exist
        if (!this.audio) {
            this.audio = new Audio();
            this.audio.addEventListener('ended', () => this.playNextTrack());
        }
        
        // Create game over audio element
        if (!this.gameOverAudio) {
            this.gameOverAudio = new Audio();
            this.gameOverAudio.src = 'sound/gameover1.mp3';
            this.gameOverAudio.volume = 0.7;
        }
    },
    
    getRandomTrack() {
        const randomIndex = Math.floor(Math.random() * this.musicFiles.length);
        return this.musicFiles[randomIndex];
    },
    
    playNextTrack() {
        const track = this.getRandomTrack();
        this.audio.src = track;
        this.audio.volume = 0.35; // Set volume to 35%
        this.audio.play().catch(err => {
            console.error('Error playing audio:', err);
        });
    },
    
    start() {
        this.init();
        this.playNextTrack();
    },
    
    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    },
    
    pause() {
        if (this.audio) {
            this.audio.pause();
        }
    },
    
    resume() {
        if (this.audio) {
            this.audio.play().catch(err => {
                console.error('Error resuming audio:', err);
            });
        }
    },
    
    playGameOver() {
        this.init();
        // Stop background music
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
        // Play game over sound
        this.gameOverAudio.currentTime = 0;
        this.gameOverAudio.play().catch(err => {
            console.error('Error playing game over sound:', err);
        });
    },
    
    playLaserSound() {
        const laserSounds = ['sound/laser1.mp3', 'sound/laser2.mp3'];
        const randomSound = laserSounds[Math.floor(Math.random() * laserSounds.length)];
        
        const laserAudio = new Audio();
        laserAudio.src = randomSound;
        laserAudio.volume = 0.6;
        laserAudio.play().catch(err => {
            console.error('Error playing laser sound:', err);
        });
    },
    
    playExplosionSound() {
        const explosionAudio = new Audio();
        explosionAudio.src = 'sound/explosion_mc.mp3';
        explosionAudio.volume = 0.7;
        explosionAudio.play().catch(err => {
            console.error('Error playing explosion sound:', err);
        });
    },
    
    setVolume(volume) {
        if (this.audio) {
            this.audio.volume = Math.max(0, Math.min(1, volume));
        }
    }
};

