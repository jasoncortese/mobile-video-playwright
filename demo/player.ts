const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const video = document.querySelector<HTMLVideoElement>('video')!;
const play = element<HTMLButtonElement>('play');
const seek = element<HTMLInputElement>('seek');
const mute = element<HTMLButtonElement>('mute');
const captions = element<HTMLButtonElement>('captions');
const status = element<HTMLParagraphElement>('status');
const error = element<HTMLDivElement>('error');
const storageKey = 'frame:motion-study:position';
const formatTime = (seconds: number) => `0:${Math.floor(seconds).toString().padStart(2, '0')}`;
let restoring = true;

function readPosition(): number {
  try {
    const value = Number(localStorage.getItem(storageKey));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch { return 0; }
}

function savePosition() {
  if (restoring) return;
  try { localStorage.setItem(storageKey, String(video.ended ? 0 : video.currentTime)); }
  catch { /* Playback remains usable when storage is unavailable. */ }
}

function updateTime() {
  seek.value = String(video.currentTime);
  element<HTMLOutputElement>('time').textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration || 12)}`;
  savePosition();
}

function showError() {
  error.hidden = false;
  play.disabled = true;
  seek.disabled = true;
  status.textContent = 'Playback interrupted';
}

video.addEventListener('loadedmetadata', () => {
  seek.max = String(Math.floor(video.duration));
  const saved = readPosition();
  video.currentTime = saved < video.duration - 0.5 ? saved : 0;
  restoring = false;
  updateTime();
});
video.addEventListener('canplay', () => {
  error.hidden = true;
  play.disabled = false;
  seek.disabled = false;
  if (video.paused) status.textContent = video.currentTime > 0 ? 'Ready to resume' : 'Ready to play';
});
video.addEventListener('play', () => {
  play.textContent = 'Pause';
  status.textContent = 'Playing';
});
video.addEventListener('pause', () => {
  play.textContent = 'Play';
  if (!video.ended && error.hidden) status.textContent = 'Paused';
  savePosition();
});
video.addEventListener('ended', () => {
  play.textContent = 'Replay';
  status.textContent = 'Finished';
  savePosition();
});
video.addEventListener('timeupdate', updateTime);
video.addEventListener('seeked', updateTime);
video.addEventListener('error', showError);

play.addEventListener('click', async () => {
  if (!video.paused) return video.pause();
  if (video.ended) video.currentTime = 0;
  try { await video.play(); }
  catch { showError(); }
});
seek.addEventListener('input', () => {
  video.currentTime = Number(seek.value);
  // Save the user's selection now: a reload may precede the next timeupdate.
  savePosition();
});
mute.addEventListener('click', () => {
  video.muted = !video.muted;
  mute.textContent = video.muted ? 'Sound off' : 'Sound on';
  mute.setAttribute('aria-label', video.muted ? 'Unmute audio' : 'Mute audio');
  mute.setAttribute('aria-pressed', String(video.muted));
});
captions.addEventListener('click', () => {
  const track = video.textTracks[0];
  const show = track.mode !== 'showing';
  track.mode = show ? 'showing' : 'disabled';
  captions.setAttribute('aria-label', show ? 'Hide captions' : 'Show captions');
  captions.setAttribute('aria-pressed', String(show));
});
element<HTMLButtonElement>('retry').addEventListener('click', () => {
  restoring = true;
  error.hidden = true;
  status.textContent = 'Loading video…';
  video.load();
});

// Both formats are local, generated fixtures; no external streaming service is needed.
video.src = video.canPlayType('video/mp4') ? '/media/motion.mp4' : '/media/motion.webm';
