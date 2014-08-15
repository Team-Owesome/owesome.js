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
                console.error('Image "' + imageOrSrc + ' " couldn\'t be loaded.');
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

    Texture.prototype._checkPowerOfTwo = function()
    {
        console.info('Texture #' + this._id + ' "' + this._internalImage.src + '" loaded...');

        var width = this._internalImage.width;
        var height = this._internalImage.height;

        if (!this._isPowerOfTwo(width) ||
            !this._isPowerOfTwo(height))
        {
            console.warn('Texture is not power of two, adding border, tiling will not be correct.');

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

    Texture.prototype._isPowerOfTwo = function(number)
    {
        return (number & (number - 1)) == 0;
    };

    Texture.prototype._nextHighestPowerOfTwo = function(number)
    {
        --number;

        for (var i = 1; i < 32; i <<= 1)
        {
            number = number | number >> i;
        }
        return number + 1;
    };

    Texture.prototype.getId = function()
    {
        return this._id;
    };

    Texture.prototype.getImage = function()
    {
        return this._internalImage;
    }

    Texture.CurrentId = 0;

    ow.Texture = Texture;
})();
