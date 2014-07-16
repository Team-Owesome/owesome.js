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