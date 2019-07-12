const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

function getVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      console.log(localMediaStream);
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch(err => {
      console.error(`Allow access to webcam`, err);
    });
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  // return to a const to use clearInterval() to stop
  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    // Retrieve pixels
    let pixels = ctx.getImageData(0, 0, width, height);
    /* Apply Filter */
    // 1: Red filter
    // pixels = redEffect(pixels);

    // 2: Split and ghost
    // pixels = rgbSplit(pixels);
    // ctx.globalAlpha = 0.1;

    // 3: Green Screen
    pixels = greenScreen(pixels);

    // Put them back to canvas
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function takePhoto() {
  // Play capture sound
  snap.currentTime = 0;
  snap.play();
  // Retrieve data from canvas
  const data = canvas.toDataURL("image/jpeg"); // base 64: text-form of photo
  const link = document.createElement("a");
  link.href = data;
  link.setAttribute("download", "handsome"); // 'handsome' is the name of the image downloaded
  link.innerHTML = `<img src="${data}" alt="Handsome Man"/>`;
  strip.insertBefore(link, strip.firstChild); // prepend
}

// Filters
function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    // Channels
    pixels.data[i] += 200; // red
    pixels.data[i + 1] -= 50; // green
    pixels.data[i + 2]; // blue
  }
  return pixels;
}

function rgbSplit(pixels) {
  const offset = 300;
  for (let i = 0; i < pixels.data.length; i += 4) {
    // Channels
    pixels.data[i - offset] = pixels.data[i]; // red
    pixels.data[i + offset + 50] = pixels.data[i + 1]; // green
    pixels.data[i - offset - 200] = pixels.data[i + 2]; // blue
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};

  // Select all sliders
  document.querySelectorAll(".rgb input").forEach(input => {
    levels[input.name] = input.value;
  });

  for (let i = 0; i < pixels.data.length; i += 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      // Set alpha to 0 to remove pixel
      pixels.data[i + 3] = 0;
    }
  }
  return pixels;
}

getVideo();

video.addEventListener("canplay", paintToCanvas);
