(function()
{
	var Texture = function(imageOrSrc)
	{
		this._id = Texture.CurrentId++;

		this._width = 0;
		this._heigth = 0;

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

				self._width = self._internalImage.width;
				self._height = self._internalImage.height;

				self.loaded = true;
			});
		}
		else
		{
			this._width = this._internalImage.width;
			this._height = this._internalImage.height;
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


	/*Object.defineProperty(Texture.prototype, 'width',
	{
		get: function()
		{
			return this._width;
		}
	});

	Object.defineProperty(Texture.prototype, 'height',
	{
		get: function()
		{
			return this._height;
		}
	})*/

	Texture.CurrentId = 0;

	ow.Texture = Texture;
})();
