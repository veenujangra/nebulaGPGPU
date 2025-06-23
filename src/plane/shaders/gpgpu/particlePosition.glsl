// uniform sampler2D uPositionTexture;
// uniform sampler2D uVelocityTexture;
// uniform float uTime;

// void main(){
//   vec2 uv = gl_FragCoord.xy / resolution.xy;

//   vec3 vel = texture2D(uVelocityTexture, uv).xyz;
//   vec3 pos = texture2D(uPositionTexture, uv).xyz;

//   pos.xy += vel.xy;

//   gl_FragColor = vec4(pos, 1.0);
// }

uniform sampler2D uBasePositionTexture;
uniform float uDeltaTime;

void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 pos = texture(uParticlePositionTexture, uv);
  vec2 vel = texture(uParticleVelocityTexture, uv).xy;

  vec4 basePos = texture(uBasePositionTexture, uv);

  // Dead
  if(pos.a >= 1.0){
    pos.a = mod(pos.a, 1.0); // Set alpha to 0 to indicate dead particle
    pos.xyz = basePos.xyz; // Reset position to base position
  }
  // Alive
  else {
    pos.xy += vel.xy * uDeltaTime; // Update position based on velocity
    pos.a += uDeltaTime * 0.3; 
  }

  gl_FragColor = pos; // Output a solid color
}