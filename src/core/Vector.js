// The MIT License (MIT)
// 
// Copyright (c) 2014 Team Owesome (http://owesome.ch)
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 * @constructor
 */
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

// @if VECTOR_MATH

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

// @endif

ow.Vector = Vector;