var flameVertexShader =
    'attribute float size; ' +
    'attribute vec3 customColor; ' +
    'varying vec3 vColor; ' +
    'void main() { ' +
       'vColor = customColor; ' +
        'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );  ' +
        '//gl_PointSize = size; ' +
        'gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) ); ' +
        'gl_Position = projectionMatrix * mvPosition; ' +
    '}';

 var flameFragmentShader =
     'uniform vec3 color; ' +
     'uniform sampler2D texture; ' +
     'varying vec3 vColor; ' +
     'void main() {' +
         'gl_FragColor = vec4( color * vColor, 1.0 );' +
         'gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord ); ' +
     '}';

/*
ROTATED TEXTURE IN FRAGMENT SHADER

 -- vertex shader --
 attribute float size;
 attribute float rotation;
 uniform vec3 ca;

 varying vec3 vColor;
 varying float vRotation;
 varying float vPointSize;

 void main() {
 vColor = ca;
 vRotation = rotation;

 vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
 gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );
 gl_Position = projectionMatrix * mvPosition;

 vPointSize = gl_PointSize;
 }

 -- fragment shader --
 uniform vec3 color;
 uniform sampler2D texture;

 varying vec3 vColor;
 varying float vRotation;
 varying float vPointSize;

 void main() {
 float mid = 0.5;
 vec2 rotated = vec2(cos(vRotation) * (gl_PointCoord.x - mid) + sin(vRotation) * (gl_PointCoord.y - mid) + mid,
 cos(vRotation) * (gl_PointCoord.y - mid) - sin(vRotation) * (gl_PointCoord.x - mid) + mid);
 vec4 rotatedTexture = texture2D( texture,  rotated);
 gl_FragColor = vec4( color * vColor, 1.0 ) * rotatedTexture;
 }

 */
