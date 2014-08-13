(function()
{
    var STRIDE = Float32Array.BYTES_PER_ELEMENT * 6;
    var TEX_COORD_OFFSET = Float32Array.BYTES_PER_ELEMENT * 2;
    var COLOR_OFFSET = Float32Array.BYTES_PER_ELEMENT * 4;
    var START_BUFFER_SIZE = 2000;

    var DEFAULT_WIDTH = 500;
    var DEFAULT_HEIGHT = 500;

    var WebGlRenderer = function(width, height)
    {
        width = Number(width);
        height = Number(height);

        // Canvas element
        this.domElement = document.createElement('canvas');
        
        this.domElement.width = width || DEFAULT_WIDTH;
        this.domElement.height = height || DEFAULT_HEIGHT;

        var options = { preserveDrawingBuffer: true };

        var gl = this.domElement.getContext('webgl', options) ||
                 this.domElement.getContext('experimental-webgl', options);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        this._drawBatchBuffer = [];
        //this._drawDataBuffer = [];

        this.renderSession = [];
        this.textureCache = new ow.TextureCache(gl);

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

        this._positionLocation = gl.getAttribLocation(program, 'aPosition');
        this._texCoordLocation = gl.getAttribLocation(program, 'aTexCoord');
        this._colorLocation = gl.getAttribLocation(program, 'aColor');

        this._matrixLocation = gl.getUniformLocation(program, 'uProjectionMatrix');
        this._textureLocation = gl.getUniformLocation(program, 'uTexture');

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

        this.context = gl;
    };

    WebGlRenderer.prototype = Object.create(ow.Renderer.prototype);
    WebGlRenderer.prototype.constructor = WebGlRenderer;

    /*var DrawData = function(textureRect, transformMatrix, alpha, color)
    {
        var width = textureRect.width;
        var height = textureRect.height;

        this.textureRect = textureRect;
        //this.transformMatrix = transformMatrix;

        this.topLeft = new ow.Vector(transformMatrix.tx,
                                     transformMatrix.ty);

        this.topRight = new ow.Vector(transformMatrix.a * width + transformMatrix.tx,
                                      transformMatrix.c * width + transformMatrix.ty);

        this.bottomRight = new ow.Vector(transformMatrix.a * width + transformMatrix.b * height + transformMatrix.tx,
                                   transformMatrix.c * width + transformMatrix.d * height + transformMatrix.ty);

        this.bottomLeft = new ow.Vector(transformMatrix.b * height + transformMatrix.tx,
                                    transformMatrix.d * height + transformMatrix.ty);

        this.alpha = alpha;
        this.color = color;
    };*/

    var DrawBatch = function()
    {
        this.texture = null;
        this.drawDataArrayLength = 0;
        this.drawDataArray = [];
    };

    var DrawData = function()
    {
        //this.textureRect = new ow.Rectangle();
        this.textureRect = null;
        this.transformMatrix = null;

        /*this.topLeft = new ow.Vector();
        this.topRight = new ow.Vector();
        this.bottomRight = new ow.Vector();
        this.bottomLeft = new ow.Vector();*/

        this.alpha = 1.0;
        this.color = 0xFFFFFF;
    }

    WebGlRenderer.prototype.drawTexture = function(texture, textureRect, transformMatrix, alpha, color)
    {
        var textureId = texture.getId();
        var session = this.renderSession[textureId];

        if (!session)
        {
            session = this._drawBatchBuffer.pop();

            if (!session)
            {
                session = new DrawBatch();
            }

            session.texture = texture;
            session.drawDataArrayLength = 0;

            this.renderSession[textureId] = session;
        }

        var drawData = session.drawDataArray[session.drawDataArrayLength];

        if (!drawData)
        {
            drawData = new DrawData();
            session.drawDataArray.push(drawData);
        }


        drawData.textureRect = textureRect;
        drawData.transformMatrix = transformMatrix;

        /*var width = textureRect.width;
        var height = textureRect.height;

        drawData.textureRect.x = textureRect.x;
        drawData.textureRect.y = textureRect.y;
        drawData.textureRect.width = width;
        drawData.textureRect.height = height;

        drawData.topLeft.x = transformMatrix.tx;
        drawData.topLeft.y = transformMatrix.ty;

        drawData.topRight.x = transformMatrix.a * width + transformMatrix.tx;
        drawData.topRight.y = transformMatrix.c * width + transformMatrix.ty;

        drawData.bottomRight.x = transformMatrix.a * width + transformMatrix.b * height + transformMatrix.tx;
        drawData.bottomRight.y = transformMatrix.c * width + transformMatrix.d * height + transformMatrix.ty;

        drawData.bottomLeft.x = transformMatrix.b * height + transformMatrix.tx;
        drawData.bottomLeft.y = transformMatrix.d * height + transformMatrix.ty;
        */
        drawData.alpha = alpha;
        drawData.color = color;

        session.drawDataArrayLength++;
    };

    WebGlRenderer.prototype.render = function()
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

            this._drawBatch(session);
            this._drawBatchBuffer.push(session);
        }    


            console.log(this._drawBatchBuffer.length);
        this.renderSession = [];
    };

    WebGlRenderer.prototype._drawBatch = function(session)
    {
        var texture = session.texture;
        var gl = this.context;

        var drawIndex = 0;
        var i = 0;

        var floatBuffer = this._floatBuffer;
        var intBuffer = this._intBuffer;

        var drawDataArray = session.drawDataArray;
        var drawDataArrayLength = session.drawDataArrayLength;

        var iteration;
        var numIterations = Math.ceil(drawDataArrayLength / START_BUFFER_SIZE);

        for (iteration = 0; iteration < numIterations; ++iteration)
        {
            var offset = iteration * START_BUFFER_SIZE;
            drawIndex = 0;

            var maxI = Math.min(offset + START_BUFFER_SIZE, drawDataArrayLength);

            for (i = offset; i < maxI; ++i)
            {
                var obj = drawDataArray[i];

                var textureRect = obj.textureRect;
                var transformMatrix = obj.transformMatrix;
                var alpha = obj.alpha;
                var color = obj.color;

                var indexOffset = drawIndex * 24;
                var elementIndexOffset = drawIndex * 6;
                var intIndexOffset = drawIndex * 4;

                var x = textureRect.x;
                var y = textureRect.y;

                var width = textureRect.width;
                var height = textureRect.height;

                var top = y / texture._height;
                var left = x / texture._width;

                var right = (x + width) / texture._width;
                var bottom = (y + height) / texture._height;

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
