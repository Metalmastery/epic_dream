var Designer = (function(){
    var self = {};

    function _calculateUVsAfterCSG(geometry){
        geometry.computeBoundingBox();
        var max = geometry.boundingBox.max,
            min = geometry.boundingBox.min;
        var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
        var range = new THREE.Vector2(max.x - min.x, max.y - min.y);
        geometry.faceVertexUvs[0] = [];
        for (var i = 0; i < geometry.faces.length ; i++) {
            var v1 = geometry.vertices[geometry.faces[i].a], v2 = geometry.vertices[geometry.faces[i].b], v3 = geometry.vertices[geometry.faces[i].c];
            geometry.faceVertexUvs[0].push(
                [
                    new THREE.Vector2((v1.x + offset.x)/range.x ,(v1.y + offset.y)/range.y),
                    new THREE.Vector2((v2.x + offset.x)/range.x ,(v2.y + offset.y)/range.y),
                    new THREE.Vector2((v3.x + offset.x)/range.x ,(v3.y + offset.y)/range.y)
                ]);

        }
        geometry.uvsNeedUpdate = true;
    }

    function simple2DShip(){
        "use strict";
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(10, 0, 0));
        geometry.vertices.push(new THREE.Vector3( -5,  5, 0 ) );
        geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ) );
        geometry.vertices.push(new THREE.Vector3( -5, -5, 0 ) );
        geometry.vertices.push(new THREE.Vector3( 10, 0, 0 ) );

        var material = new THREE.LineBasicMaterial({
//            vertexColors: true,
            color : new THREE.Color(self.shipColor)
        });
        geometry = new THREE.Line( geometry, material, 0);
        return geometry;
    }

    function basicShip(){
        "use strict";

        var floorTexture = new THREE.ImageUtils.loadTexture( 'img/noise2.jpg' );
        floorTexture.wrapS = floorTexture.wrapT = THREE.MirroredRepeatWrapping;

        var color = new THREE.Color();
        color.setHSL(Math.random(),1,0.5);
        var offsets = {
            frontX : 7 + Math.random()*3,
            frontY : 7 + Math.random()*3,
            backX : 2 + Math.random()*8,
            backY : - 7 + Math.random()*4,
            tailX : 2 + Math.random()*8,
            tailZ : 0,
            cabineX : Math.random(),
            cabineZ : Math.random()*2,
            cabineScale : 1.2 + Math.random()

        };

        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(offsets.frontX, 0, 0));    // front corner
        geometry.vertices.push(new THREE.Vector3( -offsets.backX,  offsets.backY, 0 ) ); // back top
        geometry.vertices.push(new THREE.Vector3( 0, 0, 3) ); // back center
        geometry.vertices.push(new THREE.Vector3( -offsets.backX, -offsets.backY, 0 ) ); // back bottom

        geometry.vertices.push(new THREE.Vector3( -offsets.tailX, 0, offsets.tailZ ) ); // tail spike

        geometry.vertices.push(new THREE.Vector3( -3, 3, 1 ) ); // tail spike
        geometry.vertices.push(new THREE.Vector3( -3, -3, 1 ) ); // tail spike

        geometry.vertices.push(new THREE.Vector3( -1, 0, -1 ) ); // tail spike

        // bottom of ship
        geometry.faces.push(new THREE.Face3(1,0,2));
        geometry.faces.push(new THREE.Face3(0,3,2));

        // top without spike
        geometry.faces.push(new THREE.Face3(7,0,1));
        geometry.faces.push(new THREE.Face3(7,3,0));

        // spike
        geometry.faces.push(new THREE.Face3(2,4,1));
        geometry.faces.push(new THREE.Face3(2,3,4));

        var scaler = new THREE.Matrix4();
        scaler.scale({x : offsets.cabineScale, y : 1, z : 1});
        var cabine = new THREE.SphereGeometry(2.5);
        cabine.applyMatrix(scaler);

        var body = THREE.CSG.toCSG(geometry,new THREE.Vector3(0,0,0));
        var cab   = THREE.CSG.toCSG(cabine, new THREE.Vector3(offsets.cabineX,0,offsets.cabineZ));
        body = body.union(cab);

        var hsl = color.getHSL();
        // TODO adjust colors in material

        geometry = THREE.CSG.fromCSG(body);
        _calculateUVsAfterCSG(geometry);

        var hsl = color.getHSL();
        // TODO adjust colors in material
//        var material = new THREE.MeshPhongMaterial({
//            specular: color.clone().offsetHSL(0,0,(0.9-hsl.l)),
//            color: color,
//            ambient: color.clone().offsetHSL(0,0.3,1),
//            shininess: 30,
//            metal : true,
//            side: THREE.DoubleSide
//        } );

        var mat2 = new THREE.MeshPhongMaterial( {
            color: color,
            specular:color.clone().offsetHSL(0,0,(0.9-hsl.l)),
            shininess: 10,
            map: floorTexture,
//            envMap: floorTexture,
//            normalMap: floorTexture,
            combine: THREE.MixOperation,
            reflectivity: 0.15,
            side : THREE.DoubleSide
        });

        geometry = new THREE.Mesh(geometry, mat2);
        geometry.rotation.order = 'ZYX';
        return geometry;
    }

    function torusShip(){
        "use strict";

        var floorTexture = new THREE.ImageUtils.loadTexture( 'img/noise3.jpg' );
        floorTexture.wrapS = floorTexture.wrapT = THREE.MirroredRepeatWrapping;

        var color = new THREE.Color();
        color.setHSL(Math.random(),1,0.5);
        var geometry = new THREE.TorusGeometry(5, 2);

        var scaler = new THREE.Matrix4();
        scaler.scale({x : 1.8, y : 1, z : 1});
        var cabine = new THREE.SphereGeometry(2.5);
        cabine.applyMatrix(scaler);
        var sub = new THREE.SphereGeometry(5);
        sub.applyMatrix(scaler);

        var torus = THREE.CSG.toCSG(new THREE.TorusGeometry(5, 2, 5, 50),new THREE.Vector3(0,0,0));
        var sphere   = THREE.CSG.toCSG(sub, new THREE.Vector3(3.5,0,0));
        var cab   = THREE.CSG.toCSG(cabine, new THREE.Vector3(-3.5,0,0));

        var geometry = THREE.CSG.fromCSG(torus.subtract(sphere).union(cab));
        _calculateUVsAfterCSG(geometry);

        var hsl = color.getHSL();
        // TODO adjust colors in material
//        var material = new THREE.MeshPhongMaterial({
//            specular: color.clone().offsetHSL(0,0,(0.9-hsl.l)),
//            color: color,
//            ambient: color.clone().offsetHSL(0,0.3,1),
//            shininess: 30,
//            metal : true,
//            side: THREE.DoubleSide
//        } );

        var mat2 = new THREE.MeshPhongMaterial( {
            color: color,
            specular:color.clone().offsetHSL(0,0,(0.9-hsl.l)),
            shininess: 30,
            map: floorTexture,
            envMap: floorTexture,
//            normalMap: floorTexture,
            combine: THREE.MixOperation,
            reflectivity: 0.15,
            side : THREE.DoubleSide
        });

        geometry = new THREE.Mesh(geometry, mat2);
//        geometry = new THREE.Mesh(cabine,mat2);
        geometry.rotation.order = 'ZYX';
        return geometry;
    }

    function spheresIntersect(){

    }

    function createNode(){

    }

    return {
        torusShip : torusShip,
        basicShip : basicShip,
        simple2DShip : simple2DShip
    }

})();