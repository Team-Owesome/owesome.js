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
var DrawableContainer = function()
{
    ow.Drawable.call(this);

    this.children = [];
    this.matrix   = new Matrix();
};

DrawableContainer.prototype = Object.create(ow.Drawable.prototype);
DrawableContainer.prototype.constructor = DrawableContainer;

Drawable.prototype['copy'] = DrawableContainer.prototype.copy = function()
{
    // @if DEBUG

    throw new Error('Copy is not implemented on ow.DrawableContainer.');

    // @endif
};

Drawable.prototype['add'] = DrawableContainer.prototype.add = function(drawable)
{
    // @if DEBUG

    if (!(drawable instanceof Drawable))
    {
        throw new Error('drawable has to be instance of ow.Drawable');
    }

    // @endif

    if (drawable.parent)
    {
        drawable.parent.remove(drawable);
    }

    drawable.parent = this;
    this.children.push(drawable);
};

Drawable.prototype['insert'] = DrawableContainer.prototype.insert = function(drawable, index)
{
    // @if DEBUG

    if (!(drawable instanceof Drawable))
    {
        throw new Error('drawable has to be instance of ow.Drawable');
    }

    if (index > this.children.length)
    {
        throw new RangeError('Index is out of range.');
    }

    // @endif

    if (drawable.parent)
    {
        drawable.parent.remove(drawable);
    }

    drawable.parent = this;
    this.children.splice(index, 0, drawable);
};

Drawable.prototype['remove'] = DrawableContainer.prototype.remove = function(drawable)
{
    // @if DEBUG

    if (!(drawable instanceof Drawable))
    {
        throw new Error('drawable has to be instance of ow.Drawable');
    }

    // @endif

    var index = this.children.indexOf(drawable);

    if (index !== -1)
    {
        drawable.parent = null;
        this.children.splice(index, 1);
    }
    // @if DEBUG

    else
    {
        throw new Error('drawable has to be a child of this ow.DrawableContainer.');
    }

    // @endif
};

ow.DrawableContainer = DrawableContainer;