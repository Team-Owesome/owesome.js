
var test = new ow.Texture('res/tiles.png');
var test2 = new ow.Texture('res/tiles2.png');

var renderer = new ow.WebGlRenderer();
var sprite = new ow.Sprite(test, new ow.Rectangle(32.0, 32.0, 64.0, 64.0), new ow.Vector(100, 100));
var sprite2 = new ow.Sprite(test, new ow.Rectangle(32.0, 32.0, 64.0, 64.0), new ow.Vector(70, 0));

//sprite.addChild(sprite2);

var matrix = new ow.Matrix();

var stageWidth = window.innerWidth;
var stageHeight = window.innerHeight;

var draw = function()
{
    window.requestAnimationFrame(draw);

    renderer.clear();

    sprite.rotation += 1;

    //renderer.draw(sprite);

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

    for (var j = 0; j < 3000; j++)
    {     
        sprite.position.x = Math.random() * stageWidth;
        sprite.position.y = Math.random() * stageHeight;
        renderer.draw(sprite);
    }

    renderer.commit();
    //var duration = Date.now() - prevTime;
};

draw();

document.body.appendChild(renderer.domElement);