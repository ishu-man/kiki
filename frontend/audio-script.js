// this is the script for the audio section.
const progressBar = document.querySelector("#progress");
const audio = document.querySelector("#audio");
const playButton = document.querySelector(".play-button");
const playIcon = document.querySelector(".play-button i");
const topicNamePlaceholder = document.querySelector(".song-name");

let isPlaying = false;

fetch("http://127.0.0.1:8000/api/preferences/", {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
    },
})
   .then(response => response.json())
   .then(JSONresponse => {
    const topicName = JSONresponse[0].topic;
    topicNamePlaceholder.textContent = topicName;
});

const pauseIcon = document.createElement("i");
pauseIcon.setAttribute("class", "fa-solid fa-pause");

audio.addEventListener("loadedmetadata", () => {
    progressBar.max = audio.duration;
    progressBar.value = audio.currentTime;
    durationTimeDisplay.textContent = convertTotalToMinSec(audio.duration);
});

playButton.addEventListener("click", () => {
    // check if the current icon in action is a play icon or a pause icon, if it's a play icon change it to pause and vice versa.
    const currentIcon = document.querySelector(".play-button i").getAttribute("class");
    // console.log(currentIcon);
    if (currentIcon === "fa-solid fa-play") {
        audio.play();
        isPlaying = true;
        updatePlayIcon(isPlaying);
    }
    else {
        audio.pause();
        isPlaying = false;
        updatePlayIcon(isPlaying);
    }

});

// BUG: the slider button is REALLY erratic.
if (audio.play()) {
    setInterval(() => {
        progressBar.value = audio.currentTime;
    }, 500);
}

progressBar.addEventListener("change", () => {
    audio.play();
    audio.currentTime = progressBar.value;
    // the song starts playing if you touch the progress bar, do I really want this to happen?
    isPlaying = true;
    updatePlayIcon(isPlaying);
})

function updatePlayIcon(playing) {
    if (playing) {
        playButton.removeChild(playIcon);
        playButton.appendChild(pauseIcon);
    }
    else {
        playButton.removeChild(pauseIcon);
        playButton.appendChild(playIcon);
    }
}

const fastForwardButton = document.querySelector(".fast-forward-button");
const backwardButton = document.querySelector(".back-button");

fastForwardButton.addEventListener("click", ()=> {
    audio.currentTime += 10;
    progressBar.value = audio.currentTime;
    audio.play();
    isPlaying = true;
    // calling the function here is bogus as I only have to update the icon once, the song will be playing anytime this button is clicked
    // check out the console, a nice little error awaits you if you press fast forward enough times.
    updatePlayIcon(isPlaying);
});

backwardButton.addEventListener("click", ()=> {
    audio.currentTime -= 10;
    progressBar.value = audio.currentTime;
    audio.play();
    isPlaying = true;
    // the same thing as above.
    updatePlayIcon(isPlaying);
});


// now for the logic to update the display of the current-time and duration time.
const currentTimeDisplay = document.querySelector(".current-time");
const durationTimeDisplay = document.querySelector(".duration-time");

function convertTotalToMinSec(givenSeconds) {
    let minutes = Math.floor(givenSeconds/60);
    let seconds = Math.round(givenSeconds % 60);

    if (seconds === 60) {
        seconds = 0;
        minutes += 1;
    }

    // add a zero if single digit seconds.
    if (seconds <= 9) {
        seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
}


if (audio.play()) {
    setInterval(() => {
        currentTimeDisplay.textContent = convertTotalToMinSec(audio.currentTime);
    }, 500);
}