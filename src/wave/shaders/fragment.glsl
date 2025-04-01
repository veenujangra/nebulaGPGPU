varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;

void main(){

  // Normal
  vec3 normal = normalize(vNormal);
  if(gl_FrontFacing == false){
    normal *= -1.0;
  }

  // Stripes

  float stripes = pow(mod((vPosition.y * 50.0 - uTime) * 1.0 , 1.0), 3.0);
  // float stripes = pow(mod((vPosition.y * 50.0) * 1.0 , 1.0), 3.0);
  stripes = smoothstep(0.0, 1.0, stripes) * (1.0 - smoothstep(0.0, 1.0, stripes));

  // Fresnel
  vec3 viewDirection = vPosition - cameraPosition;
  viewDirection = normalize(viewDirection);
  float fresnel = 1.0 + dot(normal, viewDirection);
  fresnel = pow(fresnel, 2.0);

  // // Fall off
  // float fallOff = smoothstep(0.2, 1.0, fresnel);

  // // Stripes
  // stripes *= fresnel;
  // stripes += fresnel * 1.5;
  // stripes *= fallOff;

  // float strength = mod(vPosition.y * 50.0, 1.0);
  // strength = 1.0 - step(0.1, strength);

  // Set the color of the fragment
  // gl_FragColor = vec4(vec3(strength), 1.0);

  vec3 finalColor = mix(uColor1, uColor2, vPosition.x);
  gl_FragColor = vec4(finalColor, stripes);

  // gl_FragColor = vec4(0.5, 0.5, 0.5, stripes);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}