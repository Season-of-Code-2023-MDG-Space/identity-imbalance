const API_URL = "https://apis.paralleldots.com/v4/emotion";
const API_KEY = "X8Ea76ity5Wj50aaWf5JAiFvgFeICmlmKYXthvmUwT0";
const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


// SELECTING DOM ELEMENTS-begin
const text_tag = document.querySelector('.text');
const emotion_tag = document.querySelector('.emotion');
const help_div = document.querySelector('.help-div');
const content_div = document.querySelector('.content');
const details_button = document.querySelector('.button-div button');
const details_div = document.querySelector('.details-div');
const github_buttons = document.querySelectorAll('.footer a');
const emoji = document.querySelector('.emoji');
// SELECTING DOM ELEMENTS-end

// GitHub buttons at the footer functionality-start
github_buttons.forEach((github_button) => {
    github_button.addEventListener('click', () => {
        chrome.tabs.create({url: github_button.href});
    })
})
// GitHub buttons at the footer functionality-end

let emotions;

chrome.tabs.executeScript({
    code: "window.getSelection().toString();" // getting user-selected text
}, function (selection) {
    // making sure user-selected text is not empty
    if (selection === undefined || selection === null) {
        content_div.style.display = 'none';
        return;
    }
    if (selection[0] === '') {
        content_div.style.display = 'none';
        return;
    }


    let selectedText = selection[0]; // user-selected text

    help_div.style.display = 'none';
    text_tag.innerText = selectedText;

    // Building API request data-begin
    const data = new FormData();
    data.append("text", selectedText);
    data.append("api_key", API_KEY);
    data.append("lang_code", "en");

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            clearInterval(initial_interval);
            let response = JSON.parse(xhr.response);
            emotions = response.emotion;
            console.log(emotions);
            let highest = 0;
            let highestEmotion = "";
            Object.keys(emotions).forEach(key => {
                if (emotions[key] > highest) {
                    highest = emotions[key];
                    highestEmotion = key;
                }
            });
            // Sorting emotions on the basis of their probabilities.
            emotions = Object.entries(emotions)
                .sort(([, a], [, b]) => b - a)
                .reduce((r, [k, v]) => ({...r, [k]: v}), {});

            // Displaying detected emotion with randomising effect
            highestEmotion = highestEmotion.toUpperCase();
            let display = "";
            let interval = setInterval(() => {
                    if (display === highestEmotion) {
                        emotion_tag.innerHTML = highestEmotion;
                        emoji.setAttribute('src', 'emojis/' + highestEmotion.toLowerCase() + '.gif');
                        emoji.style.transform = "translateY(-3px)";
                        emoji.style.opacity = 1;
                        clearInterval(interval);
                    }


                    let x = display.length;
                    if (x === highestEmotion.length) {
                        return;
                    }
                    let required_char = highestEmotion[x];
                    let sub_alphabets = required_char;
                    for (let i = 0; i < 5; i++) {
                        sub_alphabets += ALPHABETS[Math.floor(Math.random() * 26)];
                    }
                    let random_char = sub_alphabets[Math.floor(Math.random() * 6)];
                    emotion_tag.innerHTML = display + random_char;
                    if (random_char === required_char) {
                        display += random_char;
                    }
                }, 10
            );

            // Adding details-button functionality
            details_button.addEventListener('click', () => {
                details_button.style.display = 'none';
                details_div.style.display = 'block';
                Object.keys(emotions).forEach(key => {
                    let p_tag = document.createElement('p');
                    p_tag.innerHTML = key + ": " + Math.floor(emotions[key] * 100) + "%";
                    details_div.appendChild(p_tag);
                });
            })
        }
    });

    // Sending request
    xhr.open("POST", API_URL);
    xhr.send(data);


    // Displaying random text till api request response is received.
    let initial_interval = setInterval(() => {
        let random_text = "";
        for (let i = 0; i < 5; i++) {
            random_text += ALPHABETS[Math.floor(Math.random() * 26)];
        }
        emotion_tag.innerHTML = random_text;
    }, 50)
});

