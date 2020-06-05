const { createCanvas, loadImage } = require('canvas');
const { scanImageData } = require('zbar.wasm');

const getImageData = async (src) => {
  const img = await loadImage(src);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
};

const main = async () => {
  const img = await getImageData(__dirname + '/test.png');
  const res = await scanImageData(img);
  console.log(res[0].typeName); // ZBAR_QRCODE
  console.log(res[0].decode()); // Hello World
};

main();