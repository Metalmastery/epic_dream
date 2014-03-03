function CellNoise() {
    
    this.b32 = Math.pow(2,32);
    this.Constants = {
        POISON_COUNT : [
            4, 3, 1, 1, 1, 2, 4, 2, 2, 2, 5, 1, 0, 2, 1, 2, 2, 0, 4, 3, 2, 1, 2,
            1, 3, 2, 2, 4, 2, 2, 5, 1, 2, 3, 2, 2, 2, 2, 2, 3, 2, 4, 2, 5, 3, 2,
            2, 2, 5, 3, 3, 5, 2, 1, 3, 3, 4, 4, 2, 3, 0, 4, 2, 2, 2, 1, 3, 2, 2,
            2, 3, 3, 3, 1, 2, 0, 2, 1, 1, 2, 2, 2, 2, 5, 3, 2, 3, 2, 3, 2, 2, 1,
            0, 2, 1, 1, 2, 1, 2, 2, 1, 3, 4, 2, 2, 2, 5, 4, 2, 4, 2, 2, 5, 4, 3,
            2, 2, 5, 4, 3, 3, 3, 5, 2, 2, 2, 2, 2, 3, 1, 1, 5, 2, 1, 3, 3, 4, 3,
            2, 4, 3, 3, 3, 4, 5, 1, 4, 2, 4, 3, 1, 2, 3, 5, 3, 2, 1, 3, 1, 3, 3,
            3, 2, 3, 1, 5, 5, 4, 2, 2, 4, 1, 3, 4, 1, 5, 3, 3, 5, 3, 4, 3, 2, 2,
            1, 1, 1, 1, 1, 2, 4, 5, 4, 5, 4, 2, 1, 5, 1, 1, 2, 3, 3, 3, 2, 5, 2,
            3, 3, 2, 0, 2, 1, 1, 4, 2, 1, 3, 2, 1, 2, 2, 3, 2, 5, 5, 3, 4, 5, 5,
            2, 4, 4, 5, 3, 2, 2, 2, 1, 4, 2, 3, 3, 4, 2, 5, 4, 2, 4, 2, 2, 2, 4,
            5, 3, 2
        ],

        DENSITY_ADJUSTMENT : 0.398150,
        DENSITY_ADJUSTMENT_INV : 1.0 / 0.398150
    };

}

CellNoise.prototype.noise = function(cd) {
    if (cd.dim == 3) {
        /*
         * Adjustment variable to make F[0] average 1.0 when using
         * EUCLIDEAN distance in 3D
         */
        this.Constants.DENSITY_ADJUSTMENT = 0.294631;
        this.Constants.DENSITY_ADJUSTMENT_INV = 1.0 / this.Constants.DENSITY_ADJUSTMENT;
        this.noise3D(cd);
    } else if (cd.dim == 2) {
        /*
         * Adjustment variable to make F[0] average at 1.0 when using
         * EUCLIDEAN distance in 2D
         */
        this.Constants.DENSITY_ADJUSTMENT = 0.294631;
        this.Constants.DENSITY_ADJUSTMENT_INV = 1.0 / this.Constants.DENSITY_ADJUSTMENT;
        this.noise2D(cd);
    }
}

/*
 * Noise function for three dimensions.
 * Coordinating the search on the above cube level.
 * Deciding in which cube to search.
 */
CellNoise.prototype.noise3D = function (cd) {
    var x2, y2, z2, mx2, my2, mz2;
    var newAt = new Array(3);
    var intAt = new Array(3);
    var i;

    for (i = 0; i < cd.maxOrder; i++) {
        cd.F[i] = Number.POSITIVE_INFINITY;
    }
    
    newAt[0] = this.Constants.DENSITY_ADJUSTMENT * cd.at[0];
    newAt[1] = this.Constants.DENSITY_ADJUSTMENT * cd.at[1];
    newAt[2] = this.Constants.DENSITY_ADJUSTMENT * cd.at[2];

    intAt[0] = ~~newAt[0];
    intAt[1] = ~~newAt[1];
    intAt[2] = ~~newAt[2];

    /*
     * The center cube. It's very likely that the closest feature
     * point will be found in this cube.
     */

    this.Add3DSamples(intAt[0], intAt[1], intAt[2], newAt, cd);

    x2 = newAt[0] - intAt[0];
    y2 = newAt[1] - intAt[1];
    z2 = newAt[2] - intAt[2];

    mx2 = (1.0 - x2) * (1.0 - x2);
    my2 = (1.0 - y2) * (1.0 - y2);
    mz2 = (1.0 - z2) * (1.0 - z2);

    x2 *= x2;
    y2 *= y2;
    z2 *= z2;

    /*
     * Check the 6 facing cubes from sample location.
     * These are most likely the closest locations to have feature points
     */

    if ( x2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] - 1, intAt[1], intAt[2], newAt, cd); }
    if ( y2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0], intAt[1] - 1, intAt[2], newAt, cd); }
    if ( z2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0], intAt[1], intAt[2] - 1, newAt, cd); }
    if (mx2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] + 1, intAt[1], intAt[2], newAt, cd); }
    if (my2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0], intAt[1] + 1, intAt[2], newAt, cd); }
    if (mz2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0], intAt[1], intAt[2] + 1, newAt, cd); }

    /*
     * The 12 edge cubes. These are next closest.
     */

    if ( x2 +  y2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] - 1, intAt[1] - 1, intAt[2], newAt, cd); }
    if ( x2 +  z2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] - 1, intAt[1], intAt[2] - 1, newAt, cd); }
    if ( y2 +  z2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0], intAt[1] - 1, intAt[2] - 1, newAt, cd); }
    if (mx2 + my2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] + 1, intAt[1] + 1, intAt[2], newAt, cd); }
    if (mx2 + mz2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] + 1, intAt[1], intAt[2] + 1, newAt, cd); }
    if (my2 + mz2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0], intAt[1] + 1, intAt[2] + 1, newAt, cd); }
    if ( x2 + my2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] - 1, intAt[1] + 1, intAt[2], newAt, cd); }
    if ( x2 + mz2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] - 1, intAt[1], intAt[2] + 1, newAt, cd); }
    if ( y2 + mz2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0], intAt[1] - 1, intAt[2] + 1, newAt, cd); }
    if (mx2 +  y2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] + 1, intAt[1] - 1, intAt[2], newAt, cd); }
    if (mx2 +  z2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] + 1, intAt[1], intAt[2] - 1, newAt, cd); }
    if (my2 +  z2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0], intAt[1] + 1, intAt[2] - 1, newAt, cd); }

    /*
     * The 8 corner cubes.
     */

    if ( x2 +  y2 +  z2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] - 1, intAt[1] - 1, intAt[2] - 1, newAt, cd); }
    if ( x2 +  y2 + mz2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] - 1, intAt[1] - 1, intAt[2] + 1, newAt, cd); }
    if ( x2 + my2 +  z2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] - 1, intAt[1] + 1, intAt[2] - 1, newAt, cd); }
    if ( x2 + my2 + mz2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] - 1, intAt[1] + 1, intAt[2] + 1, newAt, cd); }
    if (mx2 +  y2 +  z2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] + 1, intAt[1] - 1, intAt[2] - 1, newAt, cd); }
    if ( x2 + my2 +  z2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] - 1, intAt[1] + 1, intAt[2] - 1, newAt, cd); }
    if (mx2 +  y2 + mz2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] + 1, intAt[1] - 1, intAt[2] + 1, newAt, cd); }
    if (mx2 + my2 +  z2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] + 1, intAt[1] + 1, intAt[2] - 1, newAt, cd); }
    if (mx2 + my2 + mz2 < cd.F[cd.maxOrder - 1]) { this.Add3DSamples(intAt[0] + 1, intAt[1] + 1, intAt[2] + 1, newAt, cd); }

    for (i = 0; i < cd.maxOrder; i++) {
        cd.F[i] = Math.sqrt(cd.F[i] * this.Constants.DENSITY_ADJUSTMENT_INV);
        cd.delta[i][0] *= this.Constants.DENSITY_ADJUSTMENT_INV;
        cd.delta[i][1] *= this.Constants.DENSITY_ADJUSTMENT_INV;
        cd.delta[i][2] *= this.Constants.DENSITY_ADJUSTMENT_INV;
    }
}

CellNoise.prototype.noise2D = function(cd) {
    var x2, y2, mx2, my2, i;
    var newAt = new Array(2);
    var intAt = new Array(2);

    for (i=0; i < cd.maxOrder; i++) {
        cd.F[i] = Number.POSITIVE_INFINITY;
    }

    newAt[0] = this.Constants.DENSITY_ADJUSTMENT * cd.at[0];
    newAt[1] = this.Constants.DENSITY_ADJUSTMENT * cd.at[1];

    intAt[0] = ~~newAt[0];
    intAt[1] = ~~newAt[1];

    /*
     * The center cube. It's very likely that the closest feature
     * point will be found in this cube.
     */

    this.Add2DSamples(intAt[0], intAt[1], newAt, cd);

    x2 = newAt[0] - intAt[0];
    y2 = newAt[1] - intAt[1];

    mx2 = (1.0 - x2) * (1.0 - x2);
    my2 = (1.0 - y2) * (1.0 - y2);
    x2 *= x2;
    y2 *= y2;

    /*
     * Check the 4 facing cubes from sample location.
     * These are most likely the closest locations to have feature points
     */

    if ( x2 < cd.F[cd.maxOrder - 1]) { this.Add2DSamples(intAt[0] - 1, intAt[1], newAt, cd); }
    if ( y2 < cd.F[cd.maxOrder - 1]) { this.Add2DSamples(intAt[0], intAt[1] - 1, newAt, cd); }
    if (mx2 < cd.F[cd.maxOrder - 1]) { this.Add2DSamples(intAt[0] + 1, intAt[1], newAt, cd); }
    if (my2 < cd.F[cd.maxOrder - 1]) { this.Add2DSamples(intAt[0], intAt[1] + 1, newAt, cd); }

    /*
     * Check the 4 square cubes from sample location.
     * These are probably much distant then the nearby cubes
     */

    if (x2 + y2 < cd.F[cd.maxOrder - 1])   { this.Add2DSamples(intAt[0] - 1, intAt[1] - 1, newAt, cd); }
    if (x2 + my2 < cd.F[cd.maxOrder - 1])  { this.Add2DSamples(intAt[0] - 1, intAt[1] + 1, newAt, cd); }
    if (mx2 + y2 < cd.F[cd.maxOrder - 1])  { this.Add2DSamples(intAt[0] + 1, intAt[1] - 1, newAt, cd); }
    if (mx2 + my2 < cd.F[cd.maxOrder - 1]) { this.Add2DSamples(intAt[0] + 1, intAt[1] + 1, newAt, cd); }

    for (i = 0; i < cd.maxOrder; i++) {
        cd.F[i] = Math.sqrt(cd.F[i]) * this.Constants.DENSITY_ADJUSTMENT_INV;
        cd.delta[i][0] *= this.Constants.DENSITY_ADJUSTMENT_INV;
        cd.delta[i][1] *= this.Constants.DENSITY_ADJUSTMENT_INV;
    }
}

/*
 * Generating the sample points in 3D
 */

CellNoise.prototype.Add3DSamples = function(xi, yi, zi, at, cd) {
    var dx, dy, dz, fx, fy, fz, d2, abs = Math.abs;
    var count, i, j, index, seed, id;
    /*
     * Generating a random seed, based on the cube's ID number. The seed might be
     * better if it were a nonlinear hash like Perlin uses for noise, but we do very
     * well with this faster simple one.
     * Our LCG uses Knuth-approved constants for maximal periods.
     */

    seed = this.u32(this.u32(702395077 * xi) + this.u32(915488749 * yi) + this.u32(2120969693 * zi));

    // Number of feature points in this cube
    count = this.Constants.POISON_COUNT[parseInt(0xFF & (seed >> 24))];
    seed = this.u32(1402024253 * seed * 586950981);

    for (j = 0; j < count; j++) {
        id = seed;
        seed = this.u32(1402024253 * seed + 586950981);

        // Compute the 0..1 feature point xyz's location
        fx = (seed + 0.5) / 4294967296.0;
        seed = this.u32(1402024253 * seed + 586950981);
        fy = (seed + 0.5) / 4294967296.0;
        seed = this.u32(1402024253 * seed + 586950981);
        fz = (seed + 0.5) / 4294967296.0;
        seed = this.u32(1402024253 * seed + 586950981);

        /* Calculate distance from feature point to sample location*/

        dx = xi + fx - at[0];
        dy = yi + fy - at[1];
        dz = zi + fz - at[2];

        /*
         * Distance computation
         */
        if (GUI.renderMethod == 1) {
            d2 = dx*dx + dy*dy + dz*dz;
        } else if (GUI.renderMethod == 2) {
            d2 = Math.max(Math.max(abs(dx), abs(dy)), abs(dz));
            d2 *= d2;
        } else if (GUI.renderMethod == 3) {
            d2 = abs(dx) + abs(dy) + abs(dz);
            d2 *= d2;
        } else if (GUI.renderMethod == 4) {
            d2 = dx*dx + dy*dy + dz*dz + dx*dy + dx*dz + dy*dz;
            d2 *= d2;
        }

        /* Store the closest points */

        //Calculate the closest feature point distance to sample location
        if (d2 < cd.F[cd.maxOrder - 1]) {
            index = cd.maxOrder;
            while(index > 0 && d2 < cd.F[index-1]) {
                index--;
            }

            for (i = cd.maxOrder - 1; i-- > index; ) {
                cd.F[i + 1] = cd.F[i];
                cd.ID[i + 1] = cd.ID[i];
                cd.delta[i + 1][0] = cd.delta[i][0];
                cd.delta[i + 1][1] = cd.delta[i][1];
                cd.delta[i + 1][2] = cd.delta[i][2];
            }

            cd.F[index] = d2;
            cd.ID[index] = id;
            cd.delta[index][0] = dx;
            cd.delta[index][1] = dy;
            cd.delta[index][2] = dz;
        }
    }
    return this.Add3DSamples;
}


/*
 * Generating the sample points in 2D
 */

CellNoise.prototype.Add2DSamples = function(xi, yi, at, cd) {
    var dx, dy, fx, fy, d2, abs = Math.abs;
    var count, i, j, index, seed, id;
    /*
     * Generating a random seed, based on the cube's ID number. The seed might be
     * better if it were a nonlinear hash like Perlin uses for noise, but we do very
     * well with this faster simple one.
     * Our LCG uses Knuth-approved constants for maximal periods.
     */

    seed = this.u32(this.u32(702395077 * xi) + this.u32(915488749 * yi));

    // Number of feature points in this cube
    count = this.Constants.POISON_COUNT[parseInt(0xFF & (seed >> 24))];
    seed = this.u32(1402024253 * seed * 586950981);

    for (j = 0; j < count; j++) {
        id = seed;
        seed = this.u32(1402024253 * seed + 586950981);

        // Compute the 0..1 feature point xyz's location
        fx = (seed + 0.5) / 4294967296.0;
        seed = this.u32(1402024253 * seed + 586950981);
        fy = (seed + 0.5) / 4294967296.0;
        seed = this.u32(1402024253 * seed + 586950981);

        /* Calculate distance from feature point to sample location*/

        dx = xi + fx - at[0];
        dy = yi + fy - at[1];

        /*
         * Distance computation
         */

        if (GUI.renderMethod === 1) {
            d2 = dx*dx + dy*dy;
        } else if (GUI.renderMethod == 2) {
            d2 = Math.max(abs(dx), abs(dy));
            d2 *= d2;
        } else if (GUI.renderMethod == 3) {
            d2 = abs(dx) + abs(dy);
            d2 *= d2;
        } else if (GUI.renderMethod == 4) {
            d2 = dx*dx + dy*dy + dx*dy;
            d2 *= d2;
        }

        /* Store the closest points */

        if (d2 < cd.F[cd.maxOrder - 1]) {
            index = cd.maxOrder;
            while(index > 0 && d2 < cd.F[index-1]) {
                index--;
            }

            for (i = cd.maxOrder - 1; i-- > index;) {
                cd.F[i + 1] = cd.F[i];
                cd.ID[i + 1] = cd.ID[i];
                cd.delta[i + 1][0] = cd.delta[i][0];
                cd.delta[i + 1][1] = cd.delta[i][1];
            }

            cd.F[index] = d2;
            cd.ID[index] = id;
            cd.delta[index][0] = dx;
            cd.delta[index][1] = dy;
        }
    }
    return this.Add2DSamples;
}


CellNoise.prototype.u32 = function(s) {
    var st = s % this.b32;
    if (st < 0)
        st += this.b32;
    return st;
}