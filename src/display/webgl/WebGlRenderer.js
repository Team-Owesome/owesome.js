// The MIT License (MIT)
// 
// Copyright (c) 2014 Team Owesome (http://owesome.ch)
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var STRIDE = Float32Array.BYTES_PER_ELEMENT * 6;
var TEX_COORD_OFFSET = Float32Array.BYTES_PER_ELEMENT * 2;
var COLOR_OFFSET = Float32Array.BYTES_PER_ELEMENT * 4;
var MAX_BATCH_SIZE = 2000;

var DEFAULT_WIDTH = 500;
var DEFAULT_HEIGHT = 500;

var drawBatchPool = [];

/**
 * @constructor
 */
var DrawBatch = function()
{
    this.size = 0;
    this.texture = null;

    this.vertexBufferArray = new Float32Array(MAX_BATCH_SIZE * 24);
};

DrawBatch.prototype.dispose = function()
{
    this.size = 0;
    this.texture = null;

    drawBatchPool.push(this);
};

DrawBatch.create = function(renderer)
{
    var drawBatch = drawBatchPool.pop();

    if (!drawBatch)
    {
        drawBatch = new DrawBatch();
    }

    return drawBatch;
};

/**
 * @constructor
 */
var WebGlRenderer = function(width, height)
{
    width = width || DEFAULT_WIDTH;
    height = height || DEFAULT_HEIGHT;

    this.domElement = document.createElement('canvas');

    var options = { preserveDrawingBuffer: true };

    var gl = this.domElement.getContext('webgl', options) ||
             this.domElement.getContext('experimental-webgl', options);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.drawBatches = [];

    this.renderSession = [];
    this.textureCache = new ow.TextureCache(gl);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, ow.SPRITE_VERT_SHADER_SRC);
    gl.compileShader(vertexShader);

    gl.shaderSource(fragmentShader, ow.SPRITE_FRAG_SHADER_SRC);
    gl.compileShader(fragmentShader);

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    this._positionLocation = gl.getAttribLocation(program, 'aPosition');
    this._texCoordLocation = gl.getAttribLocation(program, 'aTexCoord');
    this._colorLocation =    gl.getAttribLocation(program, 'aColor');

    this._matrixLocation =   gl.getUniformLocation(program, 'uProjectionMatrix');
    this._textureLocation =  gl.getUniformLocation(program, 'uTexture');

    this._indexBuffer = gl.createBuffer();
    this._vertexBuffer = gl.createBuffer();

    var indexBufferArray = new Uint16Array(MAX_BATCH_SIZE * 6);

    for (var i = 0; i < indexBufferArray.length; ++i)
    {
        var arrayIndexOffset = i * 6;
        var indexOffset = i * 4;

        indexBufferArray[arrayIndexOffset + 0] = indexOffset + 0;
        indexBufferArray[arrayIndexOffset + 1] = indexOffset + 1;
        indexBufferArray[arrayIndexOffset + 2] = indexOffset + 2;

        indexBufferArray[arrayIndexOffset + 3] = indexOffset + 2;
        indexBufferArray[arrayIndexOffset + 4] = indexOffset + 3;
        indexBufferArray[arrayIndexOffset + 5] = indexOffset + 0;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(MAX_BATCH_SIZE * 24), gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexBufferArray, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(this._positionLocation);
    gl.vertexAttribPointer(this._positionLocation, 2, gl.FLOAT, false, STRIDE, 0);

    gl.enableVertexAttribArray(this._texCoordLocation);
    gl.vertexAttribPointer(this._texCoordLocation, 2, gl.FLOAT, false, STRIDE, TEX_COORD_OFFSET);

    gl.enableVertexAttribArray(this._colorLocation);
    gl.vertexAttribPointer(this._colorLocation, 2, gl.FLOAT, false, STRIDE, COLOR_OFFSET);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    this.gl = gl;
    this.setSize(width, height);
};

WebGlRenderer.prototype = Object.create(Renderer.prototype);
WebGlRenderer.prototype.constructor = WebGlRenderer;

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

    var vertexBufferArray = drawBatch.vertexBufferArray;

    var size = drawBatch.size;

    var indexOffset = size * 24;

    var x = textureRect.x;
    var y = textureRect.y;

    var width = textureRect.width;
    var height = textureRect.height;

    var top = y / texture.height;
    var left = x / texture.width;

    var right = (x + width) / texture.width;
    var bottom = (y + height) / texture.height;

    vertexBufferArray[indexOffset + 0] = /*(transformMatrix.a * 0) + (transformMatrix.b * 0) + */transformMatrix.tx;
    vertexBufferArray[indexOffset + 1] = /*(transformMatrix.c * 0) + (transformMatrix.d * 0) + */transformMatrix.ty;

    vertexBufferArray[indexOffset + 2] = left;
    vertexBufferArray[indexOffset + 3] = top;

    vertexBufferArray[indexOffset + 4] = alpha;
    vertexBufferArray[indexOffset + 5] = color;

    vertexBufferArray[indexOffset + 6] = transformMatrix.a * width/* + (transformMatrix.b * 0)*/ + transformMatrix.tx;
    vertexBufferArray[indexOffset + 7] = transformMatrix.c * width/* + (transformMatrix.d * 0)*/ + transformMatrix.ty;

    vertexBufferArray[indexOffset + 8] = right;
    vertexBufferArray[indexOffset + 9] = top;

    vertexBufferArray[indexOffset + 10] = alpha;
    vertexBufferArray[indexOffset + 11] = color;

    vertexBufferArray[indexOffset + 12] = transformMatrix.a * width + transformMatrix.b * height + transformMatrix.tx;
    vertexBufferArray[indexOffset + 13] = transformMatrix.c * width + transformMatrix.d * height + transformMatrix.ty;

    vertexBufferArray[indexOffset + 14] = right;
    vertexBufferArray[indexOffset + 15] = bottom;

    vertexBufferArray[indexOffset + 16] = alpha;
    vertexBufferArray[indexOffset + 17] = color;

    vertexBufferArray[indexOffset + 18] = /*(transformMatrix.a * 0) + */transformMatrix.b * height + transformMatrix.tx;
    vertexBufferArray[indexOffset + 19] = /*(transformMatrix.c * 0) + */transformMatrix.d * height + transformMatrix.ty;

    vertexBufferArray[indexOffset + 20] = left;
    vertexBufferArray[indexOffset + 21] = bottom;

    vertexBufferArray[indexOffset + 22] = alpha;
    vertexBufferArray[indexOffset + 23] = color;

    ++drawBatch.size;

    if (drawBatch.size >= MAX_BATCH_SIZE)
    {
        this._flushBatch(drawBatch);
        drawBatch.size = 0;
    }
};

WebGlRenderer.prototype.render = function(drawable)
{
    drawable.draw(this);

    var id;
    var gl = this.gl;

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

        this._flushBatch(drawBatch);

        drawBatch.dispose();
    }    

    // Reset array
    drawBatches.length = 0;
};

WebGlRenderer.prototype._flushBatch = function(drawBatch)
{
    var gl = this.gl;

    var vertexBufferArray = drawBatch.vertexBufferArray;

    var texture = drawBatch.texture;
    var glTexture = this.textureCache.getGlTexture(texture);

    if (glTexture)
    {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.uniform1i(this._textureLocation, 0);
    }

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertexBufferArray.subarray(0, drawBatch.size * 24));
    gl.drawElements(gl.TRIANGLES, 6 * drawBatch.size, gl.UNSIGNED_SHORT, 0);
}

WebGlRenderer.prototype.setSize = function(width, height)
{
    var gl = this.gl;

    this.width = Number(width);
    this.height = Number(height);

    this.domElement.width = this.width;
    this.domElement.height = this.height;

    gl.uniformMatrix4fv(this._matrixLocation, false,
    [
        2 / this.width, 0,                0, 0,
        0,              -2 / this.height, 0, 0,
        0,              0,                0, 0,
        -1,             1,                0, 1,
    ]);

    gl.viewport(0, 0, this.width, this.height);
};

WebGlRenderer.prototype.clear = function()
{
    var gl = this.gl;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
};

ow.WebGlRenderer = WebGlRenderer;
