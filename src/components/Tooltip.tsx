import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';

// Définition des props pour le tooltip
interface TooltipProps {
  index: number,
  position: [number, number, number];
  content: string;
  visible?: boolean;
  scale: number;
  selected: boolean;
  onClick: (index:number) => void;
  onHover: (index:number) => void;
}

// Composant Tooltip en TypeScript
export const Tooltip: React.FC<TooltipProps> = ({ index, onClick, onHover, selected, scale, position, content, visible = true }) => {
 
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "default";
    return () => {
      document.body.style.cursor = "default";
    };
  }, [hovered])

  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    console.log("ho", hovered);
    onHover(hovered ? index : -1)
  }, [hovered])


  useEffect(() => {
    if(!groupRef.current) return;

    groupRef.current?.lookAt(new THREE.Vector3());

    groupRef.current.rotateY(Math.PI);
  }, [position])

  useFrame(() => {

  });

  return (
    visible && (
      <group
        scale={scale}
        ref={groupRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => {onClick(index)}}
      >
     
          <Text
            position={[0, -0.01, 0]} // Décalage vertical
            fontSize={0.01}
            color={hovered || selected ? "white" : "grey"}
            anchorX="center"
            anchorY="middle"
            outlineColor="black"
            outlineBlur={0.003}
          >
            {content}
          </Text>
   
      </group>
    )
  );
};

