// ow.SPRITE_VERT_SHADER_SRC

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