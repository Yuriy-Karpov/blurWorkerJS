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
