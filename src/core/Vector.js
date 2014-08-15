(function()
{
    var Vector = function(x, y)
    {
        this.x = (x !== undefined) ? Number(x) : 0;
        this.y = (y !== undefined) ? Number(y) : this.x;
    };

    Vector.prototype.toArray = function()
    {
        return [this.x, this.y];
    };

    Vector.prototype.toNativeArray = function()
    {
        return new Float32Array(this.toArray());
    };

    Vector.prototype.copy = function()
    {
        return new Vector(this.x, this.y);
    };

    Vector.prototype.set = function(x, y)
    {
        this.x = x;
        this.y = y !== undefined ? y : x;
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

        this.x = (matrix.a * x) + (matrix.b * y) + matrix.tx;
        this.y = (matrix.c * x) + (matrix.d * y) + matrix.ty;
    };

    ow.Vector = Vector;

})();