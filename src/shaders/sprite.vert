// ow.SPRITE_VERT_SHADER_SRC

uniform mat4 projectionMatrix;

attribute vec2 vertex;
attribute vec2 texCoord;
attribute vec2 aColor;

varying highp vec2 vTextureCoord;
varying highp vec4 vColor;

void main() 
{
    gl_Position = projectionMatrix * vec4(vertex.xy, 0.0, 1.0);

    vTextureCoord = texCoord;

    vec3 color =  mod(vec3(aColor.y / 65536.0, aColor.y / 256.0, aColor.y), 256.0) / 256.0;

    vColor = vec4(color * aColor.x, aColor.x);
}