var lw = {};
lw.SPRITE_VERT_SHADER_SRC = 'uniform mat4 projectionMatrix;attribute vec4 vertex;varying highp vec2 vTextureCoord;void main() { gl_Position = projectionMatrix * vec4(vertex.xy, 0, 1); vTextureCoord = vec2(vertex.zw);}';
lw.SPRITE_FRAG_SHADER_SRC = 'uniform sampler2D texture;varying highp vec2 vTextureCoord;void main(){ gl_FragColor = texture2D(texture, vTextureCoord);}';
"use strict";

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
    var positionLocation = gl.getAttribLocation(program, "vertex");
    var matrixLocation = gl.getUniformLocation(program, 'projectionMatrix');


    gl.uniformMatrix4fv(matrixLocation, false,
    [
        2 / canvas.width, 0, 0, 0,
        0, -2 / canvas.height, 0, 0,
        0, 0, 2 / 1, 0,
        -1, 1, 0, 1,
    ]);




    var setBuffer = function(buffer, index, x, y, width, height)
    {
        buffer[(index * 24) + 0] = x;
        buffer[(index * 24) + 1] = y;
        buffer[(index * 24) + 2] = 0;
        buffer[(index * 24) + 3] = 0;

        buffer[(index * 24) + 4] = x;
        buffer[(index * 24) + 5] = y + height;
        buffer[(index * 24) + 6] = 0;
        buffer[(index * 24) + 7] = 1;

        buffer[(index * 24) + 8] = x + width;
        buffer[(index * 24) + 9] = y;
        buffer[(index * 24) + 10] = 1;
        buffer[(index * 24) + 11] = 0;

        buffer[(index * 24) + 12] = x + width;
        buffer[(index * 24) + 13] = y + height;
        buffer[(index * 24) + 14] = 1;
        buffer[(index * 24) + 15] = 1;

        buffer[(index * 24) + 16] = x + width;
        buffer[(index * 24) + 17] = y;
        buffer[(index * 24) + 18] = 1;
        buffer[(index * 24) + 19] = 0;

        buffer[(index * 24) + 20] = x;
        buffer[(index * 24) + 21] = y + height;
        buffer[(index * 24) + 22] = 0;
        buffer[(index * 24) + 23] = 1;



        /*return [
            x, y, 0, 0,
            x, y + height, 0, 1,
            x + width, y, 1, 0,

            x + width, y + height, 1, 1,
            x + width, y, 1, 0,
            x, y + height, 0, 1
        ];*/
    };


  

    // Create a buffer and put a single clipspace rectangle in
    // it (2 triangles)
    var buffer = gl.createBuffer();

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

    var floatBuffer = new Float32Array(10000 * 24);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, 
                      floatBuffer, 
                      gl.DYNAMIC_DRAW);

    window.requestAnimationFrame(function render()
    {
        window.requestAnimationFrame(render);

        if (!image.complete) return;

        for (var i = 0; i < 10000; i++)
        {
            setBuffer(floatBuffer, i,
                      Math.random() * 300, Math.random() * 300,
                      Math.random() * 64, Math.random() * 64)
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, floatBuffer);

        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 4, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6 * 10000);
    });

    document.body.appendChild(canvas);
})();