
function Beam(){
    var mainScene,
        projectileLifetime = 10,
        projectileSpeed = 0,
        activeProjectiles = {},
        currentAnimationFrame = null,
        materials = [],
        geometry,
        particleSystem,
        amount = 300,
        resizeAddition = 100;

    geometry = new THREE.Geometry();
    fillGeometry();

    var pool = new Pool({
        constructorFn : function(){

        },
        poolSize : amount,
        resetObjectProps : function(){

        }
    })

    function fillGeometry(size){
        var i = size * 2;
        while (i--){
//            geometry.vertices.push(new THREE.Vector3(0,0,0));
            geometry.vertices.push({
                x : 0,
                y : 0,
                z : 0,
                source : null,
                colliderAccept : bitMapper.generateMask('ship'),
                colliderType : bitMapper.generateMask('beam')
            });
        }
    }
}
