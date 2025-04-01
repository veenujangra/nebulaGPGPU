uniform float uTime;

uniform float uSmallWaveIteration;
uniform float uSmallWaveSpeed;
uniform float uSmallWaveFrequency;
uniform float uSmallWaveIntensity;

uniform float uBigWaveElevation;
uniform vec2 uBigWaveFrequency;
uniform float uBigWaveSpeed;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

#include ./includes/perlinNoise.glsl

float random2D(vec2 value)
{
    return fract(sin(dot(value.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main(){
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // Waves
  float elevation = sin(modelPosition.x * uBigWaveFrequency.x + uTime * uBigWaveSpeed) *
                    cos(modelPosition.z * uBigWaveFrequency.y + uTime * uBigWaveSpeed) *
                    uBigWaveElevation;

  for(float i = 1.0; i <= uSmallWaveIteration; i++){
    elevation -= cnoise(vec3(modelPosition.xz * i * uSmallWaveFrequency, 
                        uTime * uSmallWaveSpeed)) * uSmallWaveIntensity / i;
  }

  // Glitch
  float glitchTime = uTime * 1.2 - modelPosition.x;
  float glitchStrength = sin(glitchTime);
  glitchStrength *= 0.6;
  glitchStrength = smoothstep(0.5, 1.0, glitchStrength);

  modelPosition.y += random2D(vec2(modelPosition.y) + uTime * 0.5) * glitchStrength;

  // Apply the waves
  modelPosition.y += elevation;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  // Final Position
  gl_Position = projectedPosition;

  // Model Normal
  vec4 modelNormal = modelMatrix * vec4(normal, 0.0); // 0.0 because it's a direction
  
  // varying
  vUv = uv;
  vNormal = modelNormal.xyz;
  vPosition = position.xyz;
}