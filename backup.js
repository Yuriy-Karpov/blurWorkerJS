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


    const bluer = function () {
        const R = 5;
        const totalScale = 2 * R + 1;
        let pixel = 0;
        let deltaBright = 0
        // for (let i = 0; i < data.length; i += 4) {
        //     deltaBright += data[i] + data[i+1] + data[i+2];
        //     pixel += 1;
        // }
        // deltaBright = deltaBright / pixel;
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
            data[blue] =  gaussBlur_1(data[blue], data[red], img.naturalWidth, img.naturalHeight, 2);
        }
        console.log('pixel:', pixel);
        ctx.putImageData(imageData, 0, 0);
    }



/** ===================  */

    // const invert = function () {
    //     let pixel = 0;
    //     let deltaBright = 0
    //     for (let i = 0; i < data.length; i += 4) {
    //         deltaBright += data[i] + data[i+1] + data[i+2];
    //         pixel += 1;
    //     }
    //     deltaBright = deltaBright / pixel;
    //     console.log('deltaBright:', deltaBright);


    //     const matix = [];


    //     for (let i = 0; i < data.length; i += 4) {
            
    //         const red = i;
    //         const green = i + 1;
    //         const blue = i + 2;
    //         const alfa = i + 3; // decode jpg ignored
    //         const brightness = data[red] + data[green] + data[blue]; // for jpg
            
    //         const rightR = red + 4;
    //         const rightG = green + 4;
    //         const rightB = blue + 4;
    //         const leftR = red - 4;
    //         const leftG = green - 4;
    //         const leftB = blue - 4;

    //         data[red] = data[red] * data[rightR] * data[leftR] / 3; 
    //         data[green] = data[green] * data[rightG] * data[leftG] / 3; 
    //         data[blue] = data[blue] * data[rightB]  * data[leftB] / 3;
    //     }
    //     // console.log('pixel:', pixel);
    //     ctx.putImageData(imageData, 0, 0);
    // };

    // var grayscale = function () {
    //     for (var i = 0; i < data.length; i += 4) {
    //         var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    //         data[i] = avg; // red
    //         data[i + 1] = avg; // green
    //         data[i + 2] = avg; // blue
    //     }
    //     ctx.putImageData(imageData, 0, 0);
    // };

    var invertbtn = document.getElementById('invertbtn');
    invertbtn.addEventListener('click', blusrRGB);
    //   var grayscalebtn = document.getElementById('grayscalebtn');
    // grayscalebtn.addEventListener('click', grayscale);
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

function gaussBlur_4 (scl, tcl, w, h, r) {
    var bxs = boxesForGauss(r, 3);
    boxBlur_4 (scl, tcl, w, h, (bxs[0]-1)/2);
    boxBlur_4 (tcl, scl, w, h, (bxs[1]-1)/2);
    boxBlur_4 (scl, tcl, w, h, (bxs[2]-1)/2);
}
function boxBlur_4 (scl, tcl, w, h, r) {
    for(var i=0; i<scl.length; i++) tcl[i] = scl[i];
    boxBlurH_4(tcl, scl, w, h, r);
    boxBlurT_4(scl, tcl, w, h, r);
}
function boxBlurH_4 (scl, tcl, w, h, r) {
    var iarr = 1 / (r+r+1);
    for(var i=0; i<h; i++) {
        var ti = i*w, li = ti, ri = ti+r;
        var fv = scl[ti], lv = scl[ti+w-1], val = (r+1)*fv;
        for(var j=0; j<r; j++) val += scl[ti+j];
        for(var j=0  ; j<=r ; j++) { val += scl[ri++] - fv       ;   tcl[ti++] = Math.round(val*iarr); }
        for(var j=r+1; j<w-r; j++) { val += scl[ri++] - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
        for(var j=w-r; j<w  ; j++) { val += lv        - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
    }
}
function boxBlurT_4 (scl, tcl, w, h, r) {
    var iarr = 1 / (r+r+1);
    for(var i=0; i<w; i++) {
        var ti = i, li = ti, ri = ti+r*w;
        var fv = scl[ti], lv = scl[ti+w*(h-1)], val = (r+1)*fv;
        for(var j=0; j<r; j++) val += scl[ti+j*w];
        for(var j=0  ; j<=r ; j++) { val += scl[ri] - fv     ;  tcl[ti] = Math.round(val*iarr);  ri+=w; ti+=w; }
        for(var j=r+1; j<h-r; j++) { val += scl[ri] - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ri+=w; ti+=w; }
        for(var j=h-r; j<h  ; j++) { val += lv      - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ti+=w; }
    }
}

function boxesForGauss(sigma, n)  // standard deviation, number of boxes
{
    var wIdeal = Math.sqrt((12*sigma*sigma/n)+1);  // Ideal averaging filter width 
    var wl = Math.floor(wIdeal);  if(wl%2==0) wl--;
    var wu = wl+2;
				
    var mIdeal = (12*sigma*sigma - n*wl*wl - 4*n*wl - 3*n)/(-4*wl - 4);
    var m = Math.round(mIdeal);
    // var sigmaActual = Math.sqrt( (m*wl*wl + (n-m)*wu*wu - n)/12 );
				
    var sizes = [];  for(var i=0; i<n; i++) sizes.push(i<m?wl:wu);
    return sizes;
}


function gaussMatrix(src,  target, width, height, radius) {

    const tableSize = 2 * radius + 1;
    const widthMax = width - 1;
    const heightMax = height - 1;

    let indexPixel = 0;
    // for (let y = 0; y < height; y++) {
    //     const indexHorizontLine = y * width;
    //     for (let indexPixelInLine = 0; indexPixelInLine < width; indexPixelInLine++) {
    //         indexPixel = indexPixelInLine + indexHorizontLine;
    //         const tmpPixel = blurCore(src, indexPixel, indexPixelInLine, radius, widthMax)
    //         // target[indexPixel] = 0;
    //         target[indexPixel] = tmpPixel / tableSize;
    //     }
    // }
    indexPixel = 0;
    const offset = width;
    for (let x = 0; x < width; x++) {
        // console.log('x:', x)
        const indexVerticaltLine = height * x;
        // console.log('indexVerticaltLine:', indexVerticaltLine)
        for (let indexVertical = 0; indexVertical < height; indexVertical++) {
            // console.log('indexVertical:', indexVertical)
            indexPixel = indexVertical + indexVerticaltLine;
            const tmpPixel = blurCore(src, indexPixel, indexVertical, radius, heightMax, offset)
            target[indexPixel] = tmpPixel / tableSize;
            // target[indexPixel] = 0;
        } 
    }
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