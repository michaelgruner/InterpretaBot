const Speaker = {
  ONE: 1,
  TWO: 2
};

function clear_output() {
  const tas = document.querySelectorAll(`textarea`);
  tas.forEach(ta => {
    ta.value = "";
  });
}

function copy_text(speaker) {
  var textarea = document.getElementById(`outputText${speaker}`);
  textarea.select();
  document.execCommand("copy");

  var notification = document.getElementById('copyNotification');
  notification.classList.remove("d-none");

  setTimeout(function() {
    notification.classList.add("d-none");
  }, 2000);
}

function set_error(text, speaker) {
  inputText = document.getElementById(`inputText${speaker}`);
  inputText.style.color = 'red';
  inputText.value = text;
  console.error(text);
}

function get_other(speaker) {
  return speaker == 2 ? 1 : 2;
}

function set_translation(text, speaker) {
  const other = get_other(speaker);
  document.getElementById(`outputText${other}`).value += `SPEAKER ${speaker}:\n${text}\n\n`;
}

function set_text(text, speaker) {
  inputText = document.getElementById(`inputText${speaker}`);
  inputText.style.color = '';
  inputText.value = text;

  const other = get_other(speaker);
  set_translation(text, other);
}

function set_recording_start(speaker) {
  // Don't disable the record button because we need it to stop the recording.
  const recordButton = document.getElementById(`recordButton${speaker}`);
  recordButton.disabled = false;

  // Change the icon from a microphone to a stop
  var micIcon = document.getElementById(`micIcon${speaker}`);
  micIcon.classList.remove("fa-microphone");
  micIcon.classList.add("fa-stop");
}

function set_recording_stop(speaker) {
  // Change the icon back to a microphone
  var micIcon = document.getElementById(`micIcon${speaker}`);
  micIcon.classList.remove("fa-stop");
  micIcon.classList.add("fa-microphone");

  // Disable it
  document.getElementById(`recordButton${speaker}`).disabled = true;

  // Disable the input spinner
  document.getElementById(`inputSpinner${speaker}`).classList.add('d-none');
  document.getElementById(`inputSpinner${speaker}`).classList.remove('d-flex');

}

function set_thinking(speaker) {
  const inputElements = document.querySelectorAll(`input,select,button,textarea`);
  inputElements.forEach(element => {
    element.disabled = true;
  });

  // show spinners
  const spinners = document.querySelectorAll('.spinner');
  spinners.forEach(spinner => {
    spinner.classList.remove('d-none');
    spinner.classList.add('d-flex');
  });
}

function set_idle(speaker) {
  // hide spinners
  const spinners = document.querySelectorAll('.spinner');
  spinners.forEach(spinner => {
    spinner.classList.add('d-none');
    spinner.classList.remove('d-flex');
  });

  // enable input elements and button
  const inputElements = document.querySelectorAll('input,select,button,textarea');
  inputElements.forEach(element => {
    element.disabled = false;
  });
}

function interpret(speaker) {
  const other = get_other(speaker);
  const inputText = document.getElementById(`inputText${speaker}`).value;
  const language = document.getElementById(`language${speaker}`).value;
  const otherLanguage = document.getElementById(`language${other}`).value;
  const apiKey = document.getElementById("apiKey").value;

  set_thinking();
  
  const api = new OpenAI(apiKey);
  api.translate(`${language}-${otherLanguage}`, inputText)
    .then(text => {
      set_translation(text, speaker);
    })
    .catch(error => {
      set_error(error.message, speaker);
    })
    .finally(() => {
      set_idle(speaker);
    });
}

// Set up the media recorder
let recorder;

function installButtonCallback(speaker) {
  const recordButton = document.getElementById(`recordButton${speaker}`);

  recordButton.addEventListener('click', () => {
    if (recorder && recorder.state === 'recording') {
      document.getElementById(`recordButton${speaker}`).disabled = true;
      recorder.stop()
        .then((file) => {
          const apiKey = document.getElementById("apiKey");
          const api = new OpenAI(apiKey.value);
          api.transcribe(file)
            .then(text => {
              set_text(text, speaker);
              interpret(speaker);
              set_recording_stop(speaker);
            })
            .catch((error) => {
              set_error(error.message, speaker);
              set_recording_stop(speaker);
              set_idle(speaker);
            })
        })
        .catch((error) => {
          set_error(error.message, speaker);
          set_idle(speaker);
        })
    } else {
      recorder = new Recorder();

      recorder.start()
        .then(() => {
          set_thinking(speaker);
          set_recording_start(speaker);
        })
        .catch((error) => {
          set_error(error.message, speaker);
          set_recording_stop(speaker);
          set_idle(speaker);
        });
    }
  });

  const copyButton = document.getElementById(`copyButton${speaker}`);
  copyButton.addEventListener('click', () => {
    copy_text(speaker);
  });

}

installButtonCallback(1);
installButtonCallback(2);