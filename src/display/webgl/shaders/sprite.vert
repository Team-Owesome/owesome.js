// ow.SPRITE_VERT_SHADER_SRC

uniform mediump mat4 uProjectionMatrix;

attribute mediump vec2 aPosition;
attribute mediump vec2 aTexCoord;
attribute lowp vec2 aColor;

varying mediump vec2 vTexCoord;
varying lowp vec4 vColor;

void main() 
{
    gl_Position = uProjectionMatrix * vec4(aPosition.xy, 0.0, 1.0);

    vTexCoord = aTexCoord;

    vec3 color =  mod(vec3(aColor.y / 65536.0,
    					   aColor.y / 256.0,
    					   aColor.y), 256.0) / 256.0;

    vColor = vec4(color * aColor.x, aColor.x);
}