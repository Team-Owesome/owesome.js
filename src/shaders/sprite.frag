// ow.SPRITE_FRAG_SHADER_SRC

uniform sampler2D texture;

varying highp vec2 vTextureCoord;

void main()
{
	/*gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);*/
	gl_FragColor = texture2D(texture, vTextureCoord);
}