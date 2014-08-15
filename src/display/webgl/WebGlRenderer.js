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

        this.width = width;
        this.height = height;

        // Canvas element
        this.domElement = document.createElement('canvas');
        
        this.domElement.width = width || DEFAULT_WIDTH;
        this.domElement.height = height || DEFAULT_HEIGHT;

        var options = { preserveDrawingBuffer: true };

        var gl = this.domElement.getContext('webgl', options) ||
                 this.domElement.getContext('experimental-webgl', options);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        this._drawBatchPool = [];
        //this._drawDataBuffer = [];

        this.drawBatches = [];

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

        gl.enableVertexAttribArray(this._positionLocation);
        gl.vertexAttribPointer(this._positionLocation, 2, gl.FLOAT, false, STRIDE, 0);

        gl.enableVertexAttribArray(this._texCoordLocation);
        gl.vertexAttribPointer(this._texCoordLocation, 2, gl.FLOAT, false, STRIDE, TEX_COORD_OFFSET);

        gl.enableVertexAttribArray(this._colorLocation);
        gl.vertexAttribPointer(this._colorLocation, 2, gl.FLOAT, false, STRIDE, COLOR_OFFSET);

        this.context = gl;
    };

    WebGlRenderer.prototype = Object.create(ow.Renderer.prototype);
    WebGlRenderer.prototype.constructor = WebGlRenderer;

    var drawBatchPool = [];

    var DrawBatch = function()
    {
        this.texture = null;
        this.size = 0;

        this.vertexBuffer = new Float32Array(START_BUFFER_SIZE * 24);
    };

    DrawBatch.prototype.dispose = function()
    {
        this.texture = null;
        this.size = 0;

        drawBatchPool.push(this);
    }

    DrawBatch.create = function()
    {
        var drawBatch = drawBatchPool.pop();

        if (!drawBatch)
        {
            drawBatch = new DrawBatch();
        }

        return drawBatch;
    }

    WebGlRenderer.prototype.drawTexture = function(texture, textureRect, transformMatrix, alpha, color)
    {
        var textureId = texture.getId();
        var drawBatches = this.drawBatches;
        var drawBatchesLength = drawBatches.length;

        var drawBatch = drawBatches[textureId];

        if (!drawBatch)
        {
            drawBatch = DrawBatch.create();

            drawBatch.texture = texture;
            drawBatches[textureId] = drawBatch;
        }

        var vertexBuffer = drawBatch.vertexBuffer;

        var size = drawBatch.size;

        var indexOffset = size * 24;
        //var elementIndexOffset = size * 6;
        //var intIndexOffset = size * 4;

        var x = textureRect.x;
        var y = textureRect.y;

        var width = textureRect.width;
        var height = textureRect.height;

        var top = y / texture.height;
        var left = x / texture.width;

        var right = (x + width) / texture.width;
        var bottom = (y + height) / texture.height;

        vertexBuffer[indexOffset + 0] = /*(transformMatrix.a * 0) + (transformMatrix.b * 0) + */transformMatrix.tx;
        vertexBuffer[indexOffset + 1] = /*(transformMatrix.c * 0) + (transformMatrix.d * 0) + */transformMatrix.ty;

        vertexBuffer[indexOffset + 2] = left;
        vertexBuffer[indexOffset + 3] = top;

        vertexBuffer[indexOffset + 4] = alpha;
        vertexBuffer[indexOffset + 5] = color;

        vertexBuffer[indexOffset + 6] = transformMatrix.a * width/* + (transformMatrix.b * 0)*/ + transformMatrix.tx;
        vertexBuffer[indexOffset + 7] = transformMatrix.c * width/* + (transformMatrix.d * 0)*/ + transformMatrix.ty;

        vertexBuffer[indexOffset + 8] = right;
        vertexBuffer[indexOffset + 9] = top;

        vertexBuffer[indexOffset + 10] = alpha;
        vertexBuffer[indexOffset + 11] = color;

        vertexBuffer[indexOffset + 12] = transformMatrix.a * width + transformMatrix.b * height + transformMatrix.tx;
        vertexBuffer[indexOffset + 13] = transformMatrix.c * width + transformMatrix.d * height + transformMatrix.ty;

        vertexBuffer[indexOffset + 14] = right;
        vertexBuffer[indexOffset + 15] = bottom;

        vertexBuffer[indexOffset + 16] = alpha;
        vertexBuffer[indexOffset + 17] = color;

        vertexBuffer[indexOffset + 18] = /*(transformMatrix.a * 0) + */transformMatrix.b * height + transformMatrix.tx;
        vertexBuffer[indexOffset + 19] = /*(transformMatrix.c * 0) + */transformMatrix.d * height + transformMatrix.ty;

        vertexBuffer[indexOffset + 20] = left;
        vertexBuffer[indexOffset + 21] = bottom;

        vertexBuffer[indexOffset + 22] = alpha;
        vertexBuffer[indexOffset + 23] = color;

        ++drawBatch.size;

        if (drawBatch.size >= START_BUFFER_SIZE)
        {
            this._drawBatch(drawBatch);
            drawBatch.size = 0;
        }

        /*var session = this.renderSession[textureId];

        if (!session)
        {
            session = this._drawBatchPool.pop();

            

            session.texture = texture;
            session.drawDataArrayLength = 0;

            this.renderSession[textureId] = session;
        }

        var drawData = new DrawData();
        session.drawDataArray.push(drawData);

        drawData.textureRect = textureRect;
        drawData.transformMatrix = transformMatrix;

        drawData.alpha = alpha;
        drawData.color = color;*/

        /*
        var width = textureRect.width;
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
    };

    WebGlRenderer.prototype.render = function(drawable)
    {
        drawable.draw(this);

        var id;
        var gl = this.context;

        var drawIndex = 0;
        var session = null;

        var i = 0;
        var texture = null;

        var drawBatches = this.drawBatches;
        var drawBatchesLength = drawBatches.length;

        var drawBatch = null;

        for (id in drawBatches)
        {
            drawBatch = drawBatches[id];

            this._drawBatch(drawBatch);

            drawBatch.dispose();
            //this._drawBatchBuffer.push(session);
        }    

        // Reset array
        drawBatches.length = 0;
    };

    WebGlRenderer.prototype._drawBatch = function(drawBatch)
    {
        var texture = drawBatch.texture;
        var gl = this.context;

        var drawIndex = 0;
        var i = 0;

        var floatBuffer = drawBatch.vertexBuffer;
        var intBuffer = this._intBuffer;

        // var drawDataArray = session.drawDataArray;
        // var drawDataArrayLength = session.drawDataArray.length;

        // var iteration;
        // var numIterations = Math.ceil(drawDataArrayLength / START_BUFFER_SIZE);

        // for (iteration = 0; iteration < numIterations; ++iteration)
        // {
        //     var offset = iteration * START_BUFFER_SIZE;
        //     drawIndex = 0;

        //     var maxI = Math.min(offset + START_BUFFER_SIZE, drawDataArrayLength);

        //     for (i = offset; i < maxI; ++i)
        //     {
        //         var obj = drawDataArray[i];

        //         var textureRect = obj.textureRect;
        //         var transformMatrix = obj.transformMatrix;
        //         var alpha = obj.alpha;
        //         var color = obj.color;

        //         var indexOffset = drawIndex * 24;
        //         var elementIndexOffset = drawIndex * 6;
        //         var intIndexOffset = drawIndex * 4;

        //         var x = textureRect.x;
        //         var y = textureRect.y;

        //         var width = textureRect.width;
        //         var height = textureRect.height;

        //         var top = y / texture._height;
        //         var left = x / texture._width;

        //         var right = (x + width) / texture._width;
        //         var bottom = (y + height) / texture._height;

        //         floatBuffer[indexOffset + 0] = /*(transformMatrix.a * 0) + (transformMatrix.b * 0) + */transformMatrix.tx;
        //         floatBuffer[indexOffset + 1] = /*(transformMatrix.c * 0) + (transformMatrix.d * 0) + */transformMatrix.ty;

        //         floatBuffer[indexOffset + 2] = left;
        //         floatBuffer[indexOffset + 3] = top;

        //         floatBuffer[indexOffset + 4] = alpha;
        //         floatBuffer[indexOffset + 5] = color;

        //         floatBuffer[indexOffset + 6] = (transformMatrix.a * width)/* + (transformMatrix.b * 0)*/ + transformMatrix.tx;
        //         floatBuffer[indexOffset + 7] = (transformMatrix.c * width)/* + (transformMatrix.d * 0)*/ + transformMatrix.ty;

        //         floatBuffer[indexOffset + 8] = right;
        //         floatBuffer[indexOffset + 9] = top;

        //         floatBuffer[indexOffset + 10] = alpha;
        //         floatBuffer[indexOffset + 11] = color;

        //         floatBuffer[indexOffset + 12] = (transformMatrix.a * width) + (transformMatrix.b * height) + transformMatrix.tx;
        //         floatBuffer[indexOffset + 13] = (transformMatrix.c * width) + (transformMatrix.d * height) + transformMatrix.ty;

        //         floatBuffer[indexOffset + 14] = right;
        //         floatBuffer[indexOffset + 15] = bottom;

        //         floatBuffer[indexOffset + 16] = alpha;
        //         floatBuffer[indexOffset + 17] = color;

        //         floatBuffer[indexOffset + 18] = /*(transformMatrix.a * 0) + */(transformMatrix.b * height) + transformMatrix.tx;
        //         floatBuffer[indexOffset + 19] = /*(transformMatrix.c * 0) + */(transformMatrix.d * height) + transformMatrix.ty;

        //         floatBuffer[indexOffset + 20] = left;
        //         floatBuffer[indexOffset + 21] = bottom;

        //         floatBuffer[indexOffset + 22] = alpha;
        //         floatBuffer[indexOffset + 23] = color;

        //         ++drawIndex;
        //     }

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
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, floatBuffer.subarray(0, drawBatch.size * 24));

        gl.drawElements(gl.TRIANGLES, 6 * drawBatch.size, gl.UNSIGNED_SHORT, 0);
        // }
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
