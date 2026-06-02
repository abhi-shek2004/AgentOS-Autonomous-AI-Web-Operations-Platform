"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

function ParticleNetwork({ count = 800 }: { count?: number }) {
  const points = useRef<THREE.Points>(null!);
  const linesRef = useRef<THREE.LineSegments>(null!);

  // Generate particle positions
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    return arr;
  }, [count]);

  // Generate connection lines
  const lineGeometry = useMemo(() => {
    const maxDist = 2.4;
    const segs: number[] = [];
    for (let i = 0; i < count; i++) {
      const ax = positions[i * 3];
      const ay = positions[i * 3 + 1];
      const az = positions[i * 3 + 2];
      for (let j = i + 1; j < count; j++) {
        const bx = positions[j * 3];
        const by = positions[j * 3 + 1];
        const bz = positions[j * 3 + 2];
        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < maxDist * maxDist) {
          segs.push(ax, ay, az, bx, by, bz);
        }
      }
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
    return geom;
  }, [positions, count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.04;
      points.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.04;
      linesRef.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#a5b4fc"
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color="#6366F1"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

function FloatingOrbs() {
  const groupRef = useRef<THREE.Group>(null!);
  const orbs = useMemo(
    () => [
      { pos: [-5, 2, -3], color: "#6366F1", size: 0.6 },
      { pos: [4, -1.5, -2], color: "#06B6D4", size: 0.5 },
      { pos: [0, 3, -4], color: "#8B5CF6", size: 0.4 },
      { pos: [-3, -2, -2], color: "#10B981", size: 0.35 },
      { pos: [5, 2, -5], color: "#22D3EE", size: 0.45 },
    ],
    []
  );

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      {orbs.map((o, i) => (
        <mesh key={i} position={o.pos as [number, number, number]}>
          <icosahedronGeometry args={[o.size, 1]} />
          <meshStandardMaterial
            color={o.color}
            emissive={o.color}
            emissiveIntensity={1.2}
            wireframe
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

export function ParticleField() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 65 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={1.5} color="#6366F1" />
          <pointLight position={[-5, -3, 3]} intensity={1.2} color="#06B6D4" />
          <ParticleNetwork />
          <FloatingOrbs />
        </Suspense>
      </Canvas>
    </div>
  );
}
