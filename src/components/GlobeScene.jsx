import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Color, Vector3 } from 'three'
import { EARTH_RADIUS_UNITS, UI_LIMITS } from '../constants/config'
import { vector3ToLatLon } from '../utils/geo'
import { SatelliteLayer } from './SatelliteLayer'
import { LaunchLayer } from './LaunchLayer'

function SceneContent({
  satellites,
  lodSatellites,
  launches,
  layers,
  onPickSatellite,
  onPickGround,
  selectedLaunchId,
  onSelectLaunch,
}) {
  const earthRef = useRef(null)
  const { camera } = useThree()
  const [lodMode, setLodMode] = useState(false)
  const lastDistance = useRef(camera.position.length())

  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.03
    }

    const distance = camera.position.length()
    if (Math.abs(distance - lastDistance.current) > 0.2) {
      lastDistance.current = distance
      setLodMode(distance > UI_LIMITS.lodSwitchDistance)
    }
  })

  const activeSatellites = lodMode ? lodSatellites : satellites

  return (
    <>
      <ambientLight intensity={0.58} color="#4c7eb8" />
      <directionalLight position={[7, 5, 4]} intensity={1.25} color="#f7fbff" />
      <directionalLight position={[-4, -3, -4]} intensity={0.24} color="#4ac4ff" />

      <mesh
        ref={earthRef}
        onClick={(event) => {
          event.stopPropagation()
          const { lat, lon } = vector3ToLatLon(event.point.clone())
          onPickGround?.({ lat, lon })
        }}
      >
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 48, 48]} />
        <meshStandardMaterial
          color="#0b3157"
          emissive="#071734"
          emissiveIntensity={0.6}
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>

      {layers.atmosphere && (
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS_UNITS * 1.04, 42, 42]} />
          <meshStandardMaterial
            color="#3fd4ff"
            transparent
            opacity={0.1}
            depthWrite={false}
            emissive="#35bdff"
            emissiveIntensity={0.9}
          />
        </mesh>
      )}

      <SatelliteLayer
        positions={activeSatellites}
        visible={layers.satellites}
        lodMode={lodMode}
        onPick={onPickSatellite}
      />
      <LaunchLayer
        launches={launches}
        visible={layers.launches}
        selectedLaunchId={selectedLaunchId}
        onSelect={onSelectLaunch}
      />
      <Stars radius={90} depth={45} count={3000} factor={2.8} saturation={0} fade />
      <OrbitControls enablePan={false} minDistance={4.3} maxDistance={13} />
    </>
  )
}

export function GlobeScene({
  satellites,
  lodSatellites,
  launches,
  layers,
  onPickSatellite,
  onPickGround,
  selectedLaunchId,
  onSelectLaunch,
  isMobile,
}) {
  const backgroundColor = useMemo(() => new Color('#020815'), [])
  const maxDpr = isMobile ? 1.5 : 2

  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, maxDpr]}
      gl={{ antialias: true, alpha: false }}
      camera={{ position: new Vector3(0, 0, 8.2), fov: 46, near: 0.1, far: 200 }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(backgroundColor)
        scene.fog = null
      }}
    >
      <Suspense fallback={null}>
        <SceneContent
          satellites={satellites}
          lodSatellites={lodSatellites}
          launches={launches}
          layers={layers}
          onPickSatellite={onPickSatellite}
          onPickGround={onPickGround}
          selectedLaunchId={selectedLaunchId}
          onSelectLaunch={onSelectLaunch}
        />
      </Suspense>
    </Canvas>
  )
}
