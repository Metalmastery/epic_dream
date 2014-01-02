function createStars(scene, color){
    var particles = new THREE.Geometry(),
        material, explosion;

    for (var j = 0; j<25000; j++){
        var a1, a2, x, y, z;
        a1 = Math.random() * 5000 - 2500;
        a2 = Math.random() * 5000 - 2500;

        particles.vertices.push(new THREE.Vector3(a1,a2,-Math.random()*500 - 500));
    }
    material = new THREE.ParticleSystemMaterial({size: 8, color: color});
    explosion = new THREE.ParticleSystem(particles, material);
    explosion.scale.z = 2;
    scene.add(explosion);
    window.stars = explosion;
}

function nebula(scene, color){
    var particles = new THREE.Geometry(),
        index = 0, explosion;

    PerlinSimplex.noiseDetail(4,0.7);
//    PerlinSimplex.noiseDetail(8,0.5);
    var x, y, z;
    var r, g, b;

    var size = 500;

    var tmp = ['a', 'b', 'c'],
        divider = 1000,
        divider2 = 4000,
        divider3 = 16000;

    for (var j = 0; j<size; j++){
        for (var i = 0; i < size; i++) {
            x = i*10 - 2500 + Math.random()*5;
            y = j*10 - 2500 + Math.random()*5;
            z = Math.random()*10 - 5;
            particles.vertices.push(new THREE.Vector3(x, y, z));
            if (i < size-1 && j < size-1){
                var face = new THREE.Face3( j*size + i, (j+1)*size + i, (j+1)*size + i + 1);
                particles.faces.push( face );
                face = new THREE.Face3((j+1)*size + i + 1, j*size+i+1, j*size + i);
                particles.faces.push( face );
            }
        }
    }

    for (var i = 0; i < particles.faces.length; i++) {
        for (var j = 0; j < 3; j++) {
            if (typeof particles.vertices[particles.faces[i][tmp[j]]].color == 'undefined'){
                var col = new THREE.Color();
                var noise = PerlinSimplex.noise(particles.vertices[particles.faces[i][tmp[j]]].x/divider, particles.vertices[particles.faces[i][tmp[j]]].y/divider);
                var noise2 = PerlinSimplex.noise(particles.vertices[particles.faces[i][tmp[j]]].x/divider2, particles.vertices[particles.faces[i][tmp[j]]].y/divider2);
                var noise3 = PerlinSimplex.noise(particles.vertices[particles.faces[i][tmp[j]]].x/divider3, particles.vertices[particles.faces[i][tmp[j]]].y/divider3);
                var noise4 = PerlinSimplex.noise(particles.vertices[particles.faces[i][tmp[j]]].y/divider3, particles.vertices[particles.faces[i][tmp[j]]].x/divider3);
                particles.vertices[particles.faces[i][tmp[j]]].color = col;
//                stars.geometry.vertices[index/10>>0].z = -500*(1 - noise*noise2*noise3*2) - 500;
                stars.geometry.vertices[index/10>>0].z = -500*(Math.abs(noise3*2 - 1)*2) - 800 + Math.random()*600 ;
                stars.geometry.vertices[index/10>>0].x = particles.vertices[particles.faces[i][tmp[j]]].x + Math.random()*100;
                stars.geometry.vertices[index/10>>0].y = particles.vertices[particles.faces[i][tmp[j]]].y + Math.random()*100;
                index ++;
                r = 0;
                g = noise*noise2;
                b = noise*noise2;
                col.setRGB(1-(Math.abs(noise3*2 - 1)*noise2*8), 1-(Math.abs(noise3*2 - 1)*4), 1-Math.abs(noise3*2 - 1)*2); /* green-blue */
//                col.setRGB(1-(Math.abs(noise3*2 - 1)*noise2*8), 1-(Math.abs(noise3*2 - 1)*Math.abs(noise2*2 - 1)*16), 1-Math.abs(noise3*2 - 1)*2); /* green-blue */
//                col.setRGB((noise3*noise3*noise3-0.8)*10, (noise3*noise3-0.3)*4, (noise3+noise2/2-0.6)*2); /* green-blue */
//                col.setRGB((noise3*noise3-0.3)*4, (noise3*noise3*noise3-0.4)*5, (noise3*noise2-0.4)*2); /* green-blue */
//                col.setRGB(r, g*(noise3-0.2), b*(noise3-0.1)); /* green-blue */
//                col.setRGB(0, noise3*noise*noise, noise2*noise > 0.5 ? 0.5 : noise2*noise); /* green-blue */
//                col.setRGB(noise, noise3*noise2, noise3*noise2);   /* green-red */
//                col.setRGB(noise3*noise*noise, 0, noise2*noise > 0.5 ? 0.5 : noise2*noise); /* red-blue */
//                stars.geometry.vertices[index/10>>0].z = -1000*noise;
                particles.faces[i].vertexColors[j] = col;
            } else {
                particles.faces[i].vertexColors[j] = particles.vertices[particles.faces[i][tmp[j]]].color;
            }
        }
    }
    particles.computeFaceNormals();
    explosion = new THREE.Mesh(particles, new THREE.MeshBasicMaterial({
        vertexColors : THREE.VertexColors,
        side: THREE.DoubleSide
    }));

    explosion.position.z = -2000;
    explosion.scale.z = 10;

    stars.position.z = -600;

    scene.add(explosion);

    window.neb = explosion;
}
