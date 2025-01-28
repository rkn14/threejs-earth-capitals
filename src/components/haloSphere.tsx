import React, { useRef } from 'react';
import * as THREE from 'three';


interface HaloSphereProps {
    sphereRadius?: number,
  }

export const  HaloSphere: React.FC<HaloSphereProps> = ( {sphereRadius = 2.5} ) => {

  const meshRef = useRef(null);

 
 
const vertexShader = `
uniform float hollowRadius;

varying vec3 vVertexWorldPosition;
varying vec3 vVertexNormal;
varying float vCameraDistanceToObjCenter;
varying float vVertexAngularDistanceToHollowRadius;

void main() {    
  vVertexNormal	= normalize(normalMatrix * normal);
  vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  
  vec4 objCenterViewPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vCameraDistanceToObjCenter = length(objCenterViewPosition);
  
  float edgeAngle = atan(hollowRadius / vCameraDistanceToObjCenter);
  float vertexAngle = acos(dot(normalize(modelViewMatrix * vec4(position, 1.0)), normalize(objCenterViewPosition)));
  vVertexAngularDistanceToHollowRadius = vertexAngle - edgeAngle;

  gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
uniform vec3 color;
uniform float coefficient;
uniform float power;
uniform float hollowRadius;

varying vec3 vVertexNormal;
varying vec3 vVertexWorldPosition;
varying float vCameraDistanceToObjCenter;
varying float vVertexAngularDistanceToHollowRadius;

void main() {
  if (vCameraDistanceToObjCenter < hollowRadius) discard; // inside the hollowRadius
  if (vVertexAngularDistanceToHollowRadius < 0.0) discard; // frag position is within the hollow radius

  vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;
  vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
  viewCameraToVertex = normalize(viewCameraToVertex);
  float intensity	= pow(
    coefficient + dot(vVertexNormal, viewCameraToVertex),
    power
  );
  gl_FragColor = vec4(color, intensity);
}`;


  const uniforms =  {
    coefficient: {
      value: 0.001,
    },
    color: {
      value: new THREE.Color('blue'),
    },
    power: {
      value: 1.6,
    },
    hollowRadius: {
      value: 2.0,
    }
  }
  
  return (
    <mesh ref={meshRef} >
      <sphereGeometry args={[sphereRadius - 0.2, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms= {uniforms}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
};

