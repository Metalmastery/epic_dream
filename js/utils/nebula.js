//http://jsfiddle.net/9f8fV/94/
var simplex = new SimplexNoise(),
    canvas = document.getElementById('c'),
    ctx = canvas.getContext('2d'),
    imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height),
    data = imgdata.data,
    t = 0,
    starIntensity = 50,
    f1 = canvas.height / 4,
    f2 = canvas.height / 16,
    f3 = canvas.height / 64,
    f4 = canvas.height / 128,
    w = canvas.width;

var intensity, rnd, rnd2;
for (var x = 0; x < canvas.width; x++) {
    for (var y = 0; y < canvas.height; y++) {
        var r = simplex.noise3D(x / f1, y / f1, t) * 0.7 + 0.3;
        var g = simplex.noise3D(x / f2, y / f2, t);
        var b = simplex.noise3D(x / f3, y / f3, t);
        var d = simplex.noise3D(x / f4, y / f4, t);
        intensity = (r + g/4 + b/16 + d/32);
        rnd = Math.random();
        rnd2 = Math.random();
        //intensity = 0.1;
        data[(x + y * w) * 4 + 1] = intensity * 255;
        //data[(x + y * w) * 4 + 1] = (intensity > 0.6 && rnd > 0.9) * 255;
        data[(x + y * w) * 4 + 2] = intensity * intensity * intensity * intensity * 255;
        data[(x + y * w) * 4 + 0] = intensity * intensity * intensity * 128;
        var total = (data[(x + y * w) * 4 + 2] + data[(x + y * w) * 4 + 1] + data[(x + y * w) * 4 + 0]) / 255;
        if (rnd2 > 0.995 ) {
            data[(x + y * w) * 4 + 0] += starIntensity * (rnd + total);
            data[(x + y * w) * 4 + 1] += starIntensity * (rnd + total);
            data[(x + y * w) * 4 + 2] += starIntensity * (rnd + total);
        }
        data[(x + y * w) * 4 + 3] = 255;
    }
}
t++;
ctx.putImageData(imgdata, 0, 0);

