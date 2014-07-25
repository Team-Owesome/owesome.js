(function()
{
    var Stage = function()
    {

    };

    Stage.prototype = Object.create(ow.Drawable.prototype);
    Stage.prototype.constructor = Stage;

    ow.Stage = Stage;
})();
