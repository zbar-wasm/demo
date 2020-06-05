import { scanImageData } from 'zbar.wasm';

const SCAN_PROID_MS = 800;

const handleResize = () => {
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  const video = document.getElementById('video');
  video.width = width;
  video.height = height;

  const canvas = document.getElementById('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  if (width / video.videoWidth < height / video.videoHeight) {
    canvas.style.width = '100vw';
    canvas.style.height = 'auto';
  } else {
    canvas.style.width = 'auto';
    canvas.style.height = '100vh';
  }
};

const init = async () => {
  window.onresize = handleResize;
  const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'environment',
        width: { max: 640 },
        height: { max: 640 }
      }
    });
  const video = document.getElementById('video');
  video.srcObject = mediaStream;
  video.play();
  await new Promise(r => {
    video.onloadedmetadata = r;
  });
  handleResize();
};

const render = (symbols) => {
  const canvas = document.getElementById('canvas');
  const footer = document.getElementById('footer');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  while (footer.firstChild) {
    footer.removeChild(footer.lastChild);
  }
  ctx.font = '20px serif';
  ctx.strokeStyle = '#00ff00';
  ctx.fillStyle = '#ff0000';
  ctx.lineWidth = 6;
  for (let i = 0; i < symbols.length; ++i) {
    const sym = symbols[i];
    const points = sym.points;
    ctx.beginPath();
    for (let j = 0; j < points.length; ++j) {
      const { x, y } = points[j];
      if (j === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fillText('#' + i, points[0].x, points[0].y - 10);

    const div = document.createElement('div');
    div.className = 'footerItem';
    div.innerText = `#${i}: Type: ${sym.typeName}; Value: "${sym.decode()}"`
    footer.appendChild(div);
  }
};

const scan = async () => {
  const canvas = document.createElement('canvas');
  const video = document.getElementById('video');
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const res = await scanImageData(imgData);
  // console.log(res, Date.now());
  render(res);
};

const sleep = ms => new Promise(r => { setTimeout(r, ms) });

const main = async () => {
  try {
    await init();
    while (true) {
      await scan();
      await sleep(SCAN_PROID_MS);
    }
  } catch (err) {
    const div = document.createElement('div');
    div.className = 'full middle';
    div.style = 'height: 72px; width: 100%; text-align: center; font-size: 36px';
    div.innerText = 'Cannot get cammera: ' + err;
    document.body.appendChild(div);
    console.error(err);
  }
};

main();