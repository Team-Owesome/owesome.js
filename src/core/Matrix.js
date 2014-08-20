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
var Matrix = function(a, b, tx, c, d, ty)
{
    this.a = a != undefined ? Number(a) : 1;
    this.b = b != undefined ? Number(b) : 0;
    this.c = c != undefined ? Number(c) : 0;
    this.d = d != undefined ? Number(d) : 1;
    this.tx = tx != undefined ? Number(tx) : 0;
    this.ty = ty != undefined ? Number(ty) : 0;
};

Matrix.prototype.toArray = function()
{
    var ar = this.array;

    return [this.a, this.b, this.tx,
            this.c, this.d, this.ty,
            0,      0,      1];
};

Matrix.prototype.toNativeArray = function()
{
    return new Float32Array(this.toArray());
};

Matrix.prototype.copy = function()
{
    return new Matrix(this.a, this.b, this.tx,
                      this.c, this.d, this.ty);
};

// @if MATRIX_MATH

Matrix.prototype.translate = function(x, y)
{
    return this.multiplyBy(1, 0, x,
                           0, 1, y);
};

Matrix.prototype.translation = function(x, y)
{
    return this.copy().translate(x, y);
};

Matrix.prototype.rotate = function(angle)
{
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    return this.multiplyBy(c, -s,  0,
                           s,  c,  0);
};

Matrix.prototype.scale = function(scaleX, scaleY)
{
    return this.multiplyBy(scaleX, 0,      0,
                           0,      scaleY, 0);
};

Matrix.prototype.identity = function()
{
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;

    this.tx = 0;
    this.ty = 0;

    return this;
};

Matrix.prototype.multiplyBy = function(a, b, tx, c, d, ty)
{
    var ta = this.a; var tb = this.b; var ttx = this.tx;
    var tc = this.c; var td = this.d; var tty = this.ty;

    this.a  = (ta * a) + (tb * c) /* + (ttx * 0) */;
    this.b  = (ta * b) + (tb * d) /* + (ttx * 0) */;
    this.tx = (ta * tx) + (tb * ty) + ttx;

    this.c  = (tc * a) + (td * c) /* + (tty * 0) */;
    this.d  = (tc * b) + (td * d) /* + (tty * 0) */;
    this.ty = (tc * tx) + (td * ty) + tty;

    return this;
}

Matrix.prototype.multiply = function(matrix)
{
    return this.multiplyBy(matrix.a, matrix.b, matrix.tx, matrix.c, matrix.d, matrix.ty);
};

Matrix.prototype.multiplication = function(matrix)
{
    return this.copy().multiply(matrix);
};

Matrix.Identity = function()
{
    return new Matrix();
};

Matrix.Translation = function(x, y)
{
    return new Matrix(1, 0, x,
                      0, 1, y);
};

Matrix.Rotation = function(angle)
{
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    return new Matrix(c, -s,  0,
                      s,  c,  0)
};

Matrix.Scale = function(scaleX, scaleY)
{
    return new Matrix(scaleX, 0,      0,
                      0,      scaleY, 0)
};

// @endif

ow.Matrix = Matrix;