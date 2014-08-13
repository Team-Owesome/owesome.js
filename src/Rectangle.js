(function()
{
    var Rectangle = function(x, y, width, height)
    {
        this.x      = (x !== undefined) ? Number(x) : 0;
        this.y      = (y !== undefined) ? Number(y) : 0;
        
        this.width  = (width !== undefined) ? Number(width) : 0;
        this.height = (height !== undefined) ? Number(height) : 0;
    };

    Rectangle.prototype.copy = function()
    {
        return new Rectangle(this.x, this.y, this.width, this.height);
    };

    ow.Rectangle = Rectangle;
})();
