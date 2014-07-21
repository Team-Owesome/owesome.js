(function()
{
	var Texture = function(imageOrSrc)
	{
		this._id = Texture.CurrentId++;

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

	Texture.prototype.getId = function()
	{
		return this._id;
	};

	Texture.prototype.getImage = function()
	{
		return this._internalImage;
	}


	Object.defineProperty(Texture.prototype, 'width',
	{
		get: function()
		{
			return this._internalImage.width;
		}
	});

	Object.defineProperty(Texture.prototype, 'height',
	{
		get: function()
		{
			return this._internalImage.height;
		}
	})

	Texture.CurrentId = 0;

	ow.Texture = Texture;
})();
