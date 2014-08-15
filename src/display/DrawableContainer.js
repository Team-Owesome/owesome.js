(function()
{
    var DrawableContainer = function()
    {
        ow.Drawable.call(this);

        this.children = [];
        this.matrix   = new ow.Matrix();
    };

    DrawableContainer.prototype = Object.create(ow.Drawable.prototype);
    DrawableContainer.prototype.constructor = DrawableContainer;

    DrawableContainer.prototype.copy = function()
    {
        // @if DEBUG

        throw new Error('Copy is not implemented on ow.DrawableContainer.');

        // @endif
    };

    DrawableContainer.prototype.add = function(drawable)
    {
        // @if DEBUG

        if (!(drawable instanceof ow.Drawable))
        {
            throw new Error('drawable has to be instance of ow.Drawable');
        }

        // @endif

        if (drawable.parent)
        {
            drawable.parent.remove(drawable);
        }

        drawable.parent = this;
        this.children.push(drawable);
    };

    DrawableContainer.prototype.insert = function(drawable, index)
    {
        // @if DEBUG

        if (!(drawable instanceof ow.Drawable))
        {
            throw new Error('drawable has to be instance of ow.Drawable');
        }

        if (index > this.children.length)
        {
            throw new RangeError('Index is out of range.');
        }

        // @endif

        if (drawable.parent)
        {
            drawable.parent.remove(drawable);
        }

        drawable.parent = this;
        this.children.splice(index, 0, drawable);
    };

    DrawableContainer.prototype.remove = function(drawable)
    {
        // @if DEBUG

        if (!(drawable instanceof ow.Drawable))
        {
            throw new Error('drawable has to be instance of ow.Drawable');
        }

        // @endif

        var index = this.children.indexOf(drawable);

        if (index !== -1)
        {
            drawable.parent = null;
            this.children.splice(index, 1);
        }
        // @if DEBUG

        else
        {
            throw new Error('drawable has to be a child of this ow.DrawableContainer.');
        }

        // @endif
    };

    ow.DrawableContainer = DrawableContainer;
})();


