import { useEffect, useMemo, useRef } from 'react'
import { CatmullRomCurve3 } from 'three'
import { Line } from '@react-three/drei'
import { gsap } from 'gsap'
import { launchArcPoints } from '../utils/geo'

function LaunchPath({ launch, active, onSelect }) {
  const progressRef = useRef({ value: 0 })
  const markerRef = useRef(null)

  const curve = useMemo(() => {
    const destinationLat = launch.launchpad.latitude + 8
    const destinationLon = launch.launchpad.longitude + 24
    const points = launchArcPoints(
      launch.launchpad.latitude,
      launch.launchpad.longitude,
      destinationLat,
      destinationLon,
      550,
    )

    return new CatmullRomCurve3(points)
  }, [launch])

  const linePoints = useMemo(() => curve.getPoints(60), [curve])

  useEffect(() => {
    progressRef.current.value = 0
    if (!active) return undefined
    const tween = gsap.to(progressRef.current, {
      value: 1,
      duration: 4,
      ease: 'power1.inOut',
      repeat: -1,
    })
    return () => tween.kill()
  }, [active])

  useEffect(() => {
    let frameId
    const animate = () => {
      if (markerRef.current) {
        const position = curve.getPoint(progressRef.current.value % 1)
        markerRef.current.position.copy(position)
      }
      frameId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(frameId)
  }, [curve])

  return (
    <group>
      <Line
        points={linePoints}
        color={active ? '#ff4f9a' : '#79dfff'}
        lineWidth={active ? 2.1 : 1.2}
        transparent
        opacity={active ? 1 : 0.6}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(launch.id)
        }}
      />
      <mesh
        position={linePoints[0]}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(launch.id)
        }}
      >
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color={active ? '#ff5fa6' : '#9cecff'} emissive="#9cecff" />
      </mesh>
      {active && (
        <mesh ref={markerRef}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#ffe86f" emissive="#ffd95e" emissiveIntensity={0.75} />
        </mesh>
      )}
    </group>
  )
}

export function LaunchLayer({ launches = [], visible, selectedLaunchId, onSelect }) {
  if (!visible) return null

  return (
    <group>
      {launches.map((launch) => (
        <LaunchPath
          key={launch.id}
          launch={launch}
          active={selectedLaunchId === launch.id}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}
