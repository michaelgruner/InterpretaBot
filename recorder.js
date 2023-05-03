class Recorder {
  constructor() {
    this.mediaRecorder = null;
    this._state = 'idle';
    this.mimeType = 'audio/webm;codecs=opus';
  }

  start() {
    if (this._state === 'recording') {
      return Promise.resolve();
    }
  
    this.chunks = [];
  
    return navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const options = {
          mimeType: this.mimeType
        };
        this.mediaRecorder = new MediaRecorder(stream, options);
  
        this.mediaRecorder.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0) {
            this.chunks.push(event.data);
          }
        });
  
        this.mediaRecorder.start();
        this._state = 'recording';
      })
      .catch((error) => {
        throw error;
      });
  }

  stop() {
    if (this._state === 'idle') {
      return;
    }
  
    return new Promise((resolve, reject) => {
      this.mediaRecorder.addEventListener('stop', () => {
        const extension = this.getFileExtension();
        const filename = `recording.${extension}`;
        const blob = new Blob(this.chunks, { type: this.mimeType });
        const file = new File([blob], filename, { type: this.mimeType });
        resolve(file);
      });
  
      this.mediaRecorder.stop();
      this._state = 'idle';
    });
  }
  
  getFileExtension() {
    const mimeTypeComponents = this.mimeType.split(';');
    const mimeType = mimeTypeComponents[0];
    return mimeType.split('/')[1];
  }

  get state() {
    return this._state;
  }
}