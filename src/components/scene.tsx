"use client";

import { TextureLoader } from "three";
import { Suspense, useEffect, useRef, useState } from "react";
import { Environment } from "@react-three/drei";
import * as THREE from 'three';
import { HaloSphere } from "./haloSphere";
import { CameraController } from "./CameraController";
import Papa from 'papaparse';
import { Tooltip } from "./Tooltip";
import gsap from 'gsap';
import { WorldMapContext } from "../context/WorldMapContext";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";


interface CityData {
  City: string;
  CapitalType: string;  
  Country: string;  
  Latitude: number;  
  Longitude: number;  
  Population: string;
}

interface TexturedSphereProps {
  data: CityData[];
  selectedIndex: number;
  sphereRadius: number;
  onSelectItem: (index:number) => void;
  onHoverItem: (index:number) => void;
}

export interface TargetAngle {
    Longitude: number;
    Latitude: number;
}


const EarthdSphere: React.FC<TexturedSphereProps> = ({data, selectedIndex, sphereRadius = 2, onSelectItem, onHoverItem}) => {

  
  const texture = useLoader(TextureLoader, "/textures/2_no_clouds_8k.jpg");
  //const texture = useLoader(TextureLoader, "/textures/8081_earthmap10k.jpg");
  //const texture = useLoader(TextureLoader, "/textures/earthmap4k.jpg");
  //const texture = useLoader(TextureLoader, "/textures/Equirectangular-projection.jpg");
  //const texture = useLoader(TextureLoader, "/textures/world.topo.bathy.200406.3x5400x2700.jpg");
  //const texture = useLoader(TextureLoader, "/textures/eo_base_2020_clean_geo.jpg");

  
  const textureClouds = useLoader(TextureLoader, "/textures/clouds.png");

  const sphereRef = useRef<THREE.Mesh>(null);

  const [cloudsRotationY, setCloudsRotationY] = useState(0);
  
  const [targetAngle, setTargetAngle] = useState<TargetAngle | null>(null);

  const [citiesScale, setCitiesScale] = useState(1);
  const [rotateSpeed, setRotateSpeed] = useState(1);




  useEffect(() => {

    let nextCitiesScale = citiesScale;
    let nextRotateSpeed = rotateSpeed;
    if(selectedIndex == -1){
      
      setTargetAngle(null);
      nextCitiesScale = 3;
      nextRotateSpeed = 1;
    } else{
      setTargetAngle(data[selectedIndex]);
      nextCitiesScale = 0.5;
      nextRotateSpeed = 0.03;
    }

    // animate citiesScale
    const anim = {scale: citiesScale};
    gsap.to(anim, {
        scale: nextCitiesScale,
        duration: 0.5,
        ease: 'power2.in',
        onUpdate: () => {
            setCitiesScale(anim.scale);
        },
    });

    //  rotateSpeed
    setRotateSpeed(nextRotateSpeed)


  }, [selectedIndex])


  const getCityPosition = (item: CityData, radius: number): THREE.Vector3 => {
    const x: number = radius * Math.cos(item.Latitude) * Math.cos(Math.PI / 2 - item.Longitude);
    const y: number = radius * Math.sin(item.Latitude);
    const z: number = radius * Math.cos(item.Latitude) * Math.sin(Math.PI / 2 - item.Longitude);  
    const pt = new THREE.Vector3(x, y, z);
    return pt;
  }

  useFrame((state, delta) => {
    setCloudsRotationY(cloudsRotationY + delta * 0.0008);
  })









  return (
    <group>

      <HaloSphere sphereRadius={sphereRadius + 0.5}/>

      <mesh ref={sphereRef} scale={[1, 1, 1]} rotation-y={-Math.PI/2} visible={true}>
        <sphereGeometry args={[sphereRadius, 64, 64]}  />
        <meshStandardMaterial map={texture} />
      </mesh>

      <mesh scale={[1, 1, 1]} rotation-x={-cloudsRotationY * 0.5} rotation-y={cloudsRotationY} visible={true}>
        <sphereGeometry args={[sphereRadius + 0.005, 64, 64]}  />
        <meshPhongMaterial map={textureClouds} transparent={true} opacity={0.7} />
      </mesh>

      <group>
        {data.map((item, index) => {
          return(
            
              <group key={index}  visible={true}>

                <mesh  scale={0.002} position={getCityPosition(item, sphereRadius + 0.005)  } onUpdate={(self) => {
                    if (!self.userData.initialized) {
                      self.lookAt(new THREE.Vector3(0, 0, 0));
                      self.userData.initialized = true; 
                    }
                  }} >
                  <circleGeometry  />
                  <meshBasicMaterial color={index == selectedIndex ? 0xFFFFFF : 0x888888} side={THREE.BackSide}/>
                </mesh>

                <Tooltip 
                  onHover={(index) => onHoverItem(index)} 
                  onClick={() => onSelectItem(index)} index={index} selected={index == selectedIndex} 
                  scale={citiesScale} position={getCityPosition(item, sphereRadius + 0.005).toArray()} content={item.City} />

              </group>

          )
        })}
      </group>


      
      <CameraController rotateSpeed={rotateSpeed} worldRotation={sphereRef.current} targetAngle={targetAngle} radiusClose={2.2} radiusFar={5} />


    </group>

  );
};



const Scene: React.FC = () => {


  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hoverIndex, setHoverIndex] = useState(-1);

  const [data, setData] = useState([]);
  const [dataRad, setDataRad] = useState([]);

  const listRef = useRef(null);





  useEffect(() => {

    fetch("/data/country-capital-lat-long-population.csv")
    .then((response) => response.text())
    .then((csvText) => {
      let dat:CityData [] = Papa.parse(csvText, {header:true, dynamicTyping: true}).data;
      dat = dat.sort((a, b) => {
        return a.City.localeCompare(b.City);
      });
      setData(dat);      
    });

  }, []);

  useEffect(() => {

    if(!data.length) return;

    const datRad: CityData[] = []
    for(let i = 0; i < data.length; i++){
      datRad.push({...data[i]});
      datRad[i].Latitude = datRad[i].Latitude / 180 * Math.PI;
      datRad[i].Longitude = datRad[i].Longitude / 180 * Math.PI;
    }

    setDataRad(datRad);
  }, [data]);

  useEffect(() => {
    console.log("selectedIndex", selectedIndex);
    if(listRef.current && selectedIndex != -1){                
      const listItem = listRef.current.children[selectedIndex];
      listItem.scrollIntoView({ behavior: "smooth", block: "center" });
    }

  }, [selectedIndex]);



  


  return (
    <WorldMapContext.Provider value={null}>

        <Suspense fallback={<span>Loading... Please wait!</span>}>
          <Canvas className="" >
      
            <Environment
              files="/textures/starmap_2020_4k (1).jpg" 
              background  backgroundBlurriness={0.0} environmentIntensity={1} backgroundIntensity={0.15}
            />

            <ambientLight />

            <EarthdSphere onHoverItem={(index) => { setHoverIndex(index) }} onSelectItem={(index) => { setSelectedIndex(selectedIndex != index ? index : -1) }} data={dataRad} selectedIndex={selectedIndex} sphereRadius={2} />

          </Canvas>
        </Suspense>

        <div className="p-10 fixed top-0 left-0 h-full ">
          <div className="flex flex-col items-center rounded-xl  bg-slate-900/75 h-full">
            <div className="p-3  w-full text-center text-xl border-2 border-transparent border-b-slate-800">Capitals List</div>
            <ul ref={listRef} className="flex flex-col gap-3  p-5 h-full  overflow-auto" >
              {data.map((item:CityData, index) => {
                return (
                  <li 
                    className={`${selectedIndex == index || hoverIndex == index ? 'ml-2 text-white' : 'text-slate-400 '} transition-all cursor-pointer`} 
                    onPointerEnter={() => {setHoverIndex(index)}}
                    onPointerLeave={() => {setHoverIndex(-1)}}
                    onClick={() => {
                      if(index == selectedIndex){
                        setSelectedIndex(-1);
                      }  else {
                        setSelectedIndex(index);
                      }
                    }}
                    key={index}
                    >
                      {item.City}
                  </li>
                )
              })}      
            </ul>
          </div>
        </div>

    </WorldMapContext.Provider>
  );
};


export default Scene;

