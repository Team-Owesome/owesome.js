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

(function()
{
    var Scene = function(position, scale, rotation, anchor)
    {
        ow.DrawableContainer.call(this);

        this.position    = position    || new ow.Vector();
        this.scale       = scale       || new ow.Vector(1);
        this.rotation    = rotation    || 0;
        this.anchor      = anchor      || new ow.Vector(0.5);

        this.width = 0;
        this.height = 0;

        this._sr = Math.sin(this.rotation);
        this._cr = Math.cos(this.rotation);

        this._cachedRotation = this.rotation;
    };

    Scene.prototype = Object.create(ow.DrawableContainer.prototype);
    Scene.prototype.constructor = Scene;

    Scene.prototype.copy = function()
    {
        // @if DEBUG

        throw new Error('Copy is not implemented on ow.Scene.');

        // @endif
    };

    Scene.prototype.draw = function(renderer)
    {   
        this.width = renderer.width;
        this.height = renderer.height;

        this.updateMatrix();

        for (var i = 0; i < this.children.length; ++i)
        {
            var child = this.children[i];
            child.draw(renderer);
        }
    };

    Scene.prototype.updateMatrix = function()
    {
        var matrix = this.matrix;

        var ax = (this.width * this.anchor.x);
        var ay = (this.height * this.anchor.y);

        if (this._cachedRotation != this.rotation)
        {
            this._sr = Math.sin(this.rotation);
            this._cr = Math.cos(this.rotation);

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

        var a02 = this.position.x - a00 * ax - ay * a01,
            a12 = this.position.y - a11 * ay - ax * a10;

        matrix.a = a00;
        matrix.b = a01;
        matrix.tx = a02 + (this.width * this.anchor.x);
        
        matrix.c = a10;
        matrix.d = a11;
        matrix.ty = a12 + (this.height * this.anchor.y);
    };

    ow.Scene = Scene;
})();
