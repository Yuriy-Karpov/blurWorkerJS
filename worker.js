onmessage = function(e) {
    const src = e.data[0];
    const inIndex = e.data[1];
    const indexInLine = e.data[2];
    const radius = e.data[3];
    const max = e.data[4];
    const offset = e.data[5];

    let tmpPixel = 0;
    for (let r = -radius; r <= radius; r++) {
        const targetPixel = indexInLine + r;

        if (targetPixel <= 0) {
            let t = r;
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
    postMessage([inIndex, 10]);
  }
