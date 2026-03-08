import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { EARTH_RADIUS_UNITS } from '../constants/config'
import { latLonAltToVector3 } from '../utils/geo'

export function SatelliteLayer({ positions = [], lodMode, visible, onPick }) {
  const meshRef = useRef(null)
  const pointRef = useRef(null)

  const vectors = useMemo(
    () =>
      positions.map((entry) => ({
        ...entry,
        vector: latLonAltToVector3(entry.lat, entry.lon, entry.altitudeKm),
      })),
    [positions],
  )

  const pointCoordinates = useMemo(() => {
    const array = new Float32Array(vectors.length * 3)
    vectors.forEach((item, index) => {
      array[index * 3] = item.vector.x
      array[index * 3 + 1] = item.vector.y
      array[index * 3 + 2] = item.vector.z
    })
    return array
  }, [vectors])

  useLayoutEffect(() => {
    if (!meshRef.current || lodMode) return
    const matrix = new THREE.Matrix4()

    vectors.forEach((item, index) => {
      matrix.setPosition(item.vector)
      meshRef.current.setMatrixAt(index, matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  }, [vectors, lodMode])

  if (!visible) return null

  return (
    <group>
      {!lodMode && (
        <instancedMesh
          ref={meshRef}
          args={[null, null, vectors.length]}
          onClick={(event) => {
            event.stopPropagation()
            if (event.instanceId == null) return
            onPick?.(vectors[event.instanceId])
          }}
        >
          <sphereGeometry args={[EARTH_RADIUS_UNITS * 0.01, 7, 7]} />
          <meshStandardMaterial color="#39f3ff" emissive="#2bc9ff" emissiveIntensity={0.8} />
        </instancedMesh>
      )}
      {lodMode && (
        <points
          ref={pointRef}
          onClick={(event) => {
            event.stopPropagation()
            if (event.index == null) return
            onPick?.(vectors[event.index])
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={vectors.length}
              array={pointCoordinates}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#59e9ff"
            size={EARTH_RADIUS_UNITS * 0.014}
            sizeAttenuation
            transparent
            opacity={0.9}
          />
        </points>
      )}
    </group>
  )
}
