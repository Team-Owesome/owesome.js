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
    var Texture = function(imageOrSrc, loadedCallback, errorCallback)
    {
        this._id = Texture.CurrentId++;

        this.width = 0;
        this.height = 0;

        if (typeof imageOrSrc === 'string')
        {
            this._internalImage = new Image();
            this._internalImage.src = imageOrSrc;
        }
        else if (imageOrSrc instanceof Image)
        {
            this._internalImage = imageOrSrc;
        }
        else
        {
            throw new TypeError('Expected Image or String!');
        }

        this.loaded = this._internalImage.complete;

        var self = this;

        if (!this.loaded)
        {
            this._internalImage.addEventListener('error', function()
            {
                // @if DEBUG

                console.error('Image "' + imageOrSrc + ' " couldn\'t be loaded.');

                // @endif

                if (errorCallback) errorCallback();
            });

            this._internalImage.addEventListener('load', function()
            {
                self._checkPowerOfTwo();
                self.loaded = true;

                if (loadedCallback) loadedCallback();
            });
        }
        else
        {
            this._checkPowerOfTwo();
        }
    };

    var proto = Texture.prototype;

    proto._checkPowerOfTwo = function()
    {
        // @if DEBUG

        console.info('Texture #' + this._id + ' "' + this._internalImage.src + '" loaded...');

        // @endif

        var width = this._internalImage.width;
        var height = this._internalImage.height;

        if (!this._isPowerOfTwo(width) ||
            !this._isPowerOfTwo(height))
        {
            // @if DEBUG

            console.warn('Texture is not power of two, adding border, tiling will not be correct.');

            // @endif

            var canvas = document.createElement("canvas");

            canvas.width = this._nextHighestPowerOfTwo(width);
            canvas.height = this._nextHighestPowerOfTwo(height);

            var ctx = canvas.getContext("2d");
            ctx.drawImage(this._internalImage, 0, 0, width, height);

            this._internalImage = canvas;

            width = canvas.width;
            height = canvas.height;
        }

        this.width = width;
        this.height = height;
    };

    proto._isPowerOfTwo = function(number)
    {
        return (number & (number - 1)) == 0;
    };

    proto._nextHighestPowerOfTwo = function(number)
    {
        --number;

        for (var i = 1; i < 32; i <<= 1)
        {
            number = number | number >> i;
        }
        return number + 1;
    };

    proto.getId = function()
    {
        return this._id;
    };

    proto.getImage = function()
    {
        return this._internalImage;
    }

    Texture.CurrentId = 0;

    ow.Texture = Texture;
})();
