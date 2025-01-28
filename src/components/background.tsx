import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const SpaceBackground = () => {

  const meshRef = useRef(null);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (meshRef.current) {
        meshRef.current.material.uniforms.uTime.value = elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[10, 10, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        }} 
      />
    </mesh>
  );
};

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;

    void main() {
    vec2 uv = vUv * 2.0 - 1.0; // Transform vUv to range [-1, 1]
    float aspect = uResolution.x / uResolution.y;
    uv.x *= aspect; // Correct aspect ratio

    float dist = length(uv); // Distance from the center

    // Generate concentric lines based on the distance
    float lines = 0.5 + 0.5 * sin(20.0 * dist - uTime * 2.0);

    // Control the sharpness of the lines
    float sharpLines = smoothstep(0.4, 0.6, lines);

    // Convert the grayscale to a minimal color palette
    vec3 color = vec3(sharpLines);

    gl_FragColor = vec4(color, 1.0);
    }

`;


