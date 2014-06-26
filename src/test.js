var canvas = document.createElement('canvas');
var gl = canvas.getContext('webgl');

canvas.style.backgroundColor = '#CCCCCC';

canvas.width = 300;
canvas.height = 300;

gl.viewport(0, 0, canvas.width, canvas.height);

var vertexShaderSrc =
	'attribute vec2 a_position;' +
	'void main()' +
	'{' +
		'gl_Position = vec4(a_position, 0.0, 1.0);' +
	'}';

var fragmentShaderSrc =
	'void main()' +
	'{' +
	 	'gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);' +
	'}';

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader, vertexShaderSrc);
gl.compileShader(vertexShader);

gl.shaderSource(fragmentShader, fragmentShaderSrc);
gl.compileShader(fragmentShader);

// setup a GLSL program
var program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);
gl.useProgram(program);

// look up where the vertex data needs to go.
var positionLocation = gl.getAttribLocation(program, "a_position");

// Create a buffer and put a single clipspace rectangle in
// it (2 triangles)
var buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(
    gl.ARRAY_BUFFER, 
    new Float32Array(
	[
        -20.0 / canvas.width, -20.0 / canvas.height, 
        20.0 / canvas.width, -20.0 / canvas.height, 
        -20.0 / canvas.width, 20.0 / canvas.height,
    ]), 
    gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// draw
gl.drawArrays(gl.TRIANGLES, 0, 3);

document.body.appendChild(canvas);