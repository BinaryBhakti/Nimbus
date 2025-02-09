class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.currentMood = 'calm';
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.baseUrl = window.location.origin;
        this.playlist = {
            blissful: {
                description: 'Happy, Cheerful, Upbeat songs for sunny days',
                songs: []
            },
            calm: {
                description: 'Chill, Acoustic, Relaxing songs for gentle weather',
                songs: []
            },
            melancholic: {
                description: 'Emotional, Heartfelt songs for cloudy days',
                songs: []
            },
            intense: {
                description: 'Powerful, Dramatic songs for stormy weather',
                songs: []
            },
            dreamy: {
                description: 'Lo-Fi, Indie, Thoughtful songs for dreamy evenings',
                songs: []
            }
        };

        // Add error handling for audio
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            console.error('Error code:', this.audio.error?.code);
            console.error('Current src:', this.audio.src);
            // Try playing next song on error
            this.playNext();
        });

        this.initializeEventListeners();
    }

    async setMood(mood) {
        if (this.playlist[mood]) {
            this.currentMood = mood;
            console.log('Setting mood to:', mood);
            
            // Get a random song from the mood folder
            const songPath = `/assets/music/${mood}/`;
            this.audio.src = songPath + this.getRandomSongFromFolder(mood);
            
            // Log the path being used
            console.log('Playing from path:', this.audio.src);
            
            // Preload the audio
            this.audio.load();
            
            // Update display
            this.updatePlaylistDisplay();
            
            // Start playing if it was playing before
            if (this.isPlaying) {
                this.play();
            }
        }
    }

    getRandomSongFromFolder(mood) {
        // This would normally need server-side support to get the list of files
        // For now, we'll assume files are named numerically like 1.mp3, 2.mp3, etc.
        const songCount = 5; // Assume 5 songs per mood
        const randomNum = Math.floor(Math.random() * songCount) + 1;
        return `${randomNum}.mp3`;
    }

    updatePlaylistDisplay() {
        const musicCard = document.querySelector('.music-card');
        const currentMood = this.currentMood;
        
        musicCard.innerHTML = `
            <div class="music-header">
                <h3>Weather-Based Music</h3>
                <p class="playlist-description">${this.playlist[currentMood].description}</p>
            </div>
            <div class="music-player">
                <div class="song-info">
                    <p class="song-title">Playing ${currentMood} music</p>
                    <p class="artist-name">Weather-based soundtrack</p>
                </div>
                <div class="player-section">
                    <div class="player-controls">
                        <button class="prev-btn" title="Previous"><i class="fas fa-backward"></i></button>
                        <button class="play-btn" title="Play/Pause"><i class="fas fa-play"></i></button>
                        <button class="next-btn" title="Next"><i class="fas fa-forward"></i></button>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress"></div>
                            <div class="progress-handle"></div>
                        </div>
                        <div class="time-info">
                            <span class="current-time">0:00</span>
                            <span class="duration">0:00</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add styles for the new layout
        const style = document.createElement('style');
        style.textContent = `
            .music-card {
                background: linear-gradient(135deg, var(--secondary-bg), rgba(52, 152, 219, 0.2));
                border-radius: 15px;
                padding: 1rem;
                position: relative;
                overflow: hidden;
                height: 280px;
                display: flex;
                flex-direction: column;
            }

            .music-header {
                margin-bottom: 0.75rem;
            }

            .music-header h3 {
                font-size: 1.1rem;
                margin-bottom: 0.25rem;
            }

            .playlist-description {
                font-size: 0.85rem;
                color: var(--text-secondary);
                line-height: 1.2;
            }

            .music-player {
                flex: 1;
                padding: 1rem;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                display: flex;
                flex-direction: column;
            }

            .song-info {
                text-align: center;
                margin-bottom: 0.75rem;
            }

            .song-title {
                font-size: 1rem;
                margin-bottom: 0.15rem;
                color: var(--text-primary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .artist-name {
                font-size: 0.85rem;
                color: var(--text-secondary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .player-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: 0.5rem;
            }

            .player-controls {
                display: flex;
                justify-content: center;
                gap: 1.25rem;
            }

            .player-controls button {
                background: none;
                border: none;
                color: var(--text-primary);
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s ease;
                padding: 0.35rem;
                border-radius: 50%;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .player-controls button:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: scale(1.1);
            }

            .progress-container {
                padding: 0 0.25rem;
            }

            .progress-bar {
                height: 3px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 1.5px;
                cursor: pointer;
                position: relative;
                margin-bottom: 0.25rem;
            }

            .progress {
                height: 100%;
                background: var(--accent-color);
                border-radius: 1.5px;
                position: relative;
                transition: width 0.1s linear;
            }

            .progress-handle {
                position: absolute;
                right: -4px;
                top: 50%;
                width: 8px;
                height: 8px;
                background: var(--accent-color);
                border-radius: 50%;
                transform: translate(0, -50%);
                cursor: pointer;
                transition: transform 0.1s ease;
            }

            .progress-handle:hover {
                transform: translate(0, -50%) scale(1.2);
            }

            .time-info {
                display: flex;
                justify-content: space-between;
                font-size: 0.7rem;
                color: var(--text-secondary);
                margin-top: 0.15rem;
            }
        `;
        document.head.appendChild(style);

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Time update event for progress bar and time display
        this.audio.addEventListener('timeupdate', () => {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            const progressBar = document.querySelector('.progress');
            const progressHandle = document.querySelector('.progress-handle');
            const currentTimeDisplay = document.querySelector('.current-time');
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            if (progressHandle) {
                progressHandle.style.left = `${progress}%`;
            }
            if (currentTimeDisplay) {
                currentTimeDisplay.textContent = this.formatTime(this.audio.currentTime);
            }
        });

        // Duration change event for total time display
        this.audio.addEventListener('durationchange', () => {
            const durationDisplay = document.querySelector('.duration');
            if (durationDisplay) {
                durationDisplay.textContent = this.formatTime(this.audio.duration);
            }
        });

        this.audio.addEventListener('ended', () => {
            this.playNext();
        });

        const playBtn = document.querySelector('.play-btn');
        const nextBtn = document.querySelector('.next-btn');
        const prevBtn = document.querySelector('.prev-btn');
        const progressContainer = document.querySelector('.progress-container');

        if (playBtn) playBtn.addEventListener('click', () => this.togglePlay());
        if (nextBtn) nextBtn.addEventListener('click', () => this.playNext());
        if (prevBtn) prevBtn.addEventListener('click', () => this.playNext());

        if (progressContainer) {
            let isDragging = false;

            progressContainer.addEventListener('mousedown', (e) => {
                isDragging = true;
                this.updateProgressFromEvent(e);
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    this.updateProgressFromEvent(e);
                }
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });

            // Also handle regular clicks
            progressContainer.addEventListener('click', (e) => {
                this.updateProgressFromEvent(e);
            });
        }
    }

    updateProgressFromEvent(e) {
        const progressContainer = document.querySelector('.progress-container');
        const rect = progressContainer.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = clickPosition * this.audio.duration;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                const playButton = document.querySelector('.play-btn i');
                if (playButton) {
                    playButton.classList.remove('fa-play');
                    playButton.classList.add('fa-pause');
                }
                console.log('Playing:', this.audio.src);
            }).catch(error => {
                console.error('Error playing audio:', error);
                console.log('Audio state:', {
                    currentSrc: this.audio.currentSrc,
                    readyState: this.audio.readyState,
                    networkState: this.audio.networkState,
                    error: this.audio.error
                });
            });
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        document.querySelector('.play-btn i').classList.remove('fa-pause');
        document.querySelector('.play-btn i').classList.add('fa-play');
    }

    playNext() {
        // Just play another random song from the same mood
        this.setMood(this.currentMood);
    }
}

// Export a single instance
export const musicPlayer = new MusicPlayer(); 