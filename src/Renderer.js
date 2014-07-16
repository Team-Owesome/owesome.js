ow.Renderer = function()
{
	this.domElement = null;
};

ow.Renderer.prototype.drawSprite = function(sprite) {};
ow.Renderer.prototype.draw = function() {};
ow.Renderer.prototype.clear = function() {};

/*lw.Renderer = function()
{
	this._domElement = document.createElement('canvas');


    this._domElement.style.backgroundColor = '#CCCCCC';
 	this._domElement.width = 300;
    this._domElement.height = 300;

	this._context = this._domElement.getContext('webgl');
    this._context.viewport(0, 0, this._domElement.width, this._domElement.height);


	this._textureCache = new lw.TextureCache(this._context);
	this._drawBatches = [];
	this._currentZIndex = 0;


	var gl = this._context;

	this._floatBuffer = new Float32Array(5000 * 24);
	this._vertexBuffer = gl.createBuffer();


	this._domElement.addEventListener('webglcontextlost', function(e)
	{
		e.preventDefault();
		alert('CONTEXT LOST');

	}, false);

	this._domElement.addEventListener('webglcontextrestored', function(e)
	{
		alert('CONTEXT RESTORED');
	}, false);


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

    this._positionLocation = gl.getAttribLocation(program, "vertex");
    this._matrixLocation = gl.getUniformLocation(program, 'projectionMatrix');
    this._textureLocation = gl.getUniformLocation(program, "texture");

    gl.uniformMatrix4fv(this._matrixLocation, false,
    [
        2 / this._domElement.width, 0, 0, 0,
        0, -2 / this._domElement.height, 0, 0,
        0, 0, 0, 0,
        -1, 1, 0, 1,
    ]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 
                      this._floatBuffer, 
                      gl.DYNAMIC_DRAW);

};

lw.DrawBatch = function(texture)
{
	this.drawCalls = [];
	this.texture = texture;
};

lw.DrawCall = function(destRect, textureRect, rotation, zIndex)
{
	this.destRect = destRect;
	this.textureRect = textureRect;
	this.rotation = rotation;
	this.zIndex = zIndex;
};

lw.Renderer.prototype.drawTexture = function(texture, destRect, textureRect, rotation)
{
	var drawBatch = this._drawBatches[texture.getId()];

	if (!drawBatch)
	{
		drawBatch = new lw.DrawBatch(texture);
		this._drawBatches[texture.getId()] = drawBatch;
	}

	drawBatch.drawCalls.push(new lw.DrawCall(destRect, textureRect, rotation, this._currentZIndex++));
};

lw.Renderer.prototype.render = function()
{
	//console.log(this._drawBatches);
	var drawBatchIndex;
	var drawCallIndex;

	var drawBatch;
	var drawCall;

	var drawIndex;
	var glTexture;

	var gl = this._context;

	for (drawBatchIndex in this._drawBatches)
	{
		drawIndex = 0;
		drawBatch = this._drawBatches[drawBatchIndex];

		glTexture = this._textureCache.getGlTexture(drawBatch.texture);

		gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, glTexture);
	    gl.uniform1i(this._textureLocation, 0);

	    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	    gl.enable(gl.BLEND);

		for (drawCallIndex in drawBatch.drawCalls)
		{
			drawCall = drawBatch.drawCalls[drawCallIndex];

			this._floatBuffer[(drawIndex * 24) + 0] = drawCall.destRect.x;
	        this._floatBuffer[(drawIndex * 24) + 1] = drawCall.destRect.y;
	        this._floatBuffer[(drawIndex * 24) + 2] = 0;
	        this._floatBuffer[(drawIndex * 24) + 3] = 0;

	        this._floatBuffer[(drawIndex * 24) + 4] = drawCall.destRect.x;
	        this._floatBuffer[(drawIndex * 24) + 5] = drawCall.destRect.y + drawCall.destRect.height;
	        this._floatBuffer[(drawIndex * 24) + 6] = 0;
	        this._floatBuffer[(drawIndex * 24) + 7] = 1;

	        this._floatBuffer[(drawIndex * 24) + 8] = drawCall.destRect.x + drawCall.destRect.width;
	        this._floatBuffer[(drawIndex * 24) + 9] = drawCall.destRect.y;
	        this._floatBuffer[(drawIndex * 24) + 10] = 1;
	        this._floatBuffer[(drawIndex * 24) + 11] = 0;

	        this._floatBuffer[(drawIndex * 24) + 12] = drawCall.destRect.x + drawCall.destRect.width;
	        this._floatBuffer[(drawIndex * 24) + 13] = drawCall.destRect.y + drawCall.destRect.height;
	        this._floatBuffer[(drawIndex * 24) + 14] = 1;
	        this._floatBuffer[(drawIndex * 24) + 15] = 1;

	        this._floatBuffer[(drawIndex * 24) + 16] = drawCall.destRect.x + drawCall.destRect.width;
	        this._floatBuffer[(drawIndex * 24) + 17] = drawCall.destRect.y;
	        this._floatBuffer[(drawIndex * 24) + 18] = 1;
	        this._floatBuffer[(drawIndex * 24) + 19] = 0;

	        this._floatBuffer[(drawIndex * 24) + 20] = drawCall.destRect.x;
	        this._floatBuffer[(drawIndex * 24) + 21] = drawCall.destRect.y + drawCall.destRect.height;
	        this._floatBuffer[(drawIndex * 24) + 22] = 0;
	        this._floatBuffer[(drawIndex * 24) + 23] = 1;

			drawIndex++;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
	    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._floatBuffer);

	    gl.enableVertexAttribArray(this._positionLocation);
	    gl.vertexAttribPointer(this._positionLocation, 4, gl.FLOAT, false, 0, 0);

    	gl.drawArrays(gl.TRIANGLES, 0, 6 * drawBatch.drawCalls.length);
	}

	this._drawBatches = [];
	this._currentZIndex = 0;
};*/