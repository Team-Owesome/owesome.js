(function()
{
	var Renderer = function()
	{
		this.domElement = null;
	};

	Renderer.prototype.drawTexture = function(texture, textureRect, transformMatrix) {};
	Renderer.prototype.draw = function(drawable)
	{
		if (!(drawable instanceof ow.Drawable))
		{
			throw TypeError('drawable is not of type ow.Drawable.');
		}

		drawable.draw(this);
	};

	Renderer.prototype.commit = function() {};
	Renderer.prototype.clear = function() {};

	ow.Renderer = Renderer;
})();