"use strict";

var canvas;
var gl;

var numVertices  = 36;

var numChecks = 8;

var program;

var c;

var flag = true;
var togl_dir_flag = true;
var togl_light_flag = true;
var togl_proj_flag = true;

var pointsArray = [];
var normalsArray = [];


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

//Removed Colors from JS

var light_position = vec4(0.0, 1.0, 5.0, 0.0 );
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4(0.25, 0.25, 0.25);
var materialDiffuse = vec4(0.4, 0.4, 0.4);
var materialSpecular = vec4(0.774597, 0.774597, 0.774597);
var materialShininess = 90; //76.8


var ambientColor, diffuseColor, specularColor;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var theta = [45.0, 45.0, 45.0];

var transl_X = 0;
var transl_Y = 0;
var transl_Z = 0;

var scaling_value = 0.5;

var near = 0.1;
var far = 5;

var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;

var  fovy = 90.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio

var eye = vec3(0.0, 0.0, 2.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var model_view_matrix;
var projection_matrix;

function quad(a, b, c, d) {

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);


    pointsArray.push(vertices[a]);
    normalsArray.push(normal);

    pointsArray.push(vertices[b]);
    normalsArray.push(normal);

    pointsArray.push(vertices[c]);
    normalsArray.push(normal);

    pointsArray.push(vertices[a]);
    normalsArray.push(normal);

    pointsArray.push(vertices[c]);
    normalsArray.push(normal);

    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var ambient_product = mult(lightAmbient, materialAmbient);
    var diffuse_product = mult(lightDiffuse, materialDiffuse);
    var specular_product = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambient_product"), flatten(ambient_product));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuse_product"), flatten(diffuse_product) );
    gl.uniform4fv(gl.getUniformLocation(program, "specular_product"), flatten(specular_product) );
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),materialShininess);

    gl.uniform4fv(gl.getUniformLocation(program, "light_position"), flatten(light_position) );

    // changed here
    gl.uniform4fv(gl.getUniformLocation(program, "goru_ambient_product"), flatten(ambient_product));
    gl.uniform4fv(gl.getUniformLocation(program, "goru_diffuse_product"), flatten(diffuse_product) );
    gl.uniform4fv(gl.getUniformLocation(program, "goru_specular_product"), flatten(specular_product) );
    // ask about this
    gl.uniform1f(gl.getUniformLocation(program, "goru_shininess"),materialShininess);


 document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
 document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
 document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
 document.getElementById("ButtonT").onclick = function(){flag = !flag;};
 document.getElementById("ButtonRot_Dir").onclick = function(){togl_dir_flag = !togl_dir_flag;};
 document.getElementById("Button_Proj").onclick = function(){togl_proj_flag = !togl_proj_flag;};
 document.getElementById("Button_Light").onclick = function(){togl_light_flag = !togl_light_flag;};




 document.getElementById("Scaling_slider").oninput = function(event) {
    scaling_value = this.valueAsNumber;
  };

 document.getElementById("Transl_X_slider").oninput = function(event) {
    transl_X = this.valueAsNumber;
  };

 document.getElementById("Transl_Y_slider").oninput = function(event) {
    transl_Y = this.valueAsNumber;
  };

 document.getElementById("Transl_Z_slider").oninput = function(event) {
    transl_Z = -this.valueAsNumber;
  };

 document.getElementById("Near_plane_slider").oninput = function(event) {
    near = this.valueAsNumber;
  };

 document.getElementById("Far_plane_slider").oninput = function(event) {
    far = this.valueAsNumber;
  };

    render();
}

var render = function() {
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if(flag){
    if (togl_dir_flag)  theta[axis] += 2.0;
    else  theta[axis] -= 2.0;
  }

  projection_matrix = mat4();
  model_view_matrix = lookAt(eye, at, up);

  model_view_matrix = mult(model_view_matrix, translate(transl_X,transl_Y,transl_Z));
  model_view_matrix = mult(model_view_matrix, rotate(theta[xAxis], [1, 0, 0] ));
  model_view_matrix = mult(model_view_matrix, rotate(theta[yAxis], [0, 1, 0] ));
  model_view_matrix = mult(model_view_matrix, rotate(theta[zAxis], [0, 0, 1] ));
  model_view_matrix = mult(model_view_matrix, scalem(scaling_value,scaling_value,scaling_value));

  if (togl_proj_flag) {
    projection_matrix = ortho(left, right, bottom, ytop, near, far);
  }
  else {
    projection_matrix = perspective(fovy, aspect, near, far);
  }

  gl.uniformMatrix4fv( gl.getUniformLocation(program,"model_view_matrix"), false, flatten(model_view_matrix) );
  gl.uniformMatrix4fv( gl.getUniformLocation(program,"projection_matrix"), false, flatten(projection_matrix) );
  gl.uniform1i( gl.getUniformLocation(program,"togl_light_flag"), togl_light_flag );

  gl.drawArrays( gl.TRIANGLES, 0, numVertices );
  requestAnimFrame(render);
}
