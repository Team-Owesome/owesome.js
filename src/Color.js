(function()
{

    var Color = function(r, g, b, a)
    {
        if (r !== undefined) this.r = Number(r);
        if (g !== undefined) this.g = Number(g);
        if (b !== undefined) this.b = Number(b);
        if (a !== undefined) this.a = Number(a);  
    };

    Color.prototype.r = 1.0;
    Color.prototype.g = 1.0;
    Color.prototype.b = 1.0;
    Color.prototype.a = 1.0;

    ow.Color = Color;

})();