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
            <h3>Weather-Based Music (${currentMood})</h3>
            <p class="playlist-description">${this.playlist[currentMood].description}</p>
            <div class="music-player">
                <div class="song-info">
                    <p class="song-title">Playing ${currentMood} music</p>
                    <p class="artist-name">Weather-based soundtrack</p>
                </div>
                <div class="time-info">
                    <span class="current-time">0:00</span>
                    <span class="duration">0:00</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress"></div>
                        <div class="progress-handle"></div>
                    </div>
                </div>
                <div class="player-controls">
                    <button class="prev-btn" title="Previous"><i class="fas fa-backward"></i></button>
                    <button class="play-btn" title="Play/Pause"><i class="fas fa-play"></i></button>
                    <button class="next-btn" title="Next"><i class="fas fa-forward"></i></button>
                </div>
            </div>
        `;

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

// Initialize music player
const musicPlayer = new MusicPlayer(); 