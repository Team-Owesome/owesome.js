(function()
{
    var Renderer = function()
    {
        this.domElement = null;
    };

    Renderer.prototype.drawTexture = function(texture, textureRect, transformMatrix) {};
    Renderer.prototype.draw = function(drawable)
    {
        // @if DEBUG

        if (!(drawable instanceof ow.Drawable))
        {
            throw TypeError('drawable is not of type ow.Drawable.');
        }

        // @endif

        drawable.draw(this);
    };

    Renderer.prototype.render = function() {};
    Renderer.prototype.clear = function() {};

    ow.Renderer = Renderer;
})();