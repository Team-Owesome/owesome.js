ow.Sprite = function(texture, position, scale, rotation, textureRect)
{
	this.texture     = texture     || null;
	this.position    = position    || new ow.Vector();
	this.scale       = scale       || new ow.Vector();
	this.rotation    = rotation    || 0;
	this.textureRect = textureRect || new ow.Rectangle();
};

Sprite.prototype.copy = function()
{
	return new ow.Sprite(this.texture,
						 this.position,
						 this.scale,
						 this.rotation,
						 this.textureRect);
};