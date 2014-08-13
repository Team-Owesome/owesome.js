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

    Renderer.prototype.render = function(scene)
    {
        // @if DEBUG

        if (!(scene instanceof ow.Scene))
        {
            throw TypeError('scene is not of type ow.Scene.');
        }

        // @endif
    };

    Renderer.prototype.flush = function() {};
    Renderer.prototype.clear = function() {};

    ow.Renderer = Renderer;
})();