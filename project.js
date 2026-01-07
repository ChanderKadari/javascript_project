const themeToggle = document.querySelector(".theme-toggle");
const promptform = document.querySelector(".prompt-form");
const promptinput = document.querySelector(".prompt-input");
const promptbtn = document.querySelector(".prompt-btn");
const modelselect = document.getElementById("model-select");
const countselect = document.getElementById("count-select");
const ratioselect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid")
const API_KEY = "paste here apikey";//api_key 



const exampleprompt = [
    "A magic forest with glowing plants and fairy homes among giant mushrooms",
    "An old steampunk airship floating through golden clouds at sunset",
    "A future Mars colony with glass domes and gardens against red mountains",
    "A dragon sleeping on gold coins in a crystal cave",
    "An underwater kingdom with merpeople and glowing coral buildings",
    "A floating island with waterfalls pouring into clouds below",
    "A witch's cottage in fall with magic herbs in the garden",
    "A robot painting in a sunny studio with art supplies around it",
    "A magical library with floating glowing books and spiral staircases",
    "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
    "A cosmic beach with glowing sand and an aurora in the night sky",
    "A medieval marketplace with colorful tents and street performers",
    "A cyberpunk city with neon signs and flying cars at night",
    "A peaceful bamboo forest with a hidden ancient temple",
    "A giant turtle carrying a village on its back in the ocean",
];

//saved theme based on localstorage 
(() => {
    const savedTheme = localStorage.getItem("theme")
    const systemprefersDark = window.matchMedia("(prefers-color-scheme:dark)").matches;
    const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemprefersDark)
    document.body.classList.toggle("dark-theme", isDarkTheme);
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";

})();

const getImageDimensions = (ratiovalue, baseSize = 512) => {
    const [w, h] = ratiovalue.split("/").map(Number);
    const scale = baseSize / Math.sqrt(w * h);

    let width = Math.round(w * scale);
    let height = Math.round(h * scale);

    width = Math.floor(width / 16) * 16;
    height = Math.floor(height / 16) * 16;

    return { width, height };
};
// https://router.huggingface.co/fal-ai/fal-ai/z-image/turbo
// https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev
// https://router.huggingface.co/hf-inference/models/

const generateImage = async (selectedModel, imagecount, ratiovalue, promptText) => {
    const MODEL_URL = `https://router.huggingface.co/hf-inference/models/${selectedModel}`;
    const { width, height } = getImageDimensions(ratiovalue);

    const imagePromises = Array.from({ length: imagecount }, async (_, i) => {
        try {
            const response = await fetch(MODEL_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: promptText,
                    parameters: { width, height },
                    options: { wait_for_model: true, use_cache: false },
                }),
            });

            if (!response.ok) throw new Error((await response.json())?.error);

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const card = document.getElementById(`img-card-${i}`);
            const img = card.querySelector(".result-img");
            const status = card.querySelector(".status-container");

            img.src = url;
            status.style.display = "none";
            card.classList.remove("loading");

        } catch (err) {
            console.error(err);
            const card = document.getElementById(`img-card-${i}`);
            card.querySelector(".status-text").textContent = "Failed";
        }
    });

    await Promise.allSettled(imagePromises);
};



// create images with place holders
const createImageCards = (selectedModel, imagecount, ratiovalue, promptText) => {
    gridGallery.innerHTML = "";
    for (let i = 0; i < imagecount; i++) {
        gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio:${ratiovalue}" >
                    <div class="status-container">
                        <div class="spinner"></div>
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <p class="status-text">Generating...</p>
                    </div>
                  <img src="test.png"  class="result-img">
                </div> `;

    }

    generateImage(selectedModel, imagecount, ratiovalue, promptText);
}



const handleFormSubmit = (e) => {
    e.preventDefault();

    const selectedModel = modelselect.value;
    const imagecount = parseInt(countselect.value);
    const ratiovalue = ratioselect.value || "1/1";
    const promptText = promptinput.value.trim();

    createImageCards(selectedModel, imagecount, ratiovalue, promptText)
    console.log(selectedModel, imagecount, ratiovalue, promptText)
}



// switch betwwen light and darktheme
const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

promptbtn.addEventListener("click", () => {
    const prompt = exampleprompt[Math.floor(Math.random() * exampleprompt.length)];
    promptinput.value = prompt;
    promptinput.focus();
})
promptform.addEventListener("submit", handleFormSubmit)
themeToggle.addEventListener("click", toggleTheme)