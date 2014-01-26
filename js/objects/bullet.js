var Bullet = (function(){

    var mainScene,
        projectileLifetime = 200,
        projectileSpeed = 20,
        activeProjectiles = {},
        currentAnimationFrame = null,
        materials = [];

    materials.push(new THREE.LineBasicMaterial({color : 0xffffff}));
    materials.push(new THREE.ParticleBasicMaterial({color : 0xffffff, size : 20}));


    function attachToScene(scene){
        mainScene = scene;
    }

    function projectile(){
        var material = materials[1],
            geometry = new THREE.Geometry();
        return new THREE.Line(geometry, material, THREE.LinePieces);
//        return bulletSystem;
    }

    function fireTarget(shooter, target){

    }

    var start = function(){

    };

    function update(time){
        for (var i in activeProjectiles){
            if (activeProjectiles[i].lifetime--) {
                activeProjectiles[i].projectile.position.x += activeProjectiles[i].speedX * time;
                activeProjectiles[i].projectile.position.y += activeProjectiles[i].speedY * time;
            } else {
                mainScene.remove(activeProjectiles[i].projectile);
                delete activeProjectiles[activeProjectiles[i].projectile.uuid]
            }
        }
    }

    function stop(){
//        cancelRequestAnimationFrame(currentAnimationFrame);
        webkitCancelRequestAnimationFrame(currentAnimationFrame);
    }

    function fire(shooter, angle){
        var proj = projectile();
//        console.log(proj, shooter.geometry.position, bulletSystemGeometry);
        proj.geometry.vertices.push(new THREE.Vector3(Math.cos(angle)*10, Math.sin(angle)*10, 0));
        proj.geometry.vertices.push(new THREE.Vector3(Math.cos(angle)*20, Math.sin(angle)*20, 0));
        proj.position.x = shooter.geometry.position.x;
        proj.position.y = shooter.geometry.position.y;
        mainScene.add(proj);
        activeProjectiles[proj.uuid] = {
            lifetime : projectileLifetime,
            speedX : Math.cos(angle)*projectileSpeed + shooter.currentSpeedX,
            speedY : Math.sin(angle)*projectileSpeed + shooter.currentSpeedY,
            projectile : proj
        };
        return proj;
    }

    return {
        fire : fire,
        fireTarget : fireTarget,
        attachToScene : attachToScene,
        start : start,
        stop : stop,
        update : update
    }

})();