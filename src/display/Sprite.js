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

var Sprite = function(texture, textureRect, position, rotation, scale, anchor, alpha, color)
{
    ow.DrawableContainer.call(this);

    this.texture     = texture     || null;

    this.position    = position    || new Vector();
    this.scale       = scale       || new Vector(1);
    this.rotation    = rotation    || 0;
    this.anchor      = anchor      || new Vector(0.5);

    this.textureRect = textureRect || new Rectangle();
    this.alpha       = alpha       || 1.0;
    this.color       = color       || 0xFFFFFF;

    var radRotation = this.rotation * (Math.PI / 180.0);

    this._sr = Math.sin(radRotation);
    this._cr = Math.cos(radRotation);

    this._cachedRotation = this.rotation;
};

var proto = Sprite.prototype = Object.create(DrawableContainer.prototype);
proto.constructor = Sprite;

proto.copy = function()
{
    var copy = new ow.Sprite(this.texture,
                             this.textureRect.copy(),
                             this.position.copy(),
                             this.rotation,
                             this.scale.copy(),
                             this.anchor.copy(),
                             this.alpha,
                             this.color);

    for (var i = 0; i < this.children.length; ++i)
    {
        var child = this.children[i];
        var childCopy = child.copy();

        copy.add(childCopy);
    }

    return copy;
};

proto.draw = function(renderer)
{
    this.updateMatrix();

    if (this.texture)
    {
        renderer.drawTexture(this.texture,
                             this.textureRect,
                             this.matrix,
                             this.alpha,
                             this.color);
    }
    
    for (var i = 0; i < this.children.length; ++i)
    {
        var child = this.children[i];
        child.draw(renderer);
    }
};

proto.updateMatrix = function()
{
    // Inspired by Pixi.js
    var parent = this.parent;
    var matrix = this.matrix;

    var parentMatrix = null;

    var pax = 0;
    var pay = 0;

    if (parent)
    {
        parentMatrix = parent.matrix;

        if (parent instanceof Sprite)
        {
            pax = -parent.textureRect.width * parent.anchor.x;
            pay = -parent.textureRect.height * parent.anchor.y;
        }
        else if (parent instanceof Scene)
        {
            pax = -parent.width * parent.anchor.x;
            pay = -parent.height * parent.anchor.y;
        }
    }
    else
    {
        parentMatrix = { a: 1, b: 0, tx: 0,
                         c: 0, d: 1, ty: 0 };
    }

    var ax = (this.textureRect.width * this.anchor.x);
    var ay = (this.textureRect.height * this.anchor.y);

    if (this._cachedRotation != this.rotation)
    {
        var radRotation = this.rotation * (Math.PI / 180.0);

        this._sr = Math.sin(radRotation);
        this._cr = Math.cos(radRotation);

        this._cachedRotation = this.rotation;
    }

    var sr = this._sr;
    var cr = this._cr;

    var sx = this.scale.x;
    var sy = this.scale.y;

    var a00 = cr * sx,
        a01 = -sr * sy,
        a10 = sr * sx,
        a11 = cr * sy;

    var a02 = this.position.x - a00 * ax - ay * a01 - pax,
        a12 = this.position.y - a11 * ay - ax * a10 - pay;

    var b00 = parentMatrix.a,
        b01 = parentMatrix.b,
        b10 = parentMatrix.c,
        b11 = parentMatrix.d;

    matrix.a = b00 * a00 + b01 * a10;
    matrix.b = b00 * a01 + b01 * a11;
    matrix.tx = b00 * a02 + b01 * a12 + parentMatrix.tx;

    matrix.c = b10 * a00 + b11 * a10;
    matrix.d = b10 * a01 + b11 * a11;
    matrix.ty = b10 * a02 + b11 * a12 + parentMatrix.ty;
};

ow.Sprite = Sprite;