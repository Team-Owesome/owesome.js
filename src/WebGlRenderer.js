(function()
{
    var STRIDE = Float32Array.BYTES_PER_ELEMENT * 4;
    var TEX_COORD_OFFSET = Float32Array.BYTES_PER_ELEMENT * 2;

    var RenderPass = function(context)
    {
        this.context = context;

        var gl = this.context;

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

    };

    var WebGlRenderer = function()
    {
        this.domElement = document.createElement('canvas');
        this.context = this.domElement.getContext('webgl');

        this.domElement.width = window.innerWidth;
        this.domElement.height = window.innerHeight;

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
        this._matrixLocation = gl.getUniformLocation(program, 'projectionMatrix');
        this._textureLocation = gl.getUniformLocation(program, 'texture');

        gl.uniformMatrix4fv(this._matrixLocation, false,
        [
            2 / this.domElement.width, 0, 0, 0,
            0, -2 / this.domElement.height, 0, 0,
            0, 0, 0, 0,
            -1, 1, 0, 1,
        ]);

        this._intBuffer = new Uint16Array(6000 * 6);
        this._floatBuffer = new Float32Array(6000 * 16);

        this._indexBuffer = gl.createBuffer();
        this._vertexBuffer = gl.createBuffer();

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

    WebGlRenderer.prototype.drawTexture = function(texture, textureRect, transformMatrix)
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

        session.sprites.push(obj);

        /*this.context.save();

        //draw a circle
        this.context.beginPath();
        this.context.arc(0, 0, 3, 0, Math.PI*2, true); 
        this.context.closePath();
        this.context.fill();

        this.context.beginPath();

        this.context.moveTo(this.topLeft.x, this.topLeft.y);
        this.context.lineTo(this.topRight.x, this.topRight.y);
        this.context.lineTo(this.bottomRight.x, this.bottomRight.y);
        this.context.lineTo(this.bottomLeft.x, this.bottomLeft.y);

        this.context.closePath();
        this.context.stroke();

        this.context.restore();*/
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

            for (i = 0; i < session.sprites.length; ++i)
            {
                var obj = session.sprites[i];

                var textureRect = obj.textureRect;
                var transformMatrix = obj.transformMatrix;

                var indexOffset = drawIndex * 16;
                var blaIndexOffset = drawIndex * 6;
                var intIndexOffset = drawIndex * 4;

                this.topLeft.x = 0;
                this.topLeft.y = 0;

                this.topRight.x = textureRect.width;
                this.topRight.y = 0;

                this.bottomRight.x = textureRect.width;
                this.bottomRight.y = textureRect.height;

                this.bottomLeft.x = 0;
                this.bottomLeft.y = textureRect.height;

                this.topLeft.applyMatrix(transformMatrix);
                this.topRight.applyMatrix(transformMatrix);
                this.bottomRight.applyMatrix(transformMatrix);
                this.bottomLeft.applyMatrix(transformMatrix);


                var top = textureRect.y / texture._width;
                var left = textureRect.x / texture._height;

                var right = (textureRect.x + textureRect.width) / texture._width;
                var bottom = (textureRect.y + textureRect.height) / texture._height;


                this._floatBuffer[indexOffset + 0] = this.topLeft.x;
                this._floatBuffer[indexOffset + 1] = this.topLeft.y;

                this._floatBuffer[indexOffset + 2] = left;
                this._floatBuffer[indexOffset + 3] = top;

                this._floatBuffer[indexOffset + 4] = this.topRight.x;
                this._floatBuffer[indexOffset + 5] = this.topRight.y;

                this._floatBuffer[indexOffset + 6] = right;
                this._floatBuffer[indexOffset + 7] = top;

                this._floatBuffer[indexOffset + 8] = this.bottomRight.x;
                this._floatBuffer[indexOffset + 9] = this.bottomRight.y;

                this._floatBuffer[indexOffset + 10] = right;
                this._floatBuffer[indexOffset + 11] = bottom;

                this._floatBuffer[indexOffset + 12] = this.bottomLeft.x;
                this._floatBuffer[indexOffset + 13] = this.bottomLeft.y;

                this._floatBuffer[indexOffset + 14] = left;
                this._floatBuffer[indexOffset + 15] = bottom;

                this._intBuffer[blaIndexOffset + 0] = intIndexOffset + 0;
                this._intBuffer[blaIndexOffset + 1] = intIndexOffset + 1;
                this._intBuffer[blaIndexOffset + 2] = intIndexOffset + 2;

                this._intBuffer[blaIndexOffset + 3] = intIndexOffset + 2;
                this._intBuffer[blaIndexOffset + 4] = intIndexOffset + 3;
                this._intBuffer[blaIndexOffset + 5] = intIndexOffset + 0;

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

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
            gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, this._intBuffer);

            gl.enableVertexAttribArray(this._positionLocation);
            gl.vertexAttribPointer(this._positionLocation, 2, gl.FLOAT, false, STRIDE, 0);

            gl.enableVertexAttribArray(this._texCoordLocation);
            gl.vertexAttribPointer(this._texCoordLocation, 2, gl.FLOAT, false, STRIDE, TEX_COORD_OFFSET);

            gl.drawElements(gl.TRIANGLES, 6 * session.sprites.length, gl.UNSIGNED_SHORT, 0);
        }


        /*gl.enable(gl.CULL_FACE);

        gl.cullFace(gl.FRONT_AND_BACK);*/


        this.renderSession = [];
    };

    WebGlRenderer.prototype.clear = function()
    {

    };

    ow.WebGlRenderer = WebGlRenderer;
})();
