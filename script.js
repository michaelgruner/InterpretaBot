function set_error(text) {
  inputText = document.getElementById("inputText");
  inputText.style.color = 'red';
  inputText.value = text;
  console.error(text);
}

function set_text(text) {
  inputText = document.getElementById("inputText");
  inputText.style.color = '';
  inputText.value = text;
}

function set_translation(text) {
  document.getElementById("outputText").value = text;
}

function set_recording_start() {
  // Don't disable the record button because we need it to stop the recording.
  const recordButton = document.getElementById('recordButton');
  recordButton.disabled = false;

  // Change the icon from a microphone to a stop
  var micIcon = document.getElementById("micIcon");
  micIcon.classList.remove("fa-microphone");
  micIcon.classList.add("fa-stop");
}

function set_recording_stop() {
  // Change the icon back to a microhphone
  var micIcon = document.getElementById("micIcon");
  micIcon.classList.remove("fa-stop");
  micIcon.classList.add("fa-microphone");

  // Disable it
  document.getElementById("recordButton").disabled = true;

  // Disable the input spinner
  document.getElementById('inputSpinner').classList.add('d-none');
}

function set_thinking() {
  const inputElements = document.querySelectorAll('input, select, textarea, button');
  inputElements.forEach(element => {
    element.disabled = true;
  });

  // show spinners
  const spinners = document.querySelectorAll('.spinner-border');
  spinners.forEach(spinner => {
    spinner.classList.remove('d-none');
  });
}

function set_idle() {
  // hide spinners
  const spinners = document.querySelectorAll('.spinner-border');
  spinners.forEach(spinner => {
    spinner.classList.add('d-none');
  });

  // enable input elements and button
  const inputElements = document.querySelectorAll('input, select, textarea, button');
  inputElements.forEach(element => {
    element.disabled = false;
  });
}

function interpret() {
  const inputText = document.getElementById("inputText").value;
  const languagePair = document.getElementById("languagePair").value;
  const apiKey = document.getElementById("apiKey").value;

  set_thinking();

  const api = new OpenAI(apiKey);
  api.translate(languagePair, inputText)
    .then(text => {
      set_translation(text);
    })
    .catch(error => {
      set_error(error.message);
    })
    .finally(() => {
      set_idle();
    });
}

// Get the record button and audio element
const recordButton = document.getElementById('recordButton');
const audioElement = document.getElementById('audioElement');

// Set up the media recorder
let recorder;

recordButton.addEventListener('click', () => {
  if (recorder && recorder.state === 'recording') {
    document.getElementById("recordButton").disabled = true;
    recorder.stop()
      .then((file) => {
        const apiKey = document.getElementById("apiKey");

        const api = new OpenAI(apiKey.value);
        api.transcribe(file)
          .then(text => {
            set_text(text);
            interpret();
            set_recording_stop();
          })
          .catch((error) => {
            set_error(error.message);
            set_recording_stop();
            set_idle();
          })
      })
      .catch((error) => {
        set_error(error.message);
        set_idle();
      })
  } else {
    recorder = new Recorder();

    recorder.start()
      .then(() => {
        set_thinking();
        set_recording_start();
      })
      .catch((error) => {
        set_error(error.message);
        set_recording_stop();
        set_idle();
      });
  }
});
