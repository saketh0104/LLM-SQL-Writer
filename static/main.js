// main.js: audio recording, upload, theme toggle, and prompt lock
let mediaRecorder;
let recordedBlobs;
let preview = document.getElementById('preview');
let startBtn = document.getElementById('startBtn');
let stopBtn = document.getElementById('stopBtn');
let uploadBtn = document.getElementById('uploadBtn');
let transcriptionEl = document.getElementById('transcription');
let userPrompt = document.getElementById('userPrompt');
let promptHelp = document.getElementById('promptHelp');

function supportsMime(mime) {
  try {
    return MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime);
  } catch (e) {
    return false;
  }
}

startBtn.addEventListener('click', async () => {
  recordedBlobs = [];
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // pick a sensible mimeType when available
    let options = {};
    if (supportsMime('audio/webm;codecs=opus')) {
      options.mimeType = 'audio/webm;codecs=opus';
    } else if (supportsMime('audio/webm')) {
      options.mimeType = 'audio/webm';
    } else if (supportsMime('audio/ogg;codecs=opus')) {
      options.mimeType = 'audio/ogg;codecs=opus';
    }

    try {
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (err) {
      // fallback to default if constructor fails with options
      console.warn('MediaRecorder with options failed, falling back to default:', err);
      mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorder.ondataavailable = (e) => {
      console.debug('dataavailable event, size=', e.data ? e.data.size : 0);
      if (e.data && e.data.size > 0) {
        recordedBlobs.push(e.data);
      }
    };

    mediaRecorder.onstart = () => console.debug('mediaRecorder started, state=', mediaRecorder.state);
    mediaRecorder.onstop = () => console.debug('mediaRecorder stopped, state=', mediaRecorder.state);
    mediaRecorder.onerror = (ev) => console.error('mediaRecorder error', ev);

    // use a timeslice so some browsers emit dataavailable periodically
    // (this also helps ensure we capture data before stop)
    mediaRecorder.start(1000);

    startBtn.disabled = true;
    stopBtn.disabled = false;
    uploadBtn.disabled = true;
    preview.style.display = 'none';
    transcriptionEl.textContent = 'Recording...';
  } catch (err) {
    console.error('Error accessing microphone:', err);
    alert('Cannot access microphone. Check permissions.');
  }
});

stopBtn.addEventListener('click', () => {
  if (!mediaRecorder) {
    transcriptionEl.textContent = 'No active recording.';
    return;
  }

  // request final chunk and stop
  try {
    if (mediaRecorder.state === 'recording') {
      mediaRecorder.requestData();
      mediaRecorder.stop();
    }
  } catch (err) {
    console.warn('Error stopping mediaRecorder:', err);
  }

  startBtn.disabled = false;
  stopBtn.disabled = true;

  // compute total size to detect empty capture
  const totalSize = (recordedBlobs || []).reduce((sum, b) => sum + (b.size || 0), 0);
  console.debug('total recorded bytes=', totalSize, 'chunks=', recordedBlobs ? recordedBlobs.length : 0);

  if (!recordedBlobs || totalSize === 0) {
    transcriptionEl.textContent = 'No audio captured. Try granting microphone permission or use a different browser.';
    uploadBtn.disabled = true;
    preview.style.display = 'none';
    preview.src = '';
    return;
  }

  const blob = new Blob(recordedBlobs, { type: recordedBlobs[0].type || 'audio/webm' });
  const url = window.URL.createObjectURL(blob);
  preview.src = url;
  preview.style.display = 'block';
  transcriptionEl.textContent = 'Ready to upload.';
  uploadBtn.disabled = false;
});

uploadBtn.addEventListener('click', async () => {
  uploadBtn.disabled = true;
  transcriptionEl.textContent = 'Uploading...';

  const blob = new Blob(recordedBlobs, { type: recordedBlobs[0].type || 'audio/webm' });
  const form = new FormData();
  form.append('file', blob, 'recording.webm');

  try {
    const resp = await fetch('/upload', { method: 'POST', body: form });
    const data = await resp.json();
    if (!data.success) {
      transcriptionEl.textContent = 'Upload failed: ' + (data.error || 'unknown');
      uploadBtn.disabled = false;
      return;
    }

    transcriptionEl.textContent = data.transcription || 'No transcription.';
    if (data.locked) {
      userPrompt.readOnly = true;
      promptHelp.textContent = 'Prompt locked due to audio input.';
    } else {
      userPrompt.readOnly = false;
      promptHelp.textContent = 'Prompt is editable.';
    }

    // If we have transcription text, call backend to generate SQL and run it
    if (data.transcription && data.transcription.trim()) {
      try {
        const qresp = await fetch('/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.transcription })
        });

        const qdata = await qresp.json();
        if (!qdata.success) {
          document.getElementById('generatedSql').textContent = 'Query failed: ' + (qdata.error || 'unknown');
          document.getElementById('queryResults').textContent = '';
        } else {
          document.getElementById('generatedSql').textContent = qdata.sql || '';
          renderResults(qdata.results || []);
        }
      } catch (err) {
        console.error('Query error', err);
        document.getElementById('generatedSql').textContent = 'Query error: ' + err;
      }
    }
  } catch (err) {
    console.error(err);
    transcriptionEl.textContent = 'Upload error: ' + err;
    uploadBtn.disabled = false;
  }
});

// Theme toggle
document.querySelectorAll('.theme-option').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const theme = el.dataset.theme;
    document.body.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.remove('bg-light');
      document.body.classList.add('bg-dark', 'text-white');
    } else {
      document.body.classList.remove('bg-dark', 'text-white');
      document.body.classList.add('bg-light');
    }
  });
});

function renderResults(rows) {
  const container = document.getElementById('queryResults');
  if (!rows || rows.length === 0) {
    container.innerHTML = '<div class="text-muted">No rows returned.</div>';
    return;
  }

  // build table
  const cols = Object.keys(rows[0]);
  let html = '<table class="table table-sm table-striped"><thead><tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
  for (const r of rows) {
    html += '<tr>' + cols.map(c => `<td>${r[c] !== null && r[c] !== undefined ? r[c] : ''}</td>`).join('') + '</tr>';
  }
  html += '</tbody></table>';
  container.innerHTML = html;
}
