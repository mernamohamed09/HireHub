import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

function MovingStars() {
  const starsRef = useRef();
  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.x -= delta * 0.02;
      starsRef.current.rotation.y -= delta * 0.03;
    }
  });
  return (
    <group ref={starsRef}>
      <Stars radius={100} depth={50} count={1500} factor={5} saturation={0} fade speed={1.5} />
    </group>
  );
}

export function BackgroundScene({ children, showGyroscope }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }} className="absolute inset-0">
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#10b981" />
        <directionalLight position={[-10, -10, -5]} intensity={2} color="#f59e0b" />
        <MovingStars />
        {showGyroscope && children}
      </Canvas>
    </div>
  );
}
