var img = new Image();
img.src = './images/pixel-6.jpg';
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
    // console.log('data: ', data);

    const rgba = imageData.data;

    console.log(JSON.stringify(rgba))

    const len = img.naturalWidth * img.naturalHeight;
    let rSrc = new Uint8Array(len);
    let gSrc = new Uint8Array(len);
    let bSrc = new Uint8Array(len);
    let aSrc = new Uint8Array(len);

    const blusrRGB = function () {
        console.time('blusrRGB')
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const radius = 8;

        let offset = 0;
        let rgbaUnit = new Uint8Array(imageData.data.buffer);
        // for (let i = 0; i < len; i++) {
        //     rSrc[i] = rgba[offset++];
        //     gSrc[i] = rgba[offset++];
        //     bSrc[i] = rgba[offset++];
        //     aSrc[i] = rgba[offset++];
        // }

        gaussMatrix(rgbaUnit, rgbaUnit, w, h, radius);
        // gaussMatrix(rSrc, rSrc, w, h, radius);
        // gaussMatrix(gSrc, gSrc, w, h, radius);
        // gaussMatrix(bSrc, bSrc, w, h, radius);
        // gaussMatrix(aSrc, aSrc, w, h, radius);

        for (i = 0, offset = 0; i < len; i++) {
            rgba[offset++] = rSrc[i];
            rgba[offset++] = gSrc[i];
            rgba[offset++] = bSrc[i];
            rgba[offset++] = aSrc[i]; // or just increase offset if you skipped alpha
        }

        ctx2.putImageData(imageData, 0, 0);
        console.timeEnd('blusrRGB');
        console.log('END')
    }

    const bluer = function () {
        const R = 5;
        const totalScale = 2 * R + 1;
        let pixel = 0;
        let deltaBright = 0
        // for (let i = 0; i < data.length; i += 4) {     deltaBright += data[i] +
        // data[i+1] + data[i+2];     pixel += 1; } deltaBright = deltaBright / pixel;
        // console.log('deltaBright:', deltaBright);
        for (let i = 0; i < data.length; i += 4) {
            pixel += 1;
            const red = i;
            const green = i + 1;
            const blue = i + 2;
            const alfa = i + 3; // decode jpg ignored
            const brightness = data[red] + data[green] + data[blue]; // for jpg

            const rightR = red + 32;
            const rightG = green + 16;
            const rightB = blue;
            const leftR = red - 4;
            const leftG = green - 4;
            const leftB = blue - 4;

            data[red] = gaussBlur_1(data[red], data[red], img.naturalWidth, img.naturalHeight, 2);
            data[green] = gaussBlur_1(data[green], data[red], img.naturalWidth, img.naturalHeight, 2);
            data[blue] = gaussBlur_1(data[blue], data[red], img.naturalWidth, img.naturalHeight, 2);
        }
        console.log('pixel:', pixel);
        ctx.putImageData(imageData, 0, 0);
    }

    var invertbtn = document.getElementById('invertbtn');
    invertbtn.addEventListener('click', blusrRGB);
}

function gaussMatrix(src, target, width, height, radius) {

    const tableSize = 2 * radius + 1;
    const widthMax = width - 1;
    const heightMax = height - 1;

    for (let y = 0; y < height; y++) {
        const indexHorizontLine = y * width;

        for (let indexPixelInLine = 0; indexPixelInLine < width; indexPixelInLine++) {

            const indexPixel = indexPixelInLine + indexHorizontLine;

            const tmpPixel = blurCore(src, indexPixel, indexPixelInLine, radius, widthMax)

            target[indexPixel] = tmpPixel / tableSize;
        }
    }
    const offset = width;
    for (let x = 0; x < width; x++) {
        for (let indexVertical = 0; indexVertical < height; indexVertical++) {
            const indexPixel = indexVertical * offset + x;
            const tmpPixel = blurCore(src, indexPixel, indexVertical, radius, heightMax, offset);
            target[indexPixel] = tmpPixel / tableSize;
        }
    }
}

function blurCore(src, inIndex, indexInLine, radius, max, offset = 1) {
    let tmpPixel = 0;
    for (let r = -radius; r <= radius; r++) {
        const targetPixel = indexInLine + r;

        if (targetPixel <= 0) {
            let t = r;
            // tmpPixel += src[inIndex];
            while (indexInLine + t < 0) {
                t++;
            }
            tmpPixel += src[inIndex + t * offset];
            continue;
        }
        if (targetPixel > max) {

            let t = r;
            while (indexInLine + t * offset > max) {
                t--;
            }
            tmpPixel += src[inIndex + t * offset];
            // tmpPixel += src[inIndex];
            continue;
        }
        let pxIndex;
        switch (Math.sign(r)) {
            case - 1:
                pxIndex = inIndex - (Math.abs(r) * offset);
                break;
            case 0:
                pxIndex = inIndex;
                break;
            case 1:
                pxIndex = inIndex + (Math.abs(r) * offset);
                break;
            default:
                pxIndex = inIndex;
                break;
        }
        tmpPixel += src[pxIndex];
    }
    // console.log('====== next circul =====')
    return tmpPixel;
}

function gaussBlur_simple(scl, tcl, w, h, r) {
    const rs = Math.ceil(r * 2.57); // significant radius
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            let val = 0;
            let wsum = 0;
            for (let iy = i - rs; iy < i + rs + 1; iy++) {
                for (let ix = j - rs; ix < j + rs + 1; ix++) {
                    const x = Math.min(w - 1, Math.max(0, ix));
                    const y = Math.min(h - 1, Math.max(0, iy));
                    const dsq = (ix - j) * (ix - j) + (iy - i) * (iy - i);
                    const wght = Math.exp(-dsq / (2 * r * r)) / (Math.PI * 2 * r * r);
                    val += scl[y * w + x] * wght;
                    wsum += wght;
                }
            }
            tcl[i * w + j] = Math.round(val / wsum);
        }
    }
}

function boxesForGauss(sigma, n) { // standard deviation, number of boxes
    var
    wIdeal = Math. sqrt((12 * sigma * sigma / n) +1); // Ideal averaging filter width
    var
    wl = Math. floor(wIdeal);if
    (wl % 2 == 0) wl--;
    var
    wu = wl + 2; var
    mIdeal = (12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) /(-4 * wl - 4);var
    m = Math. round(mIdeal);
    // var sigmaActual = Math.sqrt( (m*wl*wl + (n-m)*wu*wu - n)/12 );

    var
    sizes = [];for
    (vari = 0; i < n; i++) sizes. push(i < m
            ? wl
            : wu);
    return
    sizes;
}
