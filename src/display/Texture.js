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
                console.info('Texture #' + self._id + ' "' + self._internalImage.src + '" loaded...');

                var width = self._internalImage.width;
                var height = self._internalImage.height;

                if (!self._isPowerOfTwo(width) ||
                    !self._isPowerOfTwo(height))
                {
                    console.warn('Texture is not power of two, adding border, tiling will not be correct.');

                    var canvas = document.createElement("canvas");

                    canvas.width = self._nextHighestPowerOfTwo(width);
                    canvas.height = self._nextHighestPowerOfTwo(height);

                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(self._internalImage, 0, 0, width, height);

                    self._internalImage = canvas;

                    width = canvas.width;
                    height = canvas.height;
                }

                self.width = width;
                self.height = height;

                self.loaded = true;

                if (loadedCallback) loadedCallback();
            });
        }
        else
        {
            this.width = this._internalImage.width;
            this.height = this._internalImage.height;
        }
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
