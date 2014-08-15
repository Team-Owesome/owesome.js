(function()
{
    var Scene = function(position, scale, rotation, anchor)
    {
        ow.DrawableContainer.call(this);

        this.position    = position    || new ow.Vector();
        this.scale       = scale       || new ow.Vector(1);
        this.rotation    = rotation    || 0;
        this.anchor      = anchor      || new ow.Vector(0.5);

        this._sr = Math.sin(this.rotation);
        this._cr = Math.cos(this.rotation);

        this._cachedRotation = this.rotation;
    };

    Scene.prototype = Object.create(ow.DrawableContainer.prototype);
    Scene.prototype.constructor = Scene;

    Scene.prototype.copy = function()
    {
        // @if DEBUG

        throw new Error('Copy is not implemented on ow.Scene.');

        // @endif
    };

    Scene.prototype.draw = function(renderer)
    {   
        this.width = renderer.width;
        this.height = renderer.height;

        this.updateMatrix();

        for (var i = 0; i < this.children.length; ++i)
        {
            var child = this.children[i];
            child.draw(renderer);
        }
    };

    Scene.prototype.updateMatrix = function()
    {
        var matrix = this.matrix;

        var ax = (this.width * this.anchor.x);
        var ay = (this.height * this.anchor.y);

        if (this._cachedRotation != this.rotation)
        {
            this._sr = Math.sin(this.rotation);
            this._cr = Math.cos(this.rotation);

            this._cachedRotation = this.rotation;
        }

        var sr = this._sr;
        var cr = this._cr;

        var sx = this.scale.x;
        var sy = this.scale.y;

        var a00 = cr * sx,
            a01 = -sr * sy,
            a10 = sr * sx,
            a11 = cr * sy;

        var a02 = this.position.x - a00 * ax - ay * a01,
            a12 = this.position.y - a11 * ay - ax * a10;

        matrix.a = a00;
        matrix.b = a01;
        matrix.tx = a02 + (this.width * this.anchor.x);
        
        matrix.c = a10;
        matrix.d = a11;
        matrix.ty = a12 + (this.height * this.anchor.y);
    };

    ow.Scene = Scene;
})();
