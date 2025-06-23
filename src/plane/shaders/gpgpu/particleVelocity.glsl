// uniform sampler2D uPositionTexture;
// uniform sampler2D uVelocityTexture;
uniform float uTime;

#include ../includes/simplexNoise3d.glsl


// void main(){
//   vec2 uv = gl_FragCoord.xy / resolution.xy;

//   vec3 vel = texture2D(uParticleVelocityTexture, uv).xyz;
//   vec3 pos = texture2D(uParticlePositionTexture, uv).xyz;

//   float noise = simplexNoise3d(vec3(
//     pos.x + 0.0025 * uTime,
//     pos.y + 0.0125 * uTime,
//     pos.z + 0.0025
//   )) * 6.28318530718 * 6.0; // 2 * PI

//   vel.x = mix(vel.x, cos(noise) * 0.1, 0.015);
//   vel.y = mix(vel.y, sin(noise) * 0.1, 0.015);
//   vel.z = 0.0;

//   gl_FragColor = vec4(vel, 1.0);
// }

void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  
  vec4 pos = texture(uParticlePositionTexture, uv);
  vec4 vel = texture(uParticleVelocityTexture, uv); 

  // Pretty 
  float noise = simplexNoise3d(vec3(
    pos.x * 0.5,
    pos.y * 0.25,
    uTime * 0.05 
  )) * 6.28318530718 * 6.0; // 2 * PI


  // UGLY
  // vec3 noise = vec3( 
  //   simplexNoise3d(vec3(pos.xyz + 0.0)),
  //   simplexNoise3d(vec3(pos.xyz + 1.0)),
  //   simplexNoise3d(vec3(pos.xyz + 2.0))
  // );

  // noise = normalize(noise) * 6.28318530718 * 6.0; // 2 * PI

  vel.x = mix(vel.x, cos(noise) * vel.a, 0.010);
  vel.y = mix(vel.y, sin(noise) * vel.a, 0.010);

  gl_FragColor = vec4(vel.xy, 0.0, 1.0); // Output a solid color
}