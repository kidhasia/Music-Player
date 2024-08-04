document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('play');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const shuffleBtn = document.getElementById('shuffle');
    const repeatBtn = document.getElementById('repeat');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress-bar');
    const currentTimeEl = document.querySelector('.current-time');
    const totalTimeEl = document.querySelector('.total-time');
    const volumeSlider = document.getElementById('volume');
    const albumArt = document.querySelector('.album-art');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'audio/*';

    let isPlaying = false;
    let currentSongIndex = 0;
    let isShuffled = false;
    let isRepeating = false;

    const audio = new Audio();

    let songs = [];

    function handleFileSelect(event) {
        const files = event.target.files;
        songs = Array.from(files).map(file => ({
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: 'Unknown Artist',
            src: URL.createObjectURL(file),
            img: 'path/to/default-album-art.jpg'
        }));
        if (songs.length > 0) {
            loadSong(songs[0]);
            currentSongIndex = 0;
        }
    }

    fileInput.addEventListener('change', handleFileSelect);

    function togglePlay() {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }

    function playSong() {
        isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        audio.play();
    }

    function pauseSong() {
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        audio.pause();
    }

    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(songs[currentSongIndex]);
        playSong();
    }

    function nextSong() {
        if (isShuffled) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * songs.length);
            } while (newIndex === currentSongIndex);
            currentSongIndex = newIndex;
        } else {
            currentSongIndex = (currentSongIndex + 1) % songs.length;
        }
        loadSong(songs[currentSongIndex]);
        playSong();
    }

    function loadSong(song) {
        document.querySelector('.song-title').textContent = song.title;
        document.querySelector('.artist').textContent = song.artist;
        audio.src = song.src;
        albumArt.src = song.img;
        currentTimeEl.textContent = '0:00';
        audio.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = formatTime(audio.duration);
        });
    }

    function updateProgress() {
        const { duration, currentTime } = audio;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(currentTime);
    }

    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    function toggleShuffle() {
        isShuffled = !isShuffled;
        shuffleBtn.classList.toggle('active');
    }

    function toggleRepeat() {
        isRepeating = !isRepeating;
        repeatBtn.classList.toggle('active');
    }

    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    progressContainer.addEventListener('click', setProgress);
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
    });

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
        if (isRepeating) {
            audio.currentTime = 0;
            playSong();
        } else {
            nextSong();
        }
    });

    // Add a new button to trigger file selection
    const selectFilesBtn = document.createElement('button');
    selectFilesBtn.textContent = 'Select Audio Files';
    selectFilesBtn.addEventListener('click', () => fileInput.click());

    // Insert the new button into the DOM
    document.querySelector('.player-controls').prepend(selectFilesBtn);

    // No initial loadSong call since there are no predefined songs
});
