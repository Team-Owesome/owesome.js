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
		this.updateMatrix();

		renderer.drawTexture(this.texture, this.textureRect, this._matrix);

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

	Sprite.prototype.removeChild = function(sprite)
	{
		var index = this.children.indexOf(sprite);

		if (index != -1)
		{
			this.children.splice(index, 1);
		}
	};

	Sprite.prototype.updateMatrix = function()
	{
		var parent = this.parent;
		var matrix = this._matrix;

		matrix.identity();

		if (parent)
		{
			var parentTextureRect = parent.textureRect;
			var parentAnchor = parent.anchor;

			matrix.translate((parentTextureRect.width * parentAnchor.x),
							 (parentTextureRect.height * parentAnchor.y));
		}
		
		matrix.translate(this.position.x, this.position.y);
		
		if (this.scale.x != 1 || this.scale.y != 1) matrix.scale(this.scale.x, this.scale.y);
		if (this.rotation != 0) matrix.rotate(this.rotation * (Math.PI / 180));

		matrix.translate(-(this.textureRect.width * this.anchor.x),
						 -(this.textureRect.height * this.anchor.y));

		if (parent)
		{
			var parentMatrix = this.parent.getCachedMatrix();
			this._matrix = parentMatrix.multiplication(matrix);
		}
	};

	Sprite.prototype.getCachedMatrix = function()
	{
		return this._matrix;
	};

	ow.Sprite = Sprite;
})();

