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
		this._matrix.identity();
		this._matrix.translate(this.position.x, this.position.y);
		
		if (this.rotation != 0) this._matrix.rotate(this.rotation * (Math.PI / 180));
		if (this.scale.x != 1 || this.scale.y != 1) this._matrix.scale(this.scale.x, this.scale.y);

		this._matrix.translate(-(this.textureRect.width * this.anchor.x),
						       -(this.textureRect.height * this.anchor.y));

		renderer.drawTexture(this.texture, this.textureRect, this._matrix);
	};

	ow.Sprite = Sprite;
})();

