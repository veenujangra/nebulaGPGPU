uniform float uTime;
uniform vec2 uResolution;
uniform float uSize;
uniform float uNoiseScale;

attribute float aSize;
attribute vec3 color;
attribute float aVX;
attribute float aVY;
attribute float aVC;

attribute vec2 aParticleUv;

uniform sampler2D uPositionTexture;
uniform sampler2D uVelocityTexture;

varying vec3 vColor;

// attribute vec2 uv;

#include ./includes/simplexNoise3d.glsl

void main(){
  // Position
  vec3 pos = texture2D(uPositionTexture, aParticleUv).xyz;

  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  gl_PointSize = aSize * uSize * uResolution.y;
  gl_PointSize *= (1.0 / -viewPosition.z);

  // varying
  vColor = color;
}