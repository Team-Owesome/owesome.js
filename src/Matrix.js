(function()
{
	var Matrix = function(array)
	{
		this.array = [];

		if (array)
		{
			this.array = array;
		}
		else
		{
			this.array = [1, 0, 0,
					      0, 1, 0,
					      0, 0, 1];
		}
	};

	Matrix.prototype.toArray = function()
	{
		var ar = this.array;

		return [ar[0], ar[1], ar[2],
				ar[3], ar[4], ar[5],
				ar[6], ar[7], ar[8]];
	};

	Matrix.prototype.toNativeArray = function()
	{
		return new Float32Array(this.array);
	};

	Matrix.prototype.copy = function()
	{
		return new Matrix(this.array);
	};

	Matrix.prototype.translate = function(x, y)
	{
		return this.multiplyByMatrixArray([1, 0, x,
			  						       0, 1, y,
			  						       0, 0, 1]);
	};

	Matrix.prototype.translation = function(x, y)
	{
		return this.copy().translate(x, y);
	};

	Matrix.prototype.rotate = function(angle)
	{
		var c = Math.cos(angle);
		var s = Math.sin(angle);

		return this.multiplyByMatrixArray([c, -s,  0,
						                   s,  c,  0,
						                   0,  0,  1]);
	};

	Matrix.prototype.scale = function(scaleX, scaleY)
	{
		return this.multiplyByMatrixArray([scaleX, 0,      0,
						                   0,      scaleY, 0,
						                   0,      0,      1]);
	};

	Matrix.prototype.identity = function()
	{
		this.array = [1, 0, 0,
					  0, 1, 0,
					  0, 0, 1];

		return this;
	};

	Matrix.prototype.multiplyByMatrixArray = function(array)
	{
		var aa = this.array;
		var ba = array;

		var ta = this.array;

		var a11 = aa[0]; var a12 = aa[1]; var a13 = aa[2];
		var a21 = aa[3]; var a22 = aa[4]; var a23 = aa[5];
		var a31 = aa[6]; var a32 = aa[7]; var a33 = aa[8];

		var b11 = ba[0]; var b12 = ba[1]; var b13 = ba[2];
		var b21 = ba[3]; var b22 = ba[4]; var b23 = ba[5];
		var b31 = ba[6]; var b32 = ba[7]; var b33 = ba[8];

		ta[0] = (a11 * b11) + (a12 * b21) + (a13 * b31);
		ta[1] = (a11 * b12) + (a12 * b22) + (a13 * b32);
		ta[2] = (a11 * b13) + (a12 * b23) + (a13 * b33);

		ta[3] = (a21 * b11) + (a22 * b21) + (a23 * b31);
		ta[4] = (a21 * b12) + (a22 * b22) + (a23 * b32);
		ta[5] = (a21 * b13) + (a22 * b23) + (a23 * b33);

		ta[6] = (a31 * b11) + (a32 * b21) + (a33 * b31);
		ta[7] = (a31 * b12) + (a32 * b22) + (a33 * b32);
		ta[8] = (a31 * b13) + (a32 * b23) + (a33 * b33);

		return this;
	};

	Matrix.prototype.multiply = function(matrix)
	{
		return this.multiplyByArray(matrix.array);
	};

	Matrix.Identity = function()
	{
		return new Matrix();
	};

	Matrix.Translation = function(x, y)
	{
		return new Matrix([1, 0, x,
						   0, 1, y,
						   0, 0, 1]);
	};

	Matrix.Rotation = function(angle)
	{
		var c = Math.cos(angle);
		var s = Math.sin(angle);

		return new Matrix([c, -s,  0,
						   s,  c,  0,
						   0,  0,  1])
	};

	Matrix.Scale = function(scaleX, scaleY)
	{
		return new Matrix([scaleX, 0,      0,
						   0,      scaleY, 0,
						   0,      0,      1])
	};

	ow.Matrix = Matrix;
})();