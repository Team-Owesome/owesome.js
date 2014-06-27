(function()
{
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl');


    canvas.style.backgroundColor = '#CCCCCC';

    canvas.width = 300;
    canvas.height = 300;

    gl.viewport(0, 0, canvas.width, canvas.height);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, lw.SPRITE_VERT_SHADER_SRC);
    gl.compileShader(vertexShader);

    gl.shaderSource(fragmentShader, lw.SPRITE_FRAG_SHADER_SRC);
    gl.compileShader(fragmentShader);

    // setup a GLSL program
    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    console.log('TEEST');

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "position");

    // Create a buffer and put a single clipspace rectangle in
    // it (2 triangles)
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ARRAY_BUFFER, 
        new Float32Array(
        [
            -1.0, -1.0,
            -1.0, 0.0,
            0.0, -1.0,
            0.0, -1.0,
            -1.0, 0.0,
            0.0, 0.0
        ]), 
        gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    var texture = gl.createTexture();
    var image = new Image();

    image.src = 'res/tiles.png';
    image.onload = function()
    {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };

    window.requestAnimationFrame(function render()
    {
        window.requestAnimationFrame(render);

        if (!image.complete) return;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

        // draw
        for (var i = 0; i < 2000; i++)
        {
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    });

    document.body.appendChild(canvas);
})();