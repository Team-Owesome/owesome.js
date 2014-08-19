
var test = new ow.Texture('res/bullet.png');
var randomTexture = new ow.Texture('res/npot.png');

// The MIT License (MIT)
// 
// Copyright (c) 2014 Team Owesome (http://owesome.ch)
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var renderer = new ow.WebGlRenderer(window.innerWidth, window.innerHeight);

var stageWidth = window.innerWidth;
var stageHeight = window.innerHeight;


var time = 0;
var bulletCount = 0;

var stats = new Stats();
stats.setMode(0);

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

var scene = new ow.Scene();

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

    this.sprite.add(this.sprite2);

    this.sprite.color = Math.random() * 0xFFFFFF;
    this.sprite2.color = Math.random() * 0xFFFFFF;
};

Bullet.prototype.update = function()
{
    this.x += this.vx;
    this.y += this.vy;

    this.sprite.position.x = this.x;
    this.sprite.position.y = this.y;

    this.sprite2.rotation += 1;
    this.sprite2.scale = new ow.Vector(Math.sin(this.x / 10) + Math.sin(this.y / 10));
};

var bullets = [];
var firstBullet = new Bullet();
var lastBullet = firstBullet;

//firstBullet.x = window.innerWidth / 2;
//firstBullet.y = window.innerHeight / 2;

scene.add(firstBullet.sprite);

var containerSprite = new ow.Sprite();
var otherSprite1 = new ow.Sprite(randomTexture, new ow.Rectangle(0.0, 0.0, 160.0, 160.0));
var otherSprite2 = new ow.Sprite(randomTexture, new ow.Rectangle(0.0, 0.0, 160.0, 160.0));

containerSprite.add(otherSprite1);
containerSprite.add(otherSprite2);


scene.add(containerSprite);



var draw = function()
{
    window.requestAnimationFrame(draw);
    stats.begin();

    containerSprite.position.x = Math.sin(time) * 100.0;
    containerSprite.position.y = Math.cos(time) * 100.0;

    //containerSprite.rotation += 1;
    //containerSprite.scale.x = Math.sin(this.time) * 2 + 1;
    // containerSprite.scale.y = Math.sin(this.time) * 2 + 1;

    otherSprite2.textureRect.x = Math.sin(time) * 200.0;
    otherSprite2.textureRect.y = Math.cos(time) * 200.0;

    otherSprite1.textureRect.x = Math.sin(time) * 50.0;
    otherSprite1.textureRect.y = Math.cos(time) * 50.0;

    renderer.clear();

    
    for (var j = 0; j < 2; j++)
    {
        var newBullet = new Bullet();

        scene.add(newBullet.sprite);

        //newBullet.x = window.innerWidth / 2;
        //newBullet.y = window.innerHeight / 2;

        newBullet.vx = (Math.sin(j / 2 * Math.PI * 2 + time));
        newBullet.vy = (Math.cos(j / 2 * Math.PI * 2 + time));

        lastBullet.nextBullet = newBullet;
        newBullet.prevBullet = lastBullet;

        lastBullet = newBullet;

        ++bulletCount;
    }
            
    //firstBullet.x = window.innerWidth / 2;
    //firstBullet.y = window.innerHeight / 2;
    
    var currentBullet = firstBullet;

    while (currentBullet.nextBullet)
    {
        currentBullet.update();

        if (currentBullet.x < -window.innerWidth / 2 ||
            currentBullet.y < -window.innerHeight / 2 ||
            currentBullet.x > window.innerWidth / 2 ||
            currentBullet.y > window.innerHeight / 2)
        {
            currentBullet.prevBullet.nextBullet = currentBullet.nextBullet;
            currentBullet.nextBullet.prevBullet = currentBullet.prevBullet;

            scene.remove(currentBullet.sprite);

            --bulletCount;
        }

        currentBullet = currentBullet.nextBullet;
    }

    currentBullet.update();

    time += 0.1;

    scene.rotation = Math.sin(time / 5) * 40;
    //scene.position.set(Math.sin(time / 10) * 200.0, Math.cos(time / 10) * 200.0);
    scene.scale.set(2.0 + Math.sin(time / 10));

    renderer.render(scene);
    stats.end();
};

draw();

window.addEventListener('resize', function(e)
{
    renderer.setSize(window.innerWidth, window.innerHeight);
});

document.body.appendChild(renderer.domElement);