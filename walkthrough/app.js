(() => {
  const chapters = [{"id": "01", "title": "Platform overview", "description": "A tour of the RunShore console", "group": "Introduction"}, {"id": "02", "title": "Deploy local Kubernetes", "description": "A cluster from nothing", "group": "Platform"}, {"id": "03", "title": "Deploy PostgreSQL", "description": "A three-instance CloudNativePG cluster", "group": "Database operations"}, {"id": "04", "title": "Failover test", "description": "Losing the primary", "group": "Database operations"}, {"id": "05", "title": "Replication test", "description": "A write on the primary, read on a replica", "group": "Database operations"}, {"id": "06", "title": "Recover", "description": "Checking the cluster after the tests", "group": "Database operations"}, {"id": "07", "title": "Deploy New Relic", "description": "Monitoring, validated and with dashboards", "group": "Observability"}, {"id": "08", "title": "Register with New Relic", "description": "Connecting PostgreSQL to monitoring", "group": "Observability"}, {"id": "09", "title": "Assessment", "description": "Point-in-time recovery, proved", "group": "Assessment"}, {"id": "10", "title": "Assessment metrics", "description": "The result in New Relic", "group": "Observability"}, {"id": "11", "title": "Workload metrics", "description": "A pgbench workload, watched live", "group": "Workload"}, {"id": "12", "title": "Ask AI diagnostics", "description": "Questions answered from live evidence", "group": "Diagnostics"}];
  const video = document.getElementById('video');
  const placeholder = document.getElementById('video-placeholder');
  const audioToggle = document.getElementById('audio-toggle');
  const captionsToggle = document.getElementById('captions-toggle');
  const transcriptToggle = document.getElementById('transcript-toggle');
  const transcriptPanel = document.getElementById('transcript-panel');
  const transcriptText = document.getElementById('transcript-text');
  const chapterList = document.getElementById('chapter-list');
  const audio = new Audio();
  audio.preload = 'metadata';
  let activeId = chapters[0].id;
  let audioEnabled = false;
  let captionsEnabled = true;

  document.getElementById('chapter-count').textContent = `${chapters.length} chapters`;

  function setButtonState(button, enabled, onText, offText) {
    button.textContent = enabled ? onText : offText;
    button.classList.toggle('active', enabled);
    button.setAttribute('aria-pressed', String(enabled));
  }

  function setAudio(enabled) {
    audioEnabled = enabled;
    video.muted = true;
    setButtonState(audioToggle, enabled, 'Audio: On', 'Audio: Off');
    if (!enabled) audio.pause();
    else if (!video.paused && audio.src) audio.play().catch(() => {});
  }

  function setCaptions(enabled) {
    captionsEnabled = enabled;
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) tracks[i].mode = enabled ? 'showing' : 'disabled';
    setButtonState(captionsToggle, enabled, 'Captions: On', 'Captions: Off');
  }

  function selectChapter(id, autoplay = false) {
    const chapter = chapters.find(item => item.id === id);
    if (!chapter) return;
    activeId = id;
    const media = window.RUNSHORE_MEDIA?.[id] || {};
    const videoUrl = media.video || '';
    const audioUrl = media.audio || '';
    const captionsUrl = media.captions || '';

    document.getElementById('chapter-number').textContent = `CHAPTER ${chapter.id}`;
    document.getElementById('chapter-title').textContent = chapter.title;
    document.getElementById('chapter-description').textContent = chapter.description;
    transcriptText.textContent = window.RUNSHORE_TRANSCRIPTS?.[id] || 'Transcript not yet supplied for this chapter.';

    chapterList.querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-current', String(button.dataset.id === id));
    });

    video.pause();
    audio.pause();
    audio.src = audioUrl;
    video.innerHTML = '';
    if (videoUrl) {
      video.src = videoUrl;
      if (captionsUrl) {
        const track = document.createElement('track');
        track.kind = 'captions';
        track.label = 'English';
        track.srclang = 'en';
        track.src = captionsUrl;
        track.default = captionsEnabled;
        video.appendChild(track);
      }
      placeholder.hidden = true;
      video.load();
      video.muted = true;
      video.onloadedmetadata = () => setCaptions(captionsEnabled);
      video.onerror = () => { placeholder.hidden = false; };
      if (autoplay) video.play().then(() => { if (audioEnabled && audio.src) audio.play().catch(() => {}); }).catch(() => {});
    } else {
      video.removeAttribute('src');
      video.load();
      placeholder.hidden = false;
    }
  }

  chapters.forEach(chapter => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chapter-button';
    button.dataset.id = chapter.id;
    button.innerHTML = `<span class="chapter-index">${chapter.id}</span><span><span class="chapter-name"></span><span class="chapter-group"></span></span>`;
    button.querySelector('.chapter-name').textContent = chapter.title;
    button.querySelector('.chapter-group').textContent = chapter.group;
    button.addEventListener('click', () => selectChapter(chapter.id));
    chapterList.appendChild(button);
  });

  audioToggle.addEventListener('click', () => setAudio(!audioEnabled));
  captionsToggle.addEventListener('click', () => setCaptions(!captionsEnabled));
  transcriptToggle.addEventListener('click', () => {
    const open = transcriptPanel.hidden;
    transcriptPanel.hidden = !open;
    transcriptToggle.textContent = open ? 'Transcript: Open' : 'Transcript: Closed';
    transcriptToggle.setAttribute('aria-expanded', String(open));
  });
  document.getElementById('playback-speed').addEventListener('change', event => {
    video.playbackRate = Number(event.target.value);
    audio.playbackRate = Number(event.target.value);
  });

  video.addEventListener('play', () => {
    if (audioEnabled && audio.src) {
      audio.currentTime = video.currentTime;
      audio.play().catch(() => {});
    }
  });
  video.addEventListener('pause', () => audio.pause());
  video.addEventListener('seeking', () => {
    if (audioEnabled && audio.src) audio.currentTime = video.currentTime;
  });
  video.addEventListener('timeupdate', () => {
    if (audioEnabled && audio.src && !audio.paused && Math.abs(audio.currentTime - video.currentTime) > 0.45) {
      audio.currentTime = video.currentTime;
    }
  });
  video.addEventListener('ended', () => audio.pause());

  setAudio(false);
  setCaptions(true);
  selectChapter(activeId);
})();
