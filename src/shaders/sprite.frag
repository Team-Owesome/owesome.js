// ow.SPRITE_FRAG_SHADER_SRC

uniform sampler2D uTexture;

varying mediump vec2 vTexCoord;
varying lowp vec4 vColor;

void main()
{
    gl_FragColor = texture2D(uTexture, vTexCoord) * vColor;
}