"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Html, Float, Stars } from "@react-three/drei";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

interface AgentNode {
  name: string;
  color: string;
  angle: number;
  radius: number;
  yOffset: number;
  description: string;
}

const AGENTS: AgentNode[] = [
  { name: "Planner", color: "#6366F1", angle: 0, radius: 2.8, yOffset: 0.8, description: "Tree-of-Thought" },
  { name: "Navigator", color: "#06B6D4", angle: Math.PI / 3, radius: 2.8, yOffset: -0.4, description: "Visual DOM" },
  { name: "Executor", color: "#10B981", angle: (2 * Math.PI) / 3, radius: 2.8, yOffset: 0.6, description: "Playwright" },
  { name: "Validator", color: "#8B5CF6", angle: Math.PI, radius: 2.8, yOffset: -0.2, description: "Assertions" },
  { name: "Recovery", color: "#F43F5E", angle: (4 * Math.PI) / 3, radius: 2.8, yOffset: 0.5, description: "Self-Heal" },
  { name: "Memory", color: "#F59E0B", angle: (5 * Math.PI) / 3, radius: 2.8, yOffset: -0.6, description: "Postgres" },
];

function CentralCore() {
  const coreRef = useRef<THREE.Mesh>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const ring3Ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.5;
      coreRef.current.rotation.x = t * 0.3;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.3;
      ring1Ref.current.rotation.y = t * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -t * 0.25;
      ring2Ref.current.rotation.z = t * 0.2;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = t * 0.4;
      ring3Ref.current.rotation.z = -t * 0.15;
    }
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial
          color="#6366F1"
          emissive="#6366F1"
          emissiveIntensity={1.4}
          wireframe
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.2, 0.015, 16, 100]} />
        <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={1} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.5, 0.012, 16, 100]} />
        <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={1} />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[1.9, 0.008, 16, 100]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.8} />
      </mesh>
      <Html center>
        <div className="px-2.5 py-1 rounded-md bg-black/40 backdrop-blur border border-indigo-500/30 text-[10px] font-mono text-indigo-300 whitespace-nowrap">
          SUPERVISOR
        </div>
      </Html>
    </group>
  );
}

function AgentNodeMesh({ node, index }: { node: AgentNode; index: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.12 + node.angle;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.6;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      <group position={[node.radius, node.yOffset, 0]}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[0.28, 1]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={1.5}
            transparent
            opacity={0.95}
          />
        </mesh>
        <Html center distanceFactor={8}>
          <div className="flex flex-col items-center gap-0.5 pointer-events-none">
            <span
              className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur border text-[10px] font-mono font-bold whitespace-nowrap"
              style={{ borderColor: node.color + "80", color: node.color }}
            >
              {node.name.toUpperCase()}
            </span>
            <span className="text-[8px] font-mono text-slate-400 whitespace-nowrap">
              {node.description}
            </span>
          </div>
        </Html>
      </group>
    </group>
  );
}

function ConnectionLines() {
  const lineRef = useRef<THREE.LineSegments>(null!);

  const geometry = useMemo(() => {
    const segs: number[] = [];
    for (let i = 0; i < AGENTS.length; i++) {
      const a = AGENTS[i];
      const ax = Math.cos(a.angle) * a.radius;
      const ay = a.yOffset;
      const az = Math.sin(a.angle) * a.radius;
      // To center
      segs.push(0, 0, 0, ax, ay, az);
      // To next
      const b = AGENTS[(i + 1) % AGENTS.length];
      const bx = Math.cos(b.angle) * b.radius;
      const by = b.yOffset;
      const bz = Math.sin(b.angle) * b.radius;
      segs.push(ax, ay, az, bx, by, bz);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
    return geom;
  }, []);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color="#6366F1" transparent opacity={0.35} />
    </lineSegments>
  );
}

function FlowParticles() {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      const a = (i / 200) * Math.PI * 2;
      const r = 2.8 + (Math.random() - 0.5) * 0.4;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.4;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#a5b4fc"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function AgentOrbit() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 1.5, 7], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} intensity={1.5} color="#6366F1" />
          <pointLight position={[-5, -3, 3]} intensity={1.2} color="#06B6D4" />
          <pointLight position={[0, 5, -3]} intensity={1} color="#8B5CF6" />
          <Stars radius={50} depth={50} count={1200} factor={4} fade speed={1} />
          <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
            <CentralCore />
          </Float>
          <ConnectionLines />
          <FlowParticles />
          {AGENTS.map((a, i) => (
            <AgentNodeMesh key={a.name} node={a} index={i} />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}
