const video = document.getElementById("video");
const canvas = document.getElementById("takePhotoCanvas");
const start = document.getElementById("getUserMediaButton");
const snap = document.getElementById("takePhotoButton");
let imageCapture;

/* Utils */
const drawCanvas = (canvas, img) => {
  canvas.width = getComputedStyle(canvas).width.split("px")[0];
  canvas.height = getComputedStyle(canvas).height.split("px")[0];
  let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
  let x = (canvas.width - img.width * ratio) / 2;
  let y = (canvas.height - img.height * ratio) / 2;
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  canvas
    .getContext("2d")
    .drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      x,
      y,
      img.width * ratio,
      img.height * ratio
    );
};

const onGetUserMediaButtonClick = _ => {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(mediaStream => {
      video.srcObject = mediaStream;

      const track = mediaStream.getVideoTracks()[0];
      imageCapture = new ImageCapture(track);
    })
    .catch(error => ChromeSamples.log(error));
};

function stopStreamedVideo(videoElem) {
  let stream = videoElem.srcObject;
  let tracks = stream.getTracks();

  tracks.forEach(function(track) {
    track.stop();
  });

  videoElem.srcObject = null;
  videoElem.setAttribute("aria-hidden", true);
}

let picEmotion;

const onTakePhotoButtonClick = _ => {
  imageCapture
    .takePhoto()
    .then(blob => createImageBitmap(blob))
    .then(imageBitmap => {
      canvas.setAttribute("aria-hidden", false);
      drawCanvas(canvas, imageBitmap);
      stopStreamedVideo(video);
      return canvas;
    })
    .then(canvas => {
      generateEmotions(canvas);
    })
    .catch(error => console.log(error));
};

video.addEventListener("play", function() {
  snap.disabled = false;
});

start.onclick = () => onGetUserMediaButtonClick();
snap.onclick = () => onTakePhotoButtonClick();

function generateEmotions(input) {
  faceapi.nets.ssdMobilenetv1
    .loadFromUri("/models")
    .then(async () => {
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");

      const result = await faceapi
        .detectSingleFace(input)
        .withFaceExpressions();
      let output = document.getElementById("emotion");

      if (result) {
        let maxValue = Math.max.apply(null, Object.values(result.expressions));
        for (let item in result.expressions) {
          if (result.expressions[item] === maxValue) {
            output.innerText = `Emotion: ${item}`;
            picEmotion = item;
          }
        }
      } else {
        console.log(`No result, take another photo`);
        output.innerText = `Image failed, please take another one :)`;
      }

      return picEmotion;
    })
    .then(emotion => {
      axios
        .post("/photo", {
          emotion: emotion,
          photo: input.toDataURL("image/jpeg", 0.5)
        })
        .then(response => {
          console.log(response); // response from server with all the comments data array
          // Create anchor element.
          var a = document.createElement("a");

          // Create the text node for anchor element.
          var link = document.createTextNode("Go to playlist");

          // Append the text node to anchor element.
          a.appendChild(link);

          // Set the title.
          a.title = "Go to playlist";

          // Set the href property.
          a.href = `/photo/playlist/${response.data.user}/${response.data._id}`;

          // Append the anchor element to the body.
          document.querySelector(".controller").appendChild(a);
        })
        .catch(err => console.log(err));
    });
}
