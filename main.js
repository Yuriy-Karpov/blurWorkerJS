var img = new Image();
img.src = './images/big-small-cat2.jpg';
img.onload = function () {
    draw(this);
};

function draw(img) {
    var canvas = document.getElementById('canvas');
    var canvas2 = document.getElementById("canvas2");
    var ctx = canvas.getContext('2d');
    var ctx2 = canvas2.getContext("2d");

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas2.width = img.naturalWidth;
    canvas2.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);
    ctx2.drawImage(img, 0, 0);
    // img.style.display = 'none';
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var target = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const data = imageData.data;

    const rgba = imageData.data;

    const len = img.naturalWidth * img.naturalHeight;
    let rSrc = new Uint8Array(len);
    let gSrc = new Uint8Array(len);
    let bSrc = new Uint8Array(len);
    let aSrc = new Uint8Array(len);

    const blusrRGB = function () {
        console.time('runBluerJS');
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const radius = 10;

        let offset = 0;
        let rgbaUnit = new Uint8Array(imageData.data.buffer);
        for (let i = 0; i < len; i++) {
            rSrc[i] = rgba[offset++];
            gSrc[i] = rgba[offset++];
            bSrc[i] = rgba[offset++];
            aSrc[i] = rgba[offset++];
        }

        // gaussMatrix(rgbaUnit, rgbaUnit, w, h, radius);
        gaussMatrix(rSrc, rSrc, w, h, radius);
        gaussMatrix(gSrc, gSrc, w, h, radius);
        gaussMatrix(bSrc, bSrc, w, h, radius);
        // gaussMatrix(aSrc, aSrc, w, h, radius);
        const tableSize = 2 * radius + 1;

        workerCore.onmessage = function (e) {
            // console.log('++Message received from worker: ', e)
            rSrc[e.data[0]] = e.data[1] / tableSize;
        }


        // setTimeout(() => {
  

        // }, 20000);
        for (i = 0, offset = 0; i < len; i++) {
            rgba[offset++] = rSrc[i];
            rgba[offset++] = gSrc[i];
            rgba[offset++] = bSrc[i];
            rgba[offset++] = aSrc[i]; // or just increase offset if you skipped alpha
        }
        ctx2.putImageData(imageData, 0, 0);
        console.log('END')
        console.timeEnd('runBluerJS');
    }

    var invertbtn = document.getElementById('invertbtn');
    invertbtn.addEventListener('click', blusrRGB);
}
const workerCore = new Worker("worker.js");
async function gaussMatrix(src, target, width, height, radius) {

    const tableSize = 2 * radius + 1;
    const widthMax = width - 1;
    const heightMax = height - 1;

    for (let y = 0; y < height; y++) {
        const indexHorizontLine = y * width;
        for (let indexPixelInLine = 0; indexPixelInLine < width; indexPixelInLine++) {
            const indexPixel = indexPixelInLine + indexHorizontLine;
            workerCore.postMessage([
                src,
                indexPixel,
                indexPixelInLine,
                radius,
                widthMax,
                1
            ])
            // target[indexPixel] = tmpPixel / tableSize;
        }
    }
    const offset = width;
    for (let x = 0; x < width; x++) {
        for (let indexVertical = 0; indexVertical < height; indexVertical++) {
            const indexPixel = indexVertical * offset + x;
            workerCore.postMessage([
                src,
                indexPixel,
                indexVertical,
                radius,
                heightMax,
                offset
            ]);
            target[indexPixel] = tmpPixel / tableSize;
        }
    }
}