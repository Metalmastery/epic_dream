var Designer = (function(){
    var self = {};
    var materials = {
        lambertBasic : function(color, map, lightmap){
            var hsl = color.clone().getHSL();
            return new THREE.MeshLambertMaterial( {
//                color: color,
                map: map,
//                ambient : 0x99ccff,
//                envMap: map,
//            normalMap: lightmap,
//                combine: THREE.MixOperation,
                combine: THREE.MultiplyOperation,
                reflectivity: 0,
                side : THREE.DoubleSide
            });
        },
        phongEmissive : function(color, map, lightmap){
            var hsl = color.clone().getHSL();
            return new THREE.MeshPhongMaterial( {
                color: color,
                specular:color.clone().offsetHSL(0,0,(0.9-hsl.l)),
                shininess: 10,
                map: lightmap,
//                envMap: map,
//            normalMap: floorTexture,
//                combine: THREE.MixOperation,
                combine: THREE.MultiplyOperation,
//                emissive : 0x101530,
//                specularMap : map,
                reflectivity: 0.55,
                side : THREE.DoubleSide
            });
        },
        phongNoAmbient : function(color, map){
            var hsl = color.clone().getHSL();
            return new THREE.MeshPhongMaterial( {
                color: color,
                specular:color.clone().offsetHSL(0,0,(0.9-hsl.l)),
                shininess: 10,
                map: map,
                envMap: map,
//            normalMap: floorTexture,
                combine: THREE.MixOperation,
                reflectivity: 0.15,
                side : THREE.DoubleSide
            });
        },
        phongWithAmbient : function(color, map){
            var hsl = color.clone().getHSL();
            return new THREE.MeshPhongMaterial( {
                color: color,
                specular:color.clone().offsetHSL(0,0,(0.9-hsl.l)),
                ambient: 0x2266ee,
                shininess: 50,
                map: map,
//            envMap: floorTexture,
//            normalMap: floorTexture,
                combine: THREE.MixOperation,
//                combine: THREE.MultiplyOperation,
                reflectivity: 0.15,
                side : THREE.DoubleSide
            });
        }
    };

    var colors = {
        base : null,
        complementary : null,
        triad : [],
        split : [],
        analog : []
    };

    colors.base = (new THREE.Color()).setHSL(Math.random(), 1, 0.5);

    colors.triad.push(colors.base.clone());
    colors.triad.push(colors.base.clone().offsetHSL(0.33, 0, 0));
    colors.triad.push(colors.base.clone().offsetHSL(-0.33, 0, 0));

    colors.complementary = colors.base.clone().offsetHSL(0.5, 0, 0);

    colors.split.push(colors.base.clone());
    colors.split.push(colors.base.clone().offsetHSL(0.41, 0, 0));
    colors.split.push(colors.base.clone().offsetHSL(-0.41, 0, 0));

    colors.analog.push(colors.base.clone().offsetHSL(0.08, 0, 0));
    colors.analog.push(colors.base.clone().offsetHSL(-0.08, 0, 0));
//    colors.triad.push((colors.base.clone().getHSL().h + 0.33) % 1 );

    function generateTexture(width, height, points, color){
//        var offsets = {
//            frontX : 7 + Math.random()*3,
//            frontY : 7 + Math.random()*3,
//            backX : 2 + Math.random()*8,
//            backY : - 7 + Math.random()*4,
//            tailX : 2 + Math.random()*8,
//            tailZ : 0,
//            cabineX : Math.random(),
//            cabineZ : Math.random()*2,
//            cabineScale : 1.2 + Math.random()
//
//        };
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

        var size = points.frontX + Math.max(points.backX, points.tailX),
            factor = width / size,
            halfHeight = height / 2,
            halfWidth = width / 2;

        canvas.width = width || 100;
        canvas.height = height || 100;
        var back = '#333333';

//        factor = 20;

        ctx.fillStyle = '#' + color.getHexString();

        ctx.fillRect(0,0,width,height);

        ctx.beginPath();

        ctx.moveTo(halfWidth + points.frontX*factor, halfHeight);

        ctx.lineTo(halfWidth - points.backX*factor, halfHeight - points.backY*factor);
        ctx.lineTo(halfWidth - points.tailX*factor, halfHeight);
        ctx.lineTo(halfWidth - points.backX*factor, halfHeight + points.backY*factor);
        ctx.lineTo(halfWidth + points.frontX*factor, halfHeight);

        ctx.fillStyle = back;
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.translate(halfWidth,halfHeight);
        ctx.scale(points.cabineScale, 1);

        ctx.arc(0,0,2.5*factor,0,6.28,false);

        ctx.restore();
        ctx.closePath();
        ctx.fillStyle = '#ffffff';

        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(halfWidth, halfHeight);
        ctx.lineTo(width, halfHeight);
        ctx.moveTo(halfWidth, halfHeight + 2.5*factor);
        ctx.lineTo(halfWidth, halfHeight - 2.5*factor);
        ctx.strokeStyle = back;
        ctx.lineWidth =  factor;
        ctx.stroke();
        window.ctx = ctx;

//        document.body.appendChild(canvas);

        return canvas.toDataURL('png');
    }

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

//        var floorTexture = new THREE.ImageUtils.loadTexture( 'img/noise2.jpg' );
        var texture = new THREE.ImageUtils.loadTexture( 'img/PlatingDemo.jpg' );
        var lightmap = new THREE.ImageUtils.loadTexture( 'img/noise3_lightmap.jpg' );


        var color = colors.split[1].clone();//.offsetHSL(Math.random() * 0.1 - 0.5,-Math.random()*0.5,0);
//        color.setHSL(Math.random(),1,0.5);
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

        var floorTexture = new THREE.ImageUtils.loadTexture( generateTexture(200,200,offsets,color) );
        floorTexture.wrapS = floorTexture.wrapT = THREE.MirroredRepeatWrapping;
        lightmap = floorTexture;

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

//        var hsl = color.getHSL();
        // TODO adjust colors in material

        geometry = THREE.CSG.fromCSG(body);
        _calculateUVsAfterCSG(geometry);

        // TODO adjust colors in material
//        var material = materials.phongWithAmbient(color, texture);
        var material = materials.lambertBasic(color, floorTexture, lightmap);

        geometry = new THREE.Mesh(geometry, material);
        geometry.rotation.order = 'ZYX';
        return geometry;
    }

    function torusShip(){
        "use strict";

        var floorTexture = new THREE.ImageUtils.loadTexture( 'img/noise3.jpg' );
        var lightmap = new THREE.ImageUtils.loadTexture( 'img/noise3_lightmap.jpg' );
        floorTexture.wrapS = floorTexture.wrapT = THREE.MirroredRepeatWrapping;

        var color = colors.triad[2];
//        color.setHSL(Math.random(),1,0.3);
//        color.setHSL(0.8,1,0.5);
        var geometry = new THREE.TorusGeometry(5, 2);

        var scaler = new THREE.Matrix4();
        scaler.scale({x : 1.8, y : 1, z : 1});
        var cabine = new THREE.SphereGeometry(2.5);
        cabine.applyMatrix(scaler);
        var sub = new THREE.SphereGeometry(5);
        sub.applyMatrix(scaler);

        var torus = THREE.CSG.toCSG(new THREE.TorusGeometry(5, 2, 5, 20),new THREE.Vector3(0,0,0));
        var sphere   = THREE.CSG.toCSG(sub, new THREE.Vector3(3.5,0,0));
        var cab   = THREE.CSG.toCSG(cabine, new THREE.Vector3(-3.5,0,0));
        console.log(cab);
        var geometry = THREE.CSG.fromCSG(torus.subtract(sphere).union(cab));
        _calculateUVsAfterCSG(geometry);

        // TODO adjust colors in material

//        var material = materials.phongEmissive(color, floorTexture, lightmap);
        var material = materials.lambertBasic(color, floorTexture, lightmap);

        geometry = new THREE.Mesh(geometry, material);
        geometry.rotation.order = 'ZYX';
        return geometry;
    }

    function multiNodeShip(){
        "use strict";

        var lightmap = new THREE.ImageUtils.loadTexture( 'img/noise3_lightmap.jpg' );

        var color = new THREE.Color();
        color.setHSL(Math.random(),1,0.5);

        var bodyPart1 = new THREE.CylinderGeometry(1.3, 4, 20);
        var bodyPart2 = new THREE.SphereGeometry(4.2);

        var scaler = new THREE.Matrix4();
        scaler.scale({x : 2.5, y : 1, z : 1});

        var rotator = new THREE.Matrix4();
        rotator.makeRotationZ(1.57);

        bodyPart2.applyMatrix(scaler);

        var cabine1 = new THREE.SphereGeometry(2);
        var cabine2 = new THREE.SphereGeometry(2);
        cabine1.applyMatrix(scaler);
        cabine2.applyMatrix(scaler.scale({x : 0.5, y : 2, z : 1}));

        var engine1 = new THREE.CylinderGeometry(0.7, 1.5, 4);
        var engine2 = new THREE.CylinderGeometry(0.7, 1.5, 4);
        var joint1 = new THREE.CylinderGeometry(0.01, 1.5, 12);
        var joint2 = new THREE.CylinderGeometry(1.5, 0.01, 12);

        bodyPart1.applyMatrix(rotator);

        engine1.applyMatrix(rotator);
        engine2.applyMatrix(rotator);
        rotator.makeRotationZ(0.5);
        joint1.applyMatrix(rotator);
        joint2.applyMatrix(rotator.getInverse(rotator));
        var body1 = THREE.CSG.toCSG(bodyPart1,new THREE.Vector3(3,0,0));
        var body2   = THREE.CSG.toCSG(bodyPart2, new THREE.Vector3(2,0,0));
        var cab1   = THREE.CSG.toCSG(cabine1, new THREE.Vector3(-3.5,0,2));
        var cab2   = THREE.CSG.toCSG(cabine2, new THREE.Vector3(6,0,0.5));
        engine1   = THREE.CSG.toCSG(engine1, new THREE.Vector3(-8,5,0));
        engine2   = THREE.CSG.toCSG(engine2, new THREE.Vector3(-8,-5,0));
        joint1   = THREE.CSG.toCSG(joint1, new THREE.Vector3(-7,5,0));
        joint2   = THREE.CSG.toCSG(joint2, new THREE.Vector3(-7,-5,0));

        var geometry = THREE.CSG.fromCSG(body1.intersect(body2).union(cab1).union(cab2).union(joint1).union(joint2).union(engine1).union(engine2));
        _calculateUVsAfterCSG(geometry);

        // TODO adjust colors in material

//        var material = materials.phongEmissive(color, lightmap, lightmap);
        var material = materials.lambertBasic(color, lightmap, lightmap);

        geometry = new THREE.Mesh(geometry, material);
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
        simple2DShip : simple2DShip,
        multiNodeShip : multiNodeShip,
        colors : colors
    }

})();