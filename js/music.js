class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.playlist = {
            happy: [
                { title: 'Walking on Sunshine', artist: 'Katrina & The Waves', url: 'assets/music/happy/walking_on_sunshine.mp3' },
                { title: 'Here Comes the Sun', artist: 'The Beatles', url: 'assets/music/happy/here_comes_the_sun.mp3' },
                { title: 'I Got Sunshine', artist: 'Stevie Wonder', url: 'assets/music/happy/i_got_sunshine.mp3' }
            ],
            calm: [
                { title: 'Cloudy Day', artist: 'Relaxing Music', url: 'assets/music/calm/cloudy_day.mp3' },
                { title: 'Gentle Breeze', artist: 'Nature Sounds', url: 'assets/music/calm/gentle_breeze.mp3' },
                { title: 'Peaceful Mind', artist: 'Ambient Music', url: 'assets/music/calm/peaceful_mind.mp3' }
            ],
            melancholic: [
                { title: 'Rainy Mood', artist: 'Rain Sounds', url: 'assets/music/rain/rainy_mood.mp3' },
                { title: 'Rainy Jazz', artist: 'Jazz Ensemble', url: 'assets/music/rain/rainy_jazz.mp3' },
                { title: 'Rain Dance', artist: 'Nature Mix', url: 'assets/music/rain/rain_dance.mp3' }
            ],
            peaceful: [
                { title: 'Winter Wonderland', artist: 'Holiday Music', url: 'assets/music/snow/winter_wonderland.mp3' },
                { title: 'Snowy Evening', artist: 'Classical Piano', url: 'assets/music/snow/snowy_evening.mp3' },
                { title: 'Snow Dance', artist: 'Orchestra', url: 'assets/music/snow/snow_dance.mp3' }
            ],
            intense: [
                { title: 'Thunderstruck', artist: 'Storm Sounds', url: 'assets/music/storm/thunderstruck.mp3' },
                { title: 'Storm Symphony', artist: 'Nature Orchestra', url: 'assets/music/storm/storm_symphony.mp3' },
                { title: 'Lightning Dance', artist: 'Electronic', url: 'assets/music/storm/lightning_dance.mp3' }
            ]
        };
        this.currentMood = 'calm';
        this.currentTrackIndex = 0;
        this.isPlaying = false;

        this.initializeEventListeners();
        this.createMusicFolderStructure();
    }

    createMusicFolderStructure() {
        const structure = `
Please create the following folder structure in your project:

assets/
└── music/
    ├── happy/
    ├── calm/
    ├── rain/
    ├── snow/
    └── storm/

And add your music files to the appropriate folders based on the mood.
Each file should be in MP3 format.
        `;
        console.log(structure);
    }

    initializeEventListeners() {
        // Update progress bar
        this.audio.addEventListener('timeupdate', () => {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            document.querySelector('.progress').style.width = `${progress}%`;
        });

        // Update play button icon when song ends
        this.audio.addEventListener('ended', () => {
            this.playNext();
        });

        // Add click handlers for controls
        document.querySelector('.play-btn').addEventListener('click', () => this.togglePlay());
        document.querySelector('.next-btn').addEventListener('click', () => this.playNext());
        document.querySelector('.prev-btn').addEventListener('click', () => this.playPrevious());

        // Add progress bar click handler
        document.querySelector('.progress-bar').addEventListener('click', (e) => {
            const progressBar = e.currentTarget;
            const clickPosition = (e.pageX - progressBar.offsetLeft) / progressBar.offsetWidth;
            this.audio.currentTime = clickPosition * this.audio.duration;
        });
    }

    setMood(mood) {
        if (this.playlist[mood]) {
            this.currentMood = mood;
            this.currentTrackIndex = 0;
            this.loadCurrentTrack();
            if (this.isPlaying) {
                this.play();
            }
        }
    }

    loadCurrentTrack() {
        const currentPlaylist = this.playlist[this.currentMood];
        if (currentPlaylist && currentPlaylist.length > 0) {
            const track = currentPlaylist[this.currentTrackIndex];
            
            // Check if file exists
            fetch(track.url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Music file not found');
                    }
                    this.audio.src = track.url;
                    this.updateTrackInfo(track);
                })
                .catch(error => {
                    console.error('Error loading music file:', error);
                    this.updateTrackInfo({
                        title: 'Music file not found',
                        artist: 'Please add music files to assets/music folder'
                    });
                });
        }
    }

    updateTrackInfo(track) {
        document.querySelector('.song-title').textContent = track.title;
        document.querySelector('.artist-name').textContent = track.artist;
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
        this.isPlaying = true;
        document.querySelector('.play-btn i').classList.remove('fa-play');
        document.querySelector('.play-btn i').classList.add('fa-pause');
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        document.querySelector('.play-btn i').classList.remove('fa-pause');
        document.querySelector('.play-btn i').classList.add('fa-play');
    }

    playNext() {
        const currentPlaylist = this.playlist[this.currentMood];
        this.currentTrackIndex = (this.currentTrackIndex + 1) % currentPlaylist.length;
        this.loadCurrentTrack();
        if (this.isPlaying) {
            this.play();
        }
    }

    playPrevious() {
        const currentPlaylist = this.playlist[this.currentMood];
        this.currentTrackIndex = (this.currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        this.loadCurrentTrack();
        if (this.isPlaying) {
            this.play();
        }
    }
}

// Initialize music player
const musicPlayer = new MusicPlayer(); 