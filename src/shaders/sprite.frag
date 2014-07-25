// ow.SPRITE_FRAG_SHADER_SRC

uniform sampler2D texture;

varying highp vec2 vTextureCoord;
varying highp vec4 vColor;

void main()
{
	gl_FragColor = texture2D(texture, vTextureCoord) * vColor;
}