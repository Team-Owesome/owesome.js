ow.Vector = function(x, y)
{
	this.x = Number(x || 0);
	this.y = Number(y || (x || 0));
};

ow.Vector.prototype.toArray = function()
{
	return [this.x, this.y];
};

ow.Vector.prototype.toNativeArray = function()
{
	var array = new Float32Array(2);

	array[0] = this.x;
	array[1] = this.y;

	return array;
};

ow.Vector.prototype.clone = function()
{
	return new ow.Vector(this.x, this.y);
};

ow.Vector.prototype.add = function(vectorOrNumber, optionalY)
{
	if (vectorOrNumber instanceof ow.Vector)
	{
		this.x += vectorOrNumber.x;
		this.y += vectorOrNumber.y;
	}
	else
	{
		this.x += Number(vectorOrNumber);
		this.y += Number(optionalY || vectorOrNumber);
	}

	return this;
};

ow.Vector.prototype.addition = function(vectorOrNumber, optionalY)
{
	return this.clone().add(vectorOrNumber, optionalY);
};

ow.Vector.prototype.substract = function(vectorOrNumber, optionalY)
{
	if (vectorOrNumber instanceof ow.Vector)
	{
		this.x -= vectorOrNumber.x;
		this.y -= vectorOrNumber.y;
	}
	else
	{
		this.x -= Number(vectorOrNumber);
		this.y -= Number(optionalY || vectorOrNumber);
	}

	return this;
};

ow.Vector.prototype.substraction = function(vectorOrNumber, optionalY)
{
	return this.clone().substract(vectorOrNumber, optionalY);
};

ow.Vector.prototype.multiply = function(vectorOrNumber, optionalY)
{
	if (vectorOrNumber instanceof ow.Vector)
	{
		this.x *= vectorOrNumber.x;
		this.y *= vectorOrNumber.y;
	}
	else
	{
		this.x *= Number(vectorOrNumber);
		this.y *= Number(optionalY || vectorOrNumber);
	}

	return this;
};

ow.Vector.prototype.multiplication = function(vectorOrNumber, optionalY)
{
	return this.clone().multiplication(vectorOrNumber, optionalY);
};