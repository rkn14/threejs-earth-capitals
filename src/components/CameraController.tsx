import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { TargetAngle } from './scene';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

interface CameraControllerProps {
    worldRotation: THREE.Mesh | null;
    targetAngle: TargetAngle | null;
    radiusClose: number;
    radiusFar: number;
    rotateSpeed: number;
}


export const CameraController: React.FC<CameraControllerProps> = ({rotateSpeed, worldRotation, targetAngle = null, radiusClose = 3, radiusFar = 6}) => {


    const orbitControlRef = useRef<OrbitControlsImpl>(null);

    const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(new THREE.Vector3(0, 0, 10));

    const [currAngle, setCurrAngle] = useState<TargetAngle | null>({Latitude:0, Longitude:0});
    const [currRadius, setCurrRadius] = useState<number>(radiusFar);

    const { camera } = useThree();


    const shortestAngleDifference = (start: number, end: number) => {
        let diff = (end - start + Math.PI * 2) % (Math.PI * 2); // Différence modulo 2π
        if (diff > Math.PI) diff -= Math.PI * 2; // Corrige pour prendre la direction la plus courte
        return diff;
    };





    useEffect(() => {
        if (targetAngle && currAngle && worldRotation) {

            const animatableRadius = {radius: currRadius};
            gsap.to(animatableRadius, {
                radius: radiusClose,
                duration: 1,
                ease: 'power2.out',
                onUpdate: () => {
                    setCurrRadius(animatableRadius.radius);
                },
            });

            const localPoint = worldRotation.worldToLocal(camera.position.clone());
            const radius = localPoint.length(); 
            const lat = Math.asin(localPoint.y / radius);
            let lng = Math.atan2(localPoint.x, localPoint.z) - Math.PI/2;
            if(lng < Math.PI) lng += Math.PI * 2;
            if(lng > Math.PI) lng -= Math.PI * 2;

            setCurrAngle({Latitude:lat, Longitude:lng});
            
            const animatableAngle = { ...{lat:lat, lng:lng} };
            gsap.to(animatableAngle, {
                lng: targetAngle.Longitude, 
                lat: targetAngle.Latitude, 
                duration: 1,
                ease: 'power2.out',
                onUpdate: () => {
                    if (currAngle) {
                        let newLng = currAngle.Longitude + shortestAngleDifference(currAngle.Longitude, animatableAngle.lng!) ;
                        if(newLng < Math.PI) newLng += Math.PI * 2;
                        if(newLng > Math.PI) newLng -= Math.PI * 2;
                        const newLat = animatableAngle.lat;
                        setCurrAngle({ Longitude: newLng, Latitude:newLat });
                    } 
                },
                onComplete: () => {
                    
                },
            });

        }else{
            const animatableRadius = {radius: currRadius};
            gsap.to(animatableRadius, {
                radius: radiusFar,
                duration: 1,
                ease: 'power2.out',
                onUpdate: () => {
                    setCurrRadius(animatableRadius.radius);
                },
            });
        }
    }, [targetAngle]);

    useEffect(() => {

        if (currAngle) {

            const x: number = currRadius * Math.cos(currAngle.Latitude) * Math.cos(Math.PI / 2 - currAngle.Longitude);
            const y: number = currRadius * Math.sin(currAngle.Latitude);
            const z: number = currRadius * Math.cos(currAngle.Latitude) * Math.sin(Math.PI / 2 - currAngle.Longitude);              
            const pt: THREE.Vector3 = new THREE.Vector3(x, y, z);
            setTargetPosition(pt);           
        }
    }, [currAngle, currRadius]);



    return (
        <>
            <group >
                <PerspectiveCamera makeDefault position={targetPosition?.toArray()} />
                <OrbitControls 
                    ref={orbitControlRef} enabled={true} 
                    minDistance={radiusClose-0.08} maxDistance={radiusFar +1} 
                    dampingFactor={0.04} enableDamping={true} enablePan={false} rotateSpeed={rotateSpeed} 
                    zoomSpeed={0.5} enableZoom={false} />
            </group>
        </>
    )
}