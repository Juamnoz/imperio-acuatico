'use client'

import { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Single animated fish that swims an elliptical path ─── */
function Fish({
  modelPath,
  scale = 1,
  speed = 0.4,
  radiusX = 5,
  radiusZ = 3,
  yBase = 0,
  phase = 0,
}: {
  modelPath: string
  scale?: number
  speed?: number
  radiusX?: number
  radiusZ?: number
  yBase?: number
  phase?: number
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const angle = useRef(phase)

  const { scene, animations } = useGLTF(modelPath)
  const { actions, names } = useAnimations(animations, groupRef)

  // Start first animation clip (swim cycle)
  useEffect(() => {
    if (names.length > 0) {
      actions[names[0]]?.reset().play()
    }
  }, [actions, names])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    angle.current += speed * delta

    const x = Math.cos(angle.current) * radiusX
    const z = Math.sin(angle.current) * radiusZ
    const y = yBase + Math.sin(angle.current * 1.7 + phase) * 0.35

    groupRef.current.position.set(x, y, z)

    // Face travel direction
    const nx = Math.cos(angle.current + 0.02) * radiusX
    const nz = Math.sin(angle.current + 0.02) * radiusZ
    groupRef.current.rotation.y = Math.atan2(nx - x, nz - z)
    groupRef.current.rotation.z = Math.sin(angle.current * 2.5) * 0.06
  })

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={scene} />
    </group>
  )
}

/* ─── Preload ─── */
const MODELS = [
  '/models/butterfly.glb',
  '/models/fish1.glb',
  '/models/fish2.glb',
  '/models/fish3.glb',
  '/models/koi.glb',
]
MODELS.forEach(m => useGLTF.preload(m))

/* ─── Scene ─── */
function Scene() {
  return (
    <>
      {/* HDR environment for realistic reflections on fish */}
      <Environment preset="sunset" />

      {/* Underwater tint lights */}
      <ambientLight intensity={1.2} color="#44AACC" />
      <directionalLight position={[5, 10, 5]}  intensity={2.5} color="#88DDFF" />
      <directionalLight position={[-5, 8, -5]} intensity={1.0} color="#0099BB" />
      <pointLight position={[0, 5, 8]}  intensity={3} color="#00EEFF" distance={20} />
      <pointLight position={[0, -2, 0]} intensity={1} color="#004466" distance={15} />

      {/* Fish — various species on different orbits */}
      <Suspense fallback={null}>
        {/* Butterfly fish */}
        <Fish modelPath="/models/butterfly.glb"  scale={0.38} speed={0.11} radiusX={15}  radiusZ={6}   yBase={1.0}  phase={1.0} />
        <Fish modelPath="/models/butterfly.glb"  scale={0.30} speed={0.15} radiusX={13}  radiusZ={5}   yBase={-1.2} phase={3.7} />

        {/* Generic tropical fish — small schooling */}
        <Fish modelPath="/models/fish1.glb"      scale={0.28} speed={0.22} radiusX={9}   radiusZ={4}   yBase={1.5}  phase={0.5} />
        <Fish modelPath="/models/fish1.glb"      scale={0.25} speed={0.25} radiusX={11}  radiusZ={4.5} yBase={1.2}  phase={2.5} />
        <Fish modelPath="/models/fish1.glb"      scale={0.26} speed={0.20} radiusX={8}   radiusZ={3.5} yBase={0.8}  phase={4.5} />

        <Fish modelPath="/models/fish2.glb"      scale={0.55} speed={0.16} radiusX={16}  radiusZ={7}   yBase={0.2}  phase={1.8} />
        <Fish modelPath="/models/fish2.glb"      scale={0.48} speed={0.19} radiusX={14}  radiusZ={6}   yBase={-1.5} phase={4.0} />

        <Fish modelPath="/models/fish3.glb"      scale={0.42} speed={0.26} radiusX={10}  radiusZ={4}   yBase={-1.8} phase={3.0} />
        <Fish modelPath="/models/fish3.glb"      scale={0.38} speed={0.28} radiusX={8}   radiusZ={3.5} yBase={-1.0} phase={5.5} />

        {/* Koi — large slow swimmer */}
        <Fish modelPath="/models/koi.glb"        scale={0.50} speed={0.08} radiusX={18}  radiusZ={8}   yBase={-0.3} phase={1.5} />
      </Suspense>
    </>
  )
}

/* ─── Main export ─── */
export function FishCanvas() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-screen" aria-hidden>
      <Canvas
        camera={{ position: [0, 1.5, 22], fov: 70, near: 0.1, far: 150 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
