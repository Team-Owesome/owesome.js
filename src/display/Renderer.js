(function()
{
    var Renderer = function() {};

    Renderer.prototype.render = function(scene)
    {
        // @if DEBUG

        if (!(scene instanceof ow.Scene))
        {
            throw new TypeError('scene is not of type ow.Scene.');
        }

        // @endif
    };

    Renderer.prototype.clear = function() {};
    Renderer.prototype.drawTexture = function(texture, textureRect, transformMatrix) {};

    ow.Renderer = Renderer;
})();