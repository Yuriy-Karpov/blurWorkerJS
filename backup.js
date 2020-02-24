var img = new Image();
img.src = './images/cat.jpg';
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
    console.time('blusrRGB')
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const radius = 5;

    let offset = 0;
    for (let i = 0; i < len; i++) {
        rSrc[i] = rgba[offset++];
        gSrc[i] = rgba[offset++];
        bSrc[i] = rgba[offset++];
        aSrc[i] = rgba[offset++];
    }

    gaussMatrix(rSrc, rSrc, w, h, radius);
    gaussMatrix(gSrc, gSrc, w, h, radius);
    gaussMatrix(bSrc, bSrc, w, h, radius);
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


    var invertbtn = document.getElementById('invertbtn');
    invertbtn.addEventListener('click', blusrRGB);
}



function blurCore(src, inIndex, indexInLine, radius, max, offset = 1) {
    let tmpPixel = 0;
    // console.log('offset',offset)
    // console.log('max', max)
    for (let r = -radius; r <= radius; r++) {
        // tmpPixel += src[inIndex + offset * r];
        const targetPixel = inIndex + r * offset;
        // if (indexInLine === 1) {
        //     console.log('indexInLine', indexInLine)
        //     console.log('max:', max);
        //     console.log('offset:', offset * (max - 1))
        //     console.log('targetPixel:', inIndex + r * offset)
        // }
        if (targetPixel < 0) {
            let t = r;
         
            tmpPixel += src[inIndex];
            // while (indexInLine + t < 0) {
            //     t++;
            // }
            // tmpPixel += src[inIndex + t * offset];
        } else if (inIndex + r * offset > (max - 1) * offset) {
            // if (indexInLine === 1) {
            //     console.log('TYT')
            //     console.log('targetPixel', targetPixel)
            // }
           
            let t = r;
            // while (indexInLine + t * offset > max) {
            //     t--;
            // }
            // tmpPixel += src[inIndex + t * offset];
            tmpPixel += src[inIndex];
        } else {
            tmpPixel += src[inIndex + r * offset];
        }
    }
    return tmpPixel;
}