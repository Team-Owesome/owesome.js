(function()
{
    var Scene = function()
    {

    };

    Scene.prototype = Object.create(ow.Drawable.prototype);
    Scene.prototype.constructor = Scene;

    ow.Scene = Scene;
})();
