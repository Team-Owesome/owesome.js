
var test = new ow.Texture('res/bullet.png');

var renderer = new ow.WebGlRenderer(window.innerWidth, window.innerHeight);

var stageWidth = window.innerWidth;
var stageHeight = window.innerHeight;


var time = 0;
var bulletCount = 0;

var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';

var countEl = document.createElement('div');

countEl.style.position = 'absolute';
countEl.style.left = '0';
countEl.style.top = '0';
countEl.style.color = '#FFF';

document.body.appendChild(stats.domElement);
document.body.appendChild(countEl);

var Bullet = function()
{
    this.vx = 0;
    this.vy = 0;

    this.x = 0;
    this.y = 0;

    this.nextBullet = null;
    this.prevBullet = null;

    this.sprite = new ow.Sprite(test, new ow.Rectangle(0.0, 0.0, 16.0, 16.0), new ow.Vector(0, 0));
    this.sprite2 = new ow.Sprite(test, new ow.Rectangle(16.0, 0.0, 16.0, 16.0), new ow.Vector(0, 0));

    this.sprite.addChild(this.sprite2);

    this.sprite.color = Math.random() * 0xFFFFFF;
    this.sprite2.color = Math.random() * 0xFFFFFF;
};

Bullet.prototype.update = function()
{
    this.x += this.vx;
    this.y += this.vy;

    this.sprite.position.x = this.x;
    this.sprite.position.y = this.y;

    //this.sprite2.rotation += 5;
    this.sprite2.scale = new ow.Vector(Math.sin(this.x / 10) + Math.sin(this.y / 10));
};

var bullets = [];
var firstBullet = new Bullet();
var lastBullet = firstBullet;

firstBullet.x = window.innerWidth / 2;
firstBullet.y = window.innerHeight / 2;

var draw = function()
{
    stats.begin();

    window.requestAnimationFrame(draw);

    renderer.clear();

    if (time % 1 < 0.1)
    {
        for (var j = 0; j < 100; j++)
        {
            var newBullet = new Bullet();

            newBullet.x = window.innerWidth / 2;
            newBullet.y = window.innerHeight / 2;

            var speed = (Math.random() * 1);

            newBullet.vx = (Math.sin(j / 100 * Math.PI * 2));
            newBullet.vy = (Math.cos(j / 100 * Math.PI * 2));

            lastBullet.nextBullet = newBullet;
            newBullet.prevBullet = lastBullet;

            lastBullet = newBullet;

            ++bulletCount;
        }
    }
    
    var currentBullet = firstBullet;

    while (currentBullet.nextBullet)
    {
        currentBullet.update();

        if (currentBullet.x < 0 ||
            currentBullet.y < 0 ||
            currentBullet.x > window.innerWidth ||
            currentBullet.y > window.innerHeight)
        {
            currentBullet.prevBullet.nextBullet = currentBullet.nextBullet;
            currentBullet.nextBullet.prevBullet = currentBullet.prevBullet;

            --bulletCount;
        }

        renderer.draw(currentBullet.sprite);

        currentBullet = currentBullet.nextBullet;
    }

    time += 0.1;

    renderer.commit();

    countEl.innerHTML = bulletCount;
    stats.end();
};

draw();

document.body.appendChild(renderer.domElement);