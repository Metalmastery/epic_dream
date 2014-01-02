var Bullet = (function(){

    var mainScene,
        projectileLifetime = 200,
        projectileSpeed = 20,
        activeProjectiles = {},
        currentAnimationFrame = null;

    function attachToScene(scene){
        mainScene = scene;
    }

    function projectile(){
        var material = new THREE.LineBasicMaterial({color : 0xffffff}),
            geometry = new THREE.Geometry();
        return new THREE.Line(geometry, material, 1);
    }

    function fireTarget(shooter, target){

    }

    function start(){
        var flag = false;
        function callback(){
            flag = false;
            for (var i in activeProjectiles){
                activeProjectiles[i].lifetime--;
                if (activeProjectiles[i].lifetime) {
                    activeProjectiles[i].projectile.position.x += activeProjectiles[i].speedX;
                    activeProjectiles[i].projectile.position.y += activeProjectiles[i].speedY;
                    flag = true;
                } else {
                    mainScene.remove(activeProjectiles[i].projectile);
                    delete activeProjectiles[activeProjectiles[i].projectile.uuid]
                }
            }
//            if (flag) {
            currentAnimationFrame = requestAnimationFrame(callback);
//            }
        }
        currentAnimationFrame = requestAnimationFrame(callback);
    }

    function stop(){
//        cancelRequestAnimationFrame(currentAnimationFrame);
        webkitCancelRequestAnimationFrame(currentAnimationFrame);
    }

    function fire(shooter, angle){
        var proj = projectile();
        proj.geometry.vertices.push(new THREE.Vector3(Math.cos(angle)*10, Math.sin(angle)*10, 0));
        proj.geometry.vertices.push(new THREE.Vector3(Math.cos(angle)*20, Math.sin(angle)*20, 0));
        proj.position.x = shooter.geometry.position.x;
        proj.position.y = shooter.geometry.position.y;
        mainScene.add(proj);
        activeProjectiles[proj.uuid] = {
            lifetime : projectileLifetime,
            speedX : Math.cos(angle)*projectileSpeed,
            speedY : Math.sin(angle)*projectileSpeed,
            projectile : proj
        };
        return proj;
    }

    return {
        fire : fire,
        fireTarget : fireTarget,
        attachToScene : attachToScene,
        start : start,
        stop : stop
    }

})();