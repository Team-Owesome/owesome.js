(function()
{
    var Sprite = function(texture, textureRect, position, rotation, scale, anchor, alpha, color)
    {
        this.texture     = texture     || null;

        this.position    = position    || new ow.Vector();
        this.scale       = scale       || new ow.Vector(1);
        this.rotation    = rotation    || 0;
        this.anchor      = anchor      || new ow.Vector(0.5);

        this.textureRect = textureRect || new ow.Rectangle();
        this.alpha       = alpha       || 1.0;
        this.color       = color       || 0xFFFFFF;

        this.children    = [];

        this._matrix = new ow.Matrix();

        this._sr = Math.sin(this.rotation);
        this._cr = Math.cos(this.rotation);

        this._cachedRotation = this.rotation;
    };

    Sprite.prototype = Object.create(ow.Drawable.prototype);
    Sprite.prototype.constructor = Sprite;

    Sprite.prototype.copy = function()
    {
        return new ow.Sprite(this.texture,
                             this.position,
                             this.scale,
                             this.rotation,
                             this.textureRect);
    };

    Sprite.prototype.draw = function(renderer)
    {
        this.updateMatrix();

        renderer.drawTexture(this.texture,
                             this.textureRect,
                             this._matrix,
                             this.alpha,
                             this.color);

        for (var i = 0; i < this.children.length; ++i)
        {
            var child = this.children[i];
            child.draw(renderer);
        }
    };

    Sprite.prototype.addChild = function(sprite)
    {
        sprite.parent = this;
        this.children.push(sprite);
    };

    Sprite.prototype.removeChild = function(sprite)
    {
        var index = this.children.indexOf(sprite);

        if (index != -1)
        {
            this.children.splice(index, 1);
        }
    };

    Sprite.prototype.updateMatrix = function()
    {
        // Inspired by Pixi.js
        var parent = this.parent;
        var matrix = this._matrix;

        var parentMatrix = null;

        var pax = 0;
        var pay = 0;

        if (parent)
        {
            parentMatrix = parent.getCachedMatrix();

            pax = -parent.textureRect.width * parent.anchor.x;
            pay = -parent.textureRect.height * parent.anchor.y;
        }
        else
        {
            parentMatrix = { a: 1, b: 0, tx: 0,
                             c: 0, d: 1, ty: 0 };
        }

        var ax = (this.textureRect.width * this.anchor.x);
        var ay = (this.textureRect.height * this.anchor.y);

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

        var a02 = this.position.x - a00 * ax - ay * a01 - pax,
            a12 = this.position.y - a11 * ay - ax * a10 - pay;

        var b00 = parentMatrix.a,
            b01 = parentMatrix.b,
            b10 = parentMatrix.c,
            b11 = parentMatrix.d;

        matrix.a = b00 * a00 + b01 * a10;
        matrix.b = b00 * a01 + b01 * a11;
        matrix.tx = b00 * a02 + b01 * a12 + parentMatrix.tx;

        matrix.c = b10 * a00 + b11 * a10;
        matrix.d = b10 * a01 + b11 * a11;
        matrix.ty = b10 * a02 + b11 * a12 + parentMatrix.ty;
    };

    Sprite.prototype.getCachedMatrix = function()
    {
        return this._matrix;
    };

    ow.Sprite = Sprite;
})();

