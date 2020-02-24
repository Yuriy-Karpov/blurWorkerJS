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
