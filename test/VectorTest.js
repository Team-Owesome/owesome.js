describe('Vector', function()
{
	describe('constructor', function()
	{
		it('should initialize correctly', function()
		{
			var vectorA = new ow.Vector();

			vectorA.x.should.be.equal(0);
			vectorA.y.should.be.equal(0);

			vectorA = new ow.Vector(1);

			vectorA.x.should.be.equal(1);
			vectorA.y.should.be.equal(1);

			vectorA = new ow.Vector(1, 2);

			vectorA.x.should.be.equal(1);
			vectorA.y.should.be.equal(2);
		});

		it('x and y should be NaN if input wasn\'t a number', function()
		{
			var vectorA = new ow.Vector('asdf');

			(isNaN(vectorA.x)).should.be.equal(true);
			(isNaN(vectorA.y)).should.be.equal(true);

			vectorA = new ow.Vector({}, {});

			(isNaN(vectorA.x)).should.be.equal(true);
			(isNaN(vectorA.y)).should.be.equal(true);
		});
	});

	describe('#toArray()', function()
	{
		it('should return an array with the x and y values', function()
		{
			var vectorA = new ow.Vector(1, 2);
			var vectorArray = vectorA.toArray();

			vectorArray[0].should.be.equal(vectorA.x);
			vectorArray[1].should.be.equal(vectorA.y);
		});
	});

	describe('#toNativeArray()', function()
	{
		it('should return an native array with the x and y values', function()
		{
			var vectorA = new ow.Vector(1, 2);
			var vectorArray = vectorA.toNativeArray();

			vectorArray[0].should.be.equal(vectorA.x);
			vectorArray[1].should.be.equal(vectorA.y);
		});
	});

	describe('#copy()', function()
	{
		it('should return a copy with the same values', function()
		{
			var vectorA = new ow.Vector(1, 2);
			var vectorB = vectorA.clone();

			vectorA.should.not.be.equal(vectorB);
			vectorA.x.should.be.equal(vectorB.x);
			vectorA.y.should.be.equal(vectorB.y);
		});
	});

	describe('#add()', function()
	{
		it('should add vector correctly and return itself', function()
		{
			var vectorA = new ow.Vector();
			var vectorB = new ow.Vector(1, 1);

			vectorA.add(vectorB).should.be.equal(vectorA);

			vectorA.x.should.be.equal(1);
			vectorA.y.should.be.equal(1);
		});

		it('should add numbers correctly and return itself', function()
		{
			var vectorA = new ow.Vector();

			vectorA.add(1).should.be.equal(vectorA);

			vectorA.x.should.be.equal(1);
			vectorA.y.should.be.equal(1);

			vectorA.add(1, 2).should.be.equal(vectorA);

			vectorA.x.should.be.equal(2);
			vectorA.y.should.be.equal(3);
		});

		it('should result in NaN when not given a number or a valid vector and return itself', function()
		{
			var vectorA = new ow.Vector();
			var vectorB = new ow.Vector('asdf');

			vectorA.add('asdf').should.be.equal(vectorA);

			(isNaN(vectorA.x)).should.be.equal(true);
			(isNaN(vectorA.y)).should.be.equal(true);

			vectorA = new ow.Vector();
			vectorA.add(vectorB).should.be.equal(vectorA);

			(isNaN(vectorA.x)).should.be.equal(true);
			(isNaN(vectorA.y)).should.be.equal(true);
		});
	});

	describe('#addition()', function()
	{
		
	});

	describe('#substract()', function()
	{
		it('should substract vector correctly and return itself', function()
		{
			var vectorA = new ow.Vector();
			var vectorB = new ow.Vector(1, 1);

			vectorA.substract(vectorB).should.be.equal(vectorA);

			vectorA.x.should.be.equal(-1);
			vectorA.y.should.be.equal(-1);
		});

		it('should substract numbers correctly and return itself', function()
		{
			var vectorA = new ow.Vector();

			vectorA.substract(1).should.be.equal(vectorA);

			vectorA.x.should.be.equal(-1);
			vectorA.y.should.be.equal(-1);

			vectorA.substract(1, 2).should.be.equal(vectorA);

			vectorA.x.should.be.equal(-2);
			vectorA.y.should.be.equal(-3);
		});

		it('should result in NaN when not given a number or a valid vector and return itself', function()
		{
			var vectorA = new ow.Vector();
			var vectorB = new ow.Vector('asdf');

			vectorA.substract('asdf').should.be.equal(vectorA);

			(isNaN(vectorA.x)).should.be.equal(true);
			(isNaN(vectorA.y)).should.be.equal(true);

			vectorA = new ow.Vector();
			vectorA.substract(vectorB).should.be.equal(vectorA);

			(isNaN(vectorA.x)).should.be.equal(true);
			(isNaN(vectorA.y)).should.be.equal(true);
		});
	});

	describe('#substraction()', function()
	{
		
	});
});