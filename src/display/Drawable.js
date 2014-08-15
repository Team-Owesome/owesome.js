(function()
{
    var Drawable = function()
    {
        this.parent = null;
    };

    Drawable.prototype.draw = function(renderer) {};
    Drawable.prototype.copy = function()
    { 
        // @if DEBUG
        
        throw new Error('Copy is not implemented on ow.Drawable.');

        // @endif
    };

    ow.Drawable = Drawable;
})();
