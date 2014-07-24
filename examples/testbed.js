
var test = new ow.Texture('res/tiles.png');
var test2 = new ow.Texture('res/tiles2.png');

var renderer = new ow.WebGlRenderer();
var sprite = new ow.Sprite(test, new ow.Rectangle(32.0, 32.0, 128.0, 64.0), new ow.Vector(100, 100));
var sprite2 = new ow.Sprite(test, new ow.Rectangle(32.0, 32.0, 128.0, 64.0), new ow.Vector(128.0, 0));
var sprite3 = new ow.Sprite(test, new ow.Rectangle(32.0, 32.0, 128.0, 64.0), new ow.Vector(128.0, 0));


sprite.addChild(sprite2);
sprite2.addChild(sprite3);

var stageWidth = window.innerWidth;
var stageHeight = window.innerHeight;

sprite.anchor = new ow.Vector(0, 0.5);
sprite2.anchor = new ow.Vector(0, 0.5);
sprite3.anchor = new ow.Vector(0, 0.5);

var time = 0;


var draw = function()
{
    window.requestAnimationFrame(draw);

    var sin = Math.sin(time);

    renderer.clear();
    
    sprite.rotation += 1;
    sprite2.rotation += 1;
    sprite3.rotation += 1;

    sprite.scale.x = (sin * 0.5) + 1.0;
    sprite.scale.y = (sin * 0.5) + 1.0;

    sprite2.scale.x = (sin * 0.5) + 1.0;
    sprite2.scale.y = (sin * 0.5) + 1.0;

    sprite3.scale.x = (sin * 0.5) + 1.0;
    sprite3.scale.y = (sin * 0.5) + 1.0;

    sprite.textureRect.x += 1;
    sprite.textureRect.y += 1;

    sprite2.textureRect.x += 1;
    sprite2.textureRect.y += 1;

    sprite3.textureRect.x += 1;
    sprite3.textureRect.y += 1;

    for (var i = 0; i < 10; i++)
    {
        for (var j = 0; j < 10; j++)
        {     
            sprite.position.x = i * 64;
            sprite.position.y = j * 64;
            renderer.draw(sprite);
        }
    }

    time += 0.1;

    /*for (var i = 0; i < 5000; i++)
    {
        renderer.drawTexture(test, {x: Math.random() * 300, y: Math.random() * 300, width: 100, height: 100});
    }*/

    /*for (var i = 0; i < 1000; i++)
    {
        renderer.drawTexture(test2, {x: Math.random() * 300, y: Math.random() * 300, width: 100, height: 100});
    }*/

    //var prevTime = Date.now();
    /*
    for (var i = 0; i < 10; i++)
    {
        for (var j = 0; j < 10; j++)
        {     
            sprite.position.x = i * 64;
            sprite.position.y = j * 64;
            renderer.draw(sprite);
        }
    }*/

   

    renderer.commit();
    //var duration = Date.now() - prevTime;
};

draw();

document.body.appendChild(renderer.domElement);