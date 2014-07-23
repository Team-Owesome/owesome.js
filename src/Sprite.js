(function()
{
	var Sprite = function(texture, textureRect, position, rotation, scale, anchor)
	{
		this.texture     = texture     || null;
		this.position    = position    || new ow.Vector();
		this.scale       = scale       || new ow.Vector(1);
		this.rotation    = rotation    || 0;
		this.textureRect = textureRect || new ow.Rectangle();
		this.anchor      = anchor      || new ow.Vector(0.5);
		this.children    = [];

		this._matrix = new ow.Matrix();
	};

	Sprite.prototype = Object.create(ow.Drawable.prototype);
	Sprite.prototype.constructor = Sprite;

	Sprite.prototype.copy = function()
	{
		return new ow.Sprite(this.texture,
							 this.position,
							 this.scale,
							 this.rotation,
							 this.textureRect);
	};

	Sprite.prototype.draw = function(renderer)
	{
		renderer.drawTexture(this.texture, this.textureRect, this.getMatrix());

		var i = 0;

		for (i = 0; i < this.children.length; ++i)
		{
			var child = this.children[i];
			child.draw(renderer);
		}
	};

	Sprite.prototype.addChild = function(sprite)
	{
		sprite.parent = this;
		this.children.push(sprite);
	};

	Sprite.prototype.getMatrix = function()
	{
		var matrix = this.parent ? this.parent.getMatrix() : this._matrix;

		if (!this.parent)
		{
			matrix.identity();
		}

		matrix.translate(this.position.x, this.position.y);
		
		if (this.rotation != 0) matrix.rotate(this.rotation * (Math.PI / 180));
		if (this.scale.x != 1 || this.scale.y != 1) matrix.scale(this.scale.x, this.scale.y);

		matrix.translate(-(this.textureRect.width * this.anchor.x),
						 -(this.textureRect.height * this.anchor.y));

		return matrix
	};

	Sprite.prototype.getMatrix2 = function()
	{
		var matrix = this.parent ? this.parent.getMatrix() : this._matrix;

		if (!this.parent)
		{
			matrix.identity();
		}

		matrix.translate(this.position.x, this.position.y);
		
		if (this.rotation != 0) matrix.rotate(this.rotation * (Math.PI / 180));
		if (this.scale.x != 1 || this.scale.y != 1) matrix.scale(this.scale.x, this.scale.y);

		return matrix
	};

	ow.Sprite = Sprite;
})();

