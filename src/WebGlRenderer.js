(function()
{
    var STRIDE = Float32Array.BYTES_PER_ELEMENT * 6;
    var TEX_COORD_OFFSET = Float32Array.BYTES_PER_ELEMENT * 2;
    var COLOR_OFFSET = Float32Array.BYTES_PER_ELEMENT * 4;
    var START_BUFFER_SIZE = 2000;

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
        this._texCoordLocation = gl.getAttribLocation(program, 'texCoord');
        this._colorLocation = gl.getAttribLocation(program, 'aColor');

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
        this._floatBuffer = new Float32Array(START_BUFFER_SIZE * 24);

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
        gl.bufferData(gl.ARRAY_BUFFER, this._floatBuffer, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._intBuffer, gl.STATIC_DRAW);
    };

    WebGlRenderer.prototype = Object.create(ow.Renderer.prototype);
    WebGlRenderer.prototype.constructor = WebGlRenderer;

    var DrawData = function(textureRect, transformMatrix, alpha, color)
    {
        this.textureRect = textureRect;
        this.transformMatrix = transformMatrix;
        this.alpha = alpha;
        this.color = color;
    };

    WebGlRenderer.prototype.drawTexture = function(texture, textureRect, transformMatrix, alpha, color)
    {
        var textureId = texture.getId();
        var session = this.renderSession[textureId];

        if (!session)
        {
            session = { texture: texture, sprites: [] };
            this.renderSession[textureId] = session;
        }

        var obj = new DrawData(textureRect, transformMatrix, alpha, color);

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
            this.drawSession(session);
        }    

        this.renderSession = [];
    };

    WebGlRenderer.prototype.drawSession = function(session)
    {
        var texture = session.texture;
        var gl = this.context;

        var drawIndex = 0;
        var i = 0;

        var floatBuffer = this._floatBuffer;
        var intBuffer = this._intBuffer;

        var iteration;
        var numIterations = Math.ceil(session.sprites.length / START_BUFFER_SIZE);

        for (iteration = 0; iteration < numIterations; ++iteration)
        {
            var offset = iteration * START_BUFFER_SIZE;
            drawIndex = 0;

            for (i = offset; i < Math.min(offset + START_BUFFER_SIZE, session.sprites.length); ++i)
            {
                var obj = session.sprites[i];

                var textureRect = obj.textureRect;
                var transformMatrix = obj.transformMatrix;
                var alpha = obj.alpha;
                var color = obj.color;

                var indexOffset = drawIndex * 24;
                var elementIndexOffset = drawIndex * 6;
                var intIndexOffset = drawIndex * 4;

                var width = textureRect.width;
                var height = textureRect.height;

                var top = textureRect.y / texture._height;
                var left = textureRect.x / texture._width;

                var right = (textureRect.x + textureRect.width) / texture._width;
                var bottom = (textureRect.y + textureRect.height) / texture._height;

                floatBuffer[indexOffset + 0] = /*(transformMatrix.a * 0) + (transformMatrix.b * 0) + */transformMatrix.tx;
                floatBuffer[indexOffset + 1] = /*(transformMatrix.c * 0) + (transformMatrix.d * 0) + */transformMatrix.ty;

                floatBuffer[indexOffset + 2] = left;
                floatBuffer[indexOffset + 3] = top;

                floatBuffer[indexOffset + 4] = alpha;
                floatBuffer[indexOffset + 5] = color;

                floatBuffer[indexOffset + 6] = (transformMatrix.a * width)/* + (transformMatrix.b * 0)*/ + transformMatrix.tx;
                floatBuffer[indexOffset + 7] = (transformMatrix.c * width)/* + (transformMatrix.d * 0)*/ + transformMatrix.ty;

                floatBuffer[indexOffset + 8] = right;
                floatBuffer[indexOffset + 9] = top;

                floatBuffer[indexOffset + 10] = alpha;
                floatBuffer[indexOffset + 11] = color;

                floatBuffer[indexOffset + 12] = (transformMatrix.a * width) + (transformMatrix.b * height) + transformMatrix.tx;
                floatBuffer[indexOffset + 13] = (transformMatrix.c * width) + (transformMatrix.d * height) + transformMatrix.ty;

                floatBuffer[indexOffset + 14] = right;
                floatBuffer[indexOffset + 15] = bottom;

                floatBuffer[indexOffset + 16] = alpha;
                floatBuffer[indexOffset + 17] = color;

                floatBuffer[indexOffset + 18] = /*(transformMatrix.a * 0) + */(transformMatrix.b * height) + transformMatrix.tx;
                floatBuffer[indexOffset + 19] = /*(transformMatrix.c * 0) + */(transformMatrix.d * height) + transformMatrix.ty;

                floatBuffer[indexOffset + 20] = left;
                floatBuffer[indexOffset + 21] = bottom;

                floatBuffer[indexOffset + 22] = alpha;
                floatBuffer[indexOffset + 23] = color;

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
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._floatBuffer);

            gl.enableVertexAttribArray(this._positionLocation);
            gl.vertexAttribPointer(this._positionLocation, 2, gl.FLOAT, false, STRIDE, 0);

            gl.enableVertexAttribArray(this._texCoordLocation);
            gl.vertexAttribPointer(this._texCoordLocation, 2, gl.FLOAT, false, STRIDE, TEX_COORD_OFFSET);

            gl.enableVertexAttribArray(this._colorLocation);
            gl.vertexAttribPointer(this._colorLocation, 2, gl.FLOAT, false, STRIDE, COLOR_OFFSET);

            gl.drawElements(gl.TRIANGLES, 6 * START_BUFFER_SIZE, gl.UNSIGNED_SHORT, 0);
        }
    }

    WebGlRenderer.prototype.setSize = function(width, height)
    {

    };

    WebGlRenderer.prototype.clear = function()
    {
        var gl = this.context;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    };

    ow.WebGlRenderer = WebGlRenderer;
})();
