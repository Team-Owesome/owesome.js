// ow.SPRITE_VERT_SHADER_SRC

uniform mat4 projectionMatrix;

attribute vec2 vertex;
attribute vec2 texCoord;

varying highp vec2 vTextureCoord;

void main() 
{
    gl_Position = projectionMatrix * vec4(vertex.xy, 0, 1);
    vTextureCoord = texCoord;
}