"use strict";
var ow = {};
var lw = {};
lw.SPRITE_FRAG_SHADER_SRC = '/*uniform sampler2D texture;varying highp vec2 vTextureCoord;void main(){ gl_FragColor = texture2D(texture, vTextureCoord);}*/uniform sampler2D texture;varying highp vec2 vTextureCoord;void main(){ gl_FragColor = texture2D(texture, vTextureCoord);}';
lw.SPRITE_VERT_SHADER_SRC = '/*uniform mat4 projectionMatrix;attribute vec4 vertex;varying highp vec2 vTextureCoord;void main() { gl_Position = projectionMatrix * vec4(vertex.xy, 0, 1); vTextureCoord = vec2(vertex.zw);}*/uniform mat4 projectionMatrix;attribute vec4 vertex;varying highp vec2 vTextureCoord;void main() { gl_Position = projectionMatrix * vec4(vertex.xy, 0, 1); vTextureCoord = vec2(vertex.zw);}';
ow.Texture = function(imageOrSrc)
{
	this._id = ow.Texture.CurrentId++;

	if (typeof imageOrSrc === 'string')
	{
		this._internalImage = new Image();
		this._internalImage.src = imageOrSrc;
	}
	else if (imageOrSrc instanceof Image)
	{
		this._internalImage = imageOrSrc;
	}
	else
	{
		throw new TypeError('Expected Image or String!');
	}

	this.loaded = this._internalImage.complete;

	var self = this;

	if (!this.loaded)
	{
		this._internalImage.addEventListener('error', function()
		{
			throw new Error("Image coulnd't be loaded!");
		});

		this._internalImage.addEventListener('load', function()
		{
			console.debug('Texture #' + self._id + ' "' + self._internalImage.src + '" loaded...');
			self.loaded = true;
		});
	}
};

ow.Texture.prototype.getId = function()
{
	return this._id;
};

ow.Texture.prototype.getImage = function()
{
	return this._internalImage;
}

ow.Texture.CurrentId = 0; 
lw.TextureCache = function(context)
{
	this._glTextures = [];
	this._context = context;
};

lw.TextureCache.prototype.getGlTexture = function(texture)
{
	var glTexture = this._glTextures[texture.getId()];

	if (!glTexture)
	{
		if (!texture.loaded) return 0;

		var gl = this._context;

		glTexture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.getImage());
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this._glTextures[texture.getId()] = glTexture;
	}

	return glTexture;
};
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
ow.WebGlRenderer = function()
{
	this.domElement = document.createElement('canvas');
};

ow.WebGlRenderer.prototype = Object.create(ow.Renderer.prototype);
ow.WebGlRenderer.prototype.constructor = ow.WebGlRenderer;

ow.WebGlRenderer.prototype.drawSprite = function(sprite)
{

};

ow.WebGlRenderer.prototype.draw = function()
{

};

ow.WebGlRenderer.prototype.clear = function()
{

};
ow.Vector = function(x, y)
{
	this.x = Number(x || 0);
	this.y = Number(y || (x || 0));
};

ow.Vector.prototype.toArray = function()
{
	return [this.x, this.y];
};

ow.Vector.prototype.toNativeArray = function()
{
	var array = new Float32Array(2);

	array[0] = this.x;
	array[1] = this.y;

	return array;
};

ow.Vector.prototype.clone = function()
{
	return new ow.Vector(this.x, this.y);
};

ow.Vector.prototype.add = function(vectorOrNumber, optionalY)
{
	if (vectorOrNumber instanceof ow.Vector)
	{
		this.x += vectorOrNumber.x;
		this.y += vectorOrNumber.y;
	}
	else
	{
		this.x += Number(vectorOrNumber);
		this.y += Number(optionalY || vectorOrNumber);
	}

	return this;
};

ow.Vector.prototype.addition = function(vectorOrNumber, optionalY)
{
	return this.clone().add(vectorOrNumber, optionalY);
};

ow.Vector.prototype.substract = function(vectorOrNumber, optionalY)
{
	if (vectorOrNumber instanceof ow.Vector)
	{
		this.x -= vectorOrNumber.x;
		this.y -= vectorOrNumber.y;
	}
	else
	{
		this.x -= Number(vectorOrNumber);
		this.y -= Number(optionalY || vectorOrNumber);
	}

	return this;
};

ow.Vector.prototype.substraction = function(vectorOrNumber, optionalY)
{
	return this.clone().substract(vectorOrNumber, optionalY);
};

ow.Vector.prototype.multiply = function(vectorOrNumber, optionalY)
{
	if (vectorOrNumber instanceof ow.Vector)
	{
		this.x *= vectorOrNumber.x;
		this.y *= vectorOrNumber.y;
	}
	else
	{
		this.x *= Number(vectorOrNumber);
		this.y *= Number(optionalY || vectorOrNumber);
	}

	return this;
};

ow.Vector.prototype.multiplication = function(vectorOrNumber, optionalY)
{
	return this.clone().multiplication(vectorOrNumber, optionalY);
};

var test = new ow.Texture('res/tiles.png');
var test2 = new ow.Texture('res/tiles2.png');

var renderer = new ow.WebGlRenderer();

var draw = function()
{
    window.requestAnimationFrame(draw);

    /*for (var i = 0; i < 5000; i++)
    {
        renderer.drawTexture(test, {x: Math.random() * 300, y: Math.random() * 300, width: 100, height: 100});
    }*/

    /*for (var i = 0; i < 1000; i++)
    {
        renderer.drawTexture(test2, {x: Math.random() * 300, y: Math.random() * 300, width: 100, height: 100});
    }*/


    renderer.draw();
};

setTimeout(draw, 1000);

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