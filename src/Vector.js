(function()
{
	var Vector = function(x, y)
	{
		this.x = Number(x || 0);
		this.y = Number(y != undefined ? y : (x || 0));
	};

	Vector.prototype.toArray = function()
	{
		return [this.x, this.y];
	};

	Vector.prototype.toNativeArray = function()
	{
		var array = new Float32Array(2);

		array[0] = this.x;
		array[1] = this.y;

		return array;
	};

	Vector.prototype.copy = function()
	{
		return new Vector(this.x, this.y);
	};

	Vector.prototype.add = function(vectorOrNumber, optionalY)
	{
		if (vectorOrNumber instanceof Vector)
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

	Vector.prototype.addition = function(vectorOrNumber, optionalY)
	{
		return this.clone().add(vectorOrNumber, optionalY);
	};

	Vector.prototype.substract = function(vectorOrNumber, optionalY)
	{
		if (vectorOrNumber instanceof Vector)
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

	Vector.prototype.substraction = function(vectorOrNumber, optionalY)
	{
		return this.clone().substract(vectorOrNumber, optionalY);
	};

	Vector.prototype.multiply = function(vectorOrNumber, optionalY)
	{
		if (vectorOrNumber instanceof Vector)
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

	Vector.prototype.multiplication = function(vectorOrNumber, optionalY)
	{
		return this.clone().multiplication(vectorOrNumber, optionalY);
	};

	Vector.prototype.applyMatrix = function(matrix)
	{
		var x = this.x;
		var y = this.y;

		var a = matrix.a;
		var b = matrix.b;
		var c = matrix.c;
		var d = matrix.d;

		var tx = matrix.tx;
		var ty = matrix.ty;

		this.x = (a * x) + (b * y) + tx;
		this.y = (c * x) + (d * y) + ty;
	};

	ow.Vector = Vector;
})();