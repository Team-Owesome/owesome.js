
var test = new ow.Texture('res/tiles.png');
var test2 = new ow.Texture('res/tiles2.png');

var renderer = new ow.WebGlRenderer();
var sprite = new ow.Sprite(test, new ow.Rectangle(32.0, 32.0, 64.0, 64.0), new ow.Vector(0, 0));

var matrix = new ow.Matrix();

var draw = function()
{
    window.requestAnimationFrame(draw);

    //sprite.rotation += 1.0;
    sprite.position.x = 100;
    sprite.position.y = 100;
    //sprite.scale.x += 0.1;

    renderer.clear();


    /*for (var i = 0; i < 5000; i++)
    {
        renderer.drawTexture(test, {x: Math.random() * 300, y: Math.random() * 300, width: 100, height: 100});
    }*/

    /*for (var i = 0; i < 1000; i++)
    {
        renderer.drawTexture(test2, {x: Math.random() * 300, y: Math.random() * 300, width: 100, height: 100});
    }*/

    //var prevTime = Date.now();
    /*
    for (var i = 0; i < 10; i++)
    {
        for (var j = 0; j < 10; j++)
        {     
            sprite.position.x = i * 64;
            sprite.position.y = j * 64;
            renderer.draw(sprite);
        }
    }*/

    for (var j = 0; j < 3000; j++)
    {     
        sprite.position.x = Math.random() * window.innerWidth;
        sprite.position.y = Math.random() * window.innerHeight;
        renderer.draw(sprite);
    }

    renderer.commit();
    //var duration = Date.now() - prevTime;
};

draw();

document.body.appendChild(renderer.domElement);



(function()
{
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl');


    canvas.style.backgroundColor = '#CCCCCC';
    canvas.style.marginLeft = '10px';

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
        0, 0, 0, 0,
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

    var floatBuffer = new Float32Array(10 * 24);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, 
                      floatBuffer, 
                      gl.DYNAMIC_DRAW);

    

        for (var i = 0; i < 10; i++)
        {
            setBuffer(floatBuffer, i,
                      Math.random() * 300, Math.random() * 300,
                      Math.random() * 64, Math.random() * 64)
        }
    /*window.requestAnimationFrame(function render()
    {
        window.requestAnimationFrame(render);

        if (!image.complete) return;

            

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, floatBuffer);

        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 4, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6 * 10);
    });*/

    document.body.appendChild(canvas);
});