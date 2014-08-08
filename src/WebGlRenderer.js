(function()
{
    var STRIDE = Float32Array.BYTES_PER_ELEMENT * 8;
    var TEX_COORD_OFFSET = Float32Array.BYTES_PER_ELEMENT * 2;
    var COLOR_OFFSET = Float32Array.BYTES_PER_ELEMENT * 4;
    var START_BUFFER_SIZE = 1000;

    var WebGlRenderer = function(width, height)
    {
        this.domElement = document.createElement('canvas');

        var options = { preserveDrawingBuffer: true };

        this.context = this.domElement.getContext('webgl', options) || this.domElement.getContext('experimental-webgl', options);
        this.context.clearColor(0.0, 0.0, 0.0, 1.0);

        this.domElement.width = width || 500;
        this.domElement.height = height || 500;

        this.renderSession = [];
        this.textureCache = new ow.TextureCache(this.context);

        var gl = this.context;


        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(vertexShader, ow.SPRITE_VERT_SHADER_SRC);
        gl.compileShader(vertexShader);

        gl.shaderSource(fragmentShader, ow.SPRITE_FRAG_SHADER_SRC);
        gl.compileShader(fragmentShader);

        // setup a GLSL program
        var program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);
        gl.useProgram(program);

        gl.viewport(0, 0, this.domElement.width, this.domElement.height);

        this._positionLocation = gl.getAttribLocation(program, 'vertex');
        this._colorLocation = gl.getAttribLocation(program, 'color');
        this._texCoordLocation = gl.getAttribLocation(program, 'texCoord');
        this._matrixLocation = gl.getUniformLocation(program, 'projectionMatrix');
        this._textureLocation = gl.getUniformLocation(program, 'texture');

        gl.uniformMatrix4fv(this._matrixLocation, false,
        [
            2 / this.domElement.width, 0, 0, 0,
            0, -2 / this.domElement.height, 0, 0,
            0, 0, 0, 0,
            -1, 1, 0, 1,
        ]);

        this._intBuffer = new Uint16Array(START_BUFFER_SIZE * 6);
        this._floatBuffer = new Float32Array(START_BUFFER_SIZE * 32);

        this._indexBuffer = gl.createBuffer();
        this._vertexBuffer = gl.createBuffer();

        for (var i = 0; i < this._intBuffer.length; ++i)
        {
            var elementIndexOffset = i * 6;
            var intIndexOffset = i * 4;

            this._intBuffer[elementIndexOffset + 0] = intIndexOffset + 0;
            this._intBuffer[elementIndexOffset + 1] = intIndexOffset + 1;
            this._intBuffer[elementIndexOffset + 2] = intIndexOffset + 2;

            this._intBuffer[elementIndexOffset + 3] = intIndexOffset + 2;
            this._intBuffer[elementIndexOffset + 4] = intIndexOffset + 3;
            this._intBuffer[elementIndexOffset + 5] = intIndexOffset + 0;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
                          this._floatBuffer,
                          gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._intBuffer, gl.DYNAMIC_DRAW);

        this.topLeft = new ow.Vector();
        this.topRight = new ow.Vector();
        this.bottomRight = new ow.Vector();
        this.bottomLeft = new ow.Vector();
    };

    WebGlRenderer.prototype = Object.create(ow.Renderer.prototype);
    WebGlRenderer.prototype.constructor = WebGlRenderer;

    WebGlRenderer.prototype.drawTexture = function(texture, textureRect, transformMatrix, color)
    {
        var textureId = texture.getId();
        var session = this.renderSession[textureId];

        if (!session)
        {
            session = { texture: texture, sprites: [] };
            this.renderSession[textureId] = session;
        }

        var obj = {};

        obj.textureRect = textureRect.copy();
        obj.transformMatrix = transformMatrix.copy();
        obj.color = color;

        session.sprites.push(obj);
    };

    WebGlRenderer.prototype.commit = function()
    {
        var id;
        var gl = this.context;

        var drawIndex = 0;
        var session = null;

        var i = 0;

        var texture = null;

        for (id in this.renderSession)
        {
            session = this.renderSession[id];
            drawIndex = 0;

            texture = session.texture;

            if (session.sprites.length > this._floatBuffer.length / 32)
            {
                this._floatBuffer = new Float32Array((session.sprites.length + START_BUFFER_SIZE) * 32)
                this._intBuffer = new Uint16Array((session.sprites.length + START_BUFFER_SIZE) * 6)

                for (var i = 0; i < this._intBuffer.length; ++i)
                {
                    var elementIndexOffset = i * 6;
                    var intIndexOffset = i * 4;

                    this._intBuffer[elementIndexOffset + 0] = intIndexOffset + 0;
                    this._intBuffer[elementIndexOffset + 1] = intIndexOffset + 1;
                    this._intBuffer[elementIndexOffset + 2] = intIndexOffset + 2;

                    this._intBuffer[elementIndexOffset + 3] = intIndexOffset + 2;
                    this._intBuffer[elementIndexOffset + 4] = intIndexOffset + 3;
                    this._intBuffer[elementIndexOffset + 5] = intIndexOffset + 0;
                }

                gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, this._floatBuffer, gl.DYNAMIC_DRAW);

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._intBuffer, gl.DYNAMIC_DRAW);
            }

            var floatBuffer = this._floatBuffer;
            var intBuffer = this._intBuffer;

            for (i = 0; i < session.sprites.length; ++i)
            {
                var obj = session.sprites[i];

                var textureRect = obj.textureRect;
                var transformMatrix = obj.transformMatrix;
                var color = obj.color;

                var indexOffset = drawIndex * 32;
                var elementIndexOffset = drawIndex * 6;
                var intIndexOffset = drawIndex * 4;

                var topLeft = this.topLeft;
                var topRight = this.topRight;
                var bottomRight = this.bottomRight;
                var bottomLeft = this.bottomLeft;

                topLeft.x = 0;
                topLeft.y = 0;

                topRight.x = textureRect.width;
                topRight.y = 0;

                bottomRight.x = textureRect.width;
                bottomRight.y = textureRect.height;

                bottomLeft.x = 0;
                bottomLeft.y = textureRect.height;

                var x = topLeft.x;
                var y = topLeft.y;

                topLeft.x = (transformMatrix.a * x) + (transformMatrix.b * y) + transformMatrix.tx;
                topLeft.y = (transformMatrix.c * x) + (transformMatrix.d * y) + transformMatrix.ty;

                x = topRight.x;
                y = topRight.y;

                topRight.x = (transformMatrix.a * x) + (transformMatrix.b * y) + transformMatrix.tx;
                topRight.y = (transformMatrix.c * x) + (transformMatrix.d * y) + transformMatrix.ty;

                x = bottomRight.x;
                y = bottomRight.y;

                bottomRight.x = (transformMatrix.a * x) + (transformMatrix.b * y) + transformMatrix.tx;
                bottomRight.y = (transformMatrix.c * x) + (transformMatrix.d * y) + transformMatrix.ty;

                x = bottomLeft.x;
                y = bottomLeft.y;

                bottomLeft.x = (transformMatrix.a * x) + (transformMatrix.b * y) + transformMatrix.tx;
                bottomLeft.y = (transformMatrix.c * x) + (transformMatrix.d * y) + transformMatrix.ty;

                var top = textureRect.y / texture._height;
                var left = textureRect.x / texture._width;

                var right = (textureRect.x + textureRect.width) / texture._width;
                var bottom = (textureRect.y + textureRect.height) / texture._height;

                floatBuffer[indexOffset + 0] = topLeft.x;
                floatBuffer[indexOffset + 1] = topLeft.y;

                floatBuffer[indexOffset + 2] = left;
                floatBuffer[indexOffset + 3] = top;

                floatBuffer[indexOffset + 4] = color.r;
                floatBuffer[indexOffset + 5] = color.b;
                floatBuffer[indexOffset + 6] = color.g;
                floatBuffer[indexOffset + 7] = color.a;

                floatBuffer[indexOffset + 8] = topRight.x;
                floatBuffer[indexOffset + 9] = topRight.y;

                floatBuffer[indexOffset + 10] = right;
                floatBuffer[indexOffset + 11] = top;

                floatBuffer[indexOffset + 12] = color.r;
                floatBuffer[indexOffset + 13] = color.b;
                floatBuffer[indexOffset + 14] = color.g;
                floatBuffer[indexOffset + 15] = color.a;

                floatBuffer[indexOffset + 16] = bottomRight.x;
                floatBuffer[indexOffset + 17] = bottomRight.y;

                floatBuffer[indexOffset + 18] = right;
                floatBuffer[indexOffset + 19] = bottom;

                floatBuffer[indexOffset + 20] = color.r;
                floatBuffer[indexOffset + 21] = color.b;
                floatBuffer[indexOffset + 22] = color.g;
                floatBuffer[indexOffset + 23] = color.a;

                floatBuffer[indexOffset + 24] = bottomLeft.x;
                floatBuffer[indexOffset + 25] = bottomLeft.y;

                floatBuffer[indexOffset + 26] = left;
                floatBuffer[indexOffset + 27] = bottom;

                floatBuffer[indexOffset + 28] = color.r;
                floatBuffer[indexOffset + 29] = color.b;
                floatBuffer[indexOffset + 30] = color.g;
                floatBuffer[indexOffset + 31] = color.a;

                ++drawIndex;
            }

            var glTexture = this.textureCache.getGlTexture(texture);


            if (glTexture)
            {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, glTexture);
                gl.uniform1i(this._textureLocation, 0);
            }


            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._floatBuffer.subarray(0, session.sprites.length * 32));

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
            gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, this._intBuffer.subarray(0, session.sprites.length * 6));

            gl.enableVertexAttribArray(this._positionLocation);
            gl.vertexAttribPointer(this._positionLocation, 2, gl.FLOAT, false, STRIDE, 0);

            gl.enableVertexAttribArray(this._texCoordLocation);
            gl.vertexAttribPointer(this._texCoordLocation, 2, gl.FLOAT, false, STRIDE, TEX_COORD_OFFSET);

            gl.enableVertexAttribArray(this._colorLocation);
            gl.vertexAttribPointer(this._colorLocation, 4, gl.FLOAT, false, STRIDE, COLOR_OFFSET);

            gl.drawElements(gl.TRIANGLES, 6 * session.sprites.length, gl.UNSIGNED_SHORT, 0);
        }


        this.renderSession = [];
    };

    WebGlRenderer.prototype.clear = function()
    {
        var gl = this.context;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    };

    ow.WebGlRenderer = WebGlRenderer;
})();
