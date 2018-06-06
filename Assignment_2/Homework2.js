"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;
//-----------Animation Stuff
var flag = false;
var dir=true;

var legAngle=-100;
var torso_loc=-7;

var x_dir, y_dir, z_dir;
var distanceZ, distanceY;
var ang_1, ang_2;

var roll=0;
var pitch=0;
//-----------Texture Stuff
var texSize = 256;
var numChecks = 8;

var texture1, texture2;
var t1, t2;

var c;

// Create a checkerboard pattern using floats

var image1 = new Uint8Array(4*texSize*texSize);

    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            var patchx = Math.floor(i/(texSize/numChecks));
            var patchy = Math.floor(j/(texSize/numChecks));
            if(patchx%2 ^ patchy%2) c = 255;
            else c = 0;
            image1[4*i*texSize+4*j] = c;
            image1[4*i*texSize+4*j+1] = c;
            image1[4*i*texSize+4*j+2] = c;
            image1[4*i*texSize+4*j+3] = 255;
        }
    }

var image2 = new Uint8Array(4*texSize*texSize);

    // Create a checkerboard pattern
    for ( var i = 0; i < texSize; i++ ) {
        for ( var j = 0; j <texSize; j++ ) {
            image2[4*i*texSize+4*j] = i-255;
            image2[4*i*texSize+4*j+1] = i-255;
            image2[4*i*texSize+4*j+2] = i-255;
            image2[4*i*texSize+4*j+3] = 255;
           }
    }

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];


var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];


var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


function configureTexture() {
    texture1 = gl.createTexture(); // create a texture object
    gl.bindTexture( gl.TEXTURE_2D, texture1 ); //bind the texture object as the current texture
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    //(target, level, components (RGBA), width of image, height of image, border is not used anymore, format: RGB, type: unsigned bytes or what not,
    // texels: pointer to the texel array on the application side of where the textures actually are)
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    texture2 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}



//-----------Texture Stuff

var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;

var tailId = 11; //




var torsoWidth = 4.0;
var torsoHeight = 1.6;

var upperArmHeight = 1.25;
var lowerArmHeight = 1.25;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;
var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.5;

var lowerLegHeight = 1.6;
var upperLegHeight = 1.4;

var headHeight = 2.0;
var headWidth = 1.0;

var tailHeight = 2.0;
var tailWidth = 0.5;


var numNodes = 12; // incremented it once
var numAngles = 12; // incremented it once
var angle = 0;

//var theta = [0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 0, 0]; // Pre-Animation
var theta = [-90, 0, -100, 10, -100, 10, -100, 10, -100, 10, 0, 45]; // Animation

var numVertices = 24;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;


//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case torsoId:
    //---Animation Stuff
    m= translate(torso_loc,6,0);
    m =mult(m, rotate(theta[torsoId], 0, 0, 1 ));
    m=mult(m, rotate(theta[torsoId], 0, 1, 0 ));
    //---Animation Stuff
  //  m = rotate(theta[torsoId], 0, 1, 0 );
    figure[torsoId] = createNode( m, torso, null, headId );
    break;

    case headId:
    case head1Id:
    case head2Id:


    //m = translate(0.0, torsoHeight+0.5*headHeight, 0.0); //---Pre-Animation
  m = translate(0.0, torsoWidth, 1.3); //---Animation Stuff
  m = mult(m, rotate(theta[head1Id], 1, 0, 0))
	m = mult(m, rotate(theta[head2Id], 0, 1, 0));
    //m = mult(m, translate(0.0, -0.5*headHeight, 0.0)); //---Pre-Animation
    m = mult(m, rotate(roll, 0,0,1));
  	m = mult(m, rotate(pitch, 1,0, 0));
    //---Animation Stuff
    figure[headId] = createNode( m, head, leftUpperArmId, null);
    break;


    case leftUpperArmId:

    //m = translate(-(torsoWidth+upperArmWidth), 0.9*torsoHeight, 0.0); // Pre-Animation
    m = translate(-torsoHeight, 0.95*torsoWidth , -0.5); //Animation
    m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:

    //m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0); // Pre-Animation
    m = translate(torsoHeight, 0.95*torsoWidth, -0.5); //Animation
    m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

    case leftUpperLegId:

    // m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0); // Pre-Animation
  m = translate(-(torsoHeight), 0.1*torsoWidth, 0.0); // Animation
	  m = mult(m , rotate(theta[leftUpperLegId], 1, 0, 0));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:

    // m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0); // Pre-Animation
    m = translate(torsoHeight, 0.1*torsoWidth, 0.0); // Animation
    m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, tailId, rightLowerLegId );
    break;

    case tailId:
    //

    // m = translate(0.0, 0.0, 0.0); // Pre-Animation
    m = translate(0.0, -0.25*torsoWidth, -0.8); // Animation
    m = mult(m, rotate(theta[tailId], 1, 0, 0));
    figure[tailId] = createNode( m, tail, null, null );
    break;

    case leftLowerArmId:

     m = translate(0.0, upperArmHeight, 0.0); // Pre-Animation = Animation
     m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0); // Pre-Animation = Animation
    m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    break;

    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0); // Pre-Animation = Animation
    m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0); // Pre-Animation = Animation
    m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;

    }

}

function traverse(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoWidth, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoHeight, torsoWidth, torsoHeight));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, i*4, numVertices );;
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++)gl.drawArrays ( gl.TRIANGLES, 0, numVertices );
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices);
}

function tail() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(tailWidth, tailHeight, tailWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function quad(a, b, c, d) {

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[1]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[3]);
}

function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

//----Animation Stuff
//View Matrix
instanceMatrix = mat4();
var eye=vec3(0.0,0.0,6.0);
var at= vec3(0.0,0.0,0.0);
var up= vec3(0.0,1.0,0.0);
modelViewMatrix=lookAt(eye, at, up);
//----Animation Stuff



window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST); //----Animation Stuff

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program);

    // instanceMatrix = mat4(); //Pre-Animation Stuff

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0); //Animation = Pre-Animation
    // modelViewMatrix = mat4(); //Pre-Animation Stuff


    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")


    cube(); //---Texture




//----Texture Stuff
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);


    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );



    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

//----Texture Stuff
    configureTexture();

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex0"), 0);

    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.uniform1i(gl.getUniformLocation( program, "Tex1"), 1);
//----Texture Stuff

    document.getElementById("ButtonAnimate").onclick = function(){flag = !flag;};



    render();
}


var render = function() {

        gl.clear( gl.COLOR_BUFFER_BIT);

        for(i=0; i<numNodes; i++) initNodes(i); //---Animation Stuff

      //---Animation Stuff
      		if (flag){
      			if(dir){
      				theta[leftUpperArmId]+=2;
      				theta[rightUpperArmId]-=2;
      				theta[leftUpperLegId]-=2;
      				theta[rightUpperLegId]+=2;

      				theta[leftLowerArmId]=-70-theta[leftUpperArmId];
      				theta[rightLowerArmId]=-90-theta[rightUpperArmId];
      				theta[leftLowerLegId]=-90-theta[leftUpperLegId];
      				theta[rightLowerLegId]=-70-theta[rightUpperLegId];

      				legAngle-=2;
      				if (legAngle < -125) dir=false;
      			}
      			if(!dir){
      				theta[leftUpperArmId]-=2;
      				theta[rightUpperArmId]+=2;
      				theta[leftUpperLegId]+=2;
      				theta[rightUpperLegId]-=2;

      				theta[leftLowerArmId]=-90-theta[leftUpperArmId];
      				theta[rightLowerArmId]=-70-theta[rightUpperArmId];
      				theta[leftLowerLegId]=-70-theta[leftUpperLegId];
      				theta[rightLowerLegId]=-90-theta[rightUpperLegId];

      				legAngle+=2;
      				if (legAngle > -75) dir=true;
      			}

      			torso_loc+=0.08;
      			if (torso_loc > 12) torso_loc=-14;

      			// looking at the camera
      				var up_cam=eye[1]+6.3;
      				var far_cam=eye[2];

              x_dir=Math.pow(torso_loc+torsoWidth+headHeight-eye[0], 2);
      				z_dir=Math.pow(far_cam, 2);
      				y_dir=Math.pow(6.3-up_cam,2);
      				distanceZ=Math.sqrt(x_dir+z_dir);
      				distanceY=Math.sqrt(y_dir+z_dir);

      				ang_1=Math.acos(far_cam/distanceZ);
      				ang_2=Math.asin((6.3-up_cam)/distanceY);
      				ang_1=ang_1*180/3.14;
      				ang_2=-ang_2*180/3.14;

              if (torso_loc+torsoWidth+headHeight<eye[0]) ang_1=-ang_1;
      				ang_1 =-90-ang_1;
      				if (Math.abs(ang_1)<100) roll=ang_1;
      				if (Math.abs(ang_2)<45) pitch=ang_2;

      		}
            //---Animation Stuff
      traverse(torsoId); //---Animation Stuff
      requestAnimFrame(render); //---Animation Stuff


}
