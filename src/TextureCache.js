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