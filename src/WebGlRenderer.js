(function()
{
	var WebGlRenderer = function()
	{
		this.domElement = document.createElement('canvas');
		this.context = this.domElement.getContext('2d');

		this.topLeft = new ow.Vector();
		this.topRight = new ow.Vector();
		this.bottomRight = new ow.Vector();
		this.bottomLeft = new ow.Vector();
	};

	WebGlRenderer.prototype = Object.create(ow.Renderer.prototype);
	WebGlRenderer.prototype.constructor = WebGlRenderer;

	WebGlRenderer.prototype.drawTexture = function(texture, textureRect, transformMatrix)
	{
		this.topLeft.x = 0;
		this.topLeft.y = 0;

		this.topRight.x = textureRect.width;
		this.topRight.y = 0;

		this.bottomRight.x = textureRect.width;
		this.bottomRight.y = textureRect.height;

		this.bottomLeft.x = 0;
		this.bottomLeft.y = textureRect.height;

		this.topLeft.applyMatrix(transformMatrix);
		this.topRight.applyMatrix(transformMatrix);
		this.bottomRight.applyMatrix(transformMatrix);
		this.bottomLeft.applyMatrix(transformMatrix);

		/*this.context.save();

		//draw a circle
		this.context.beginPath();
		this.context.arc(0, 0, 3, 0, Math.PI*2, true); 
		this.context.closePath();
		this.context.fill();

		this.context.beginPath();

		this.context.moveTo(this.topLeft.x, this.topLeft.y);
		this.context.lineTo(this.topRight.x, this.topRight.y);
		this.context.lineTo(this.bottomRight.x, this.bottomRight.y);
		this.context.lineTo(this.bottomLeft.x, this.bottomLeft.y);

		this.context.closePath();
		this.context.stroke();

		this.context.restore();*/
	};

	WebGlRenderer.prototype.clear = function()
	{

		this.context.clearRect(0, 0, 300, 300);
	};

	ow.WebGlRenderer = WebGlRenderer;
})();
