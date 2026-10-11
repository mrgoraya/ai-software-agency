"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { scrollState } from "@/lib/scrollState";

const NODE_COUNT = 120;
const LINK_DISTANCE = 1.2;
const CAM_DISTANCE = 9;
const FOV = 38;
const TUNNEL_LENGTH = 40; // how far the camera flies over the whole page
const RING_COUNT = 10;
const STAR_COUNT = 1500;

// Per-section targets for the forge object, indexed by section (see data-section in the page).
// x is a fraction of visible width, y and s are fractions of visible height.
const KF = {
  x: [0, -0.3, 0.3, -0.3, 0.3, -0.3, 0.3, -0.3, 0.3, 0],
  y: [0.235, 0, 0, 0, 0, 0, 0, 0, 0, 0.06],
  s: [0.064, 0.1, 0.1, 0.095, 0.1, 0.095, 0.1, 0.095, 0.1, 0.12],
};

function sample(arr: number[], idx: number) {
  const i = Math.max(0, Math.min(Math.floor(idx), arr.length - 2));
  const f = Math.max(0, Math.min(1, idx - i));
  const t = f * f * (3 - 2 * f);
  return arr[i] + (arr[i + 1] - arr[i]) * t;
}

/** Studio lighting for the metal core, generated locally (no HDR download). */
function Studio() {
  const gl = useThree((s) => s.gl);
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return texture;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  return <primitive object={env} attach="environment" />;
}

/** Rings the camera flies through as the page scrolls. */
function Tunnel({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const rings = useMemo(
    () =>
      Array.from({ length: RING_COUNT }, (_, i) => ({
        z: -4 - i * 5.2,
        r: 5.2 + (i % 3) * 0.9,
        amber: i % 4 === 2,
      })),
    [],
  );

  useFrame((_, delta) => {
    if (reduced || !group.current) return;
    group.current.children.forEach((c, i) => {
      c.rotation.z += delta * 0.06 * (i % 2 ? 1 : -1);
    });
  });

  return (
    <group ref={group}>
      {rings.map((ring, i) => (
        <mesh key={i} position={[0, 0, ring.z]} rotation={[0, 0, i * 0.7]}>
          <torusGeometry args={[ring.r, ring.amber ? 0.03 : 0.016, 8, 140, Math.PI * 1.7]} />
          <meshBasicMaterial color={ring.amber ? "#ffb347" : "#6f87b5"} transparent opacity={ring.amber ? 0.55 : 0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Starfield() {
  const positions = useMemo(() => {
    const arr = new Float32Array(STAR_COUNT * 3);
    // Deterministic pseudo-random so the field is stable between renders.
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < STAR_COUNT; i++) {
      arr[i * 3] = (rnd() - 0.5) * 60;
      arr[i * 3 + 1] = (rnd() - 0.5) * 34;
      arr[i * 3 + 2] = 10 - rnd() * 62;
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#9fb6d8" transparent opacity={0.75} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Forge({ reduced }: { reduced: boolean }) {
  const root = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const nodes = useRef<THREE.InstancedMesh>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const size = useThree((s) => s.size);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Nodes on a shell of three slightly different radii, linked to near neighbours.
  const { points, linePositions } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < NODE_COUNT; i++) {
      const y = 1 - (i / (NODE_COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const radius = 2.5 + (i % 3) * 0.2;
      pts.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
    }
    const lines: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < LINK_DISTANCE) {
          lines.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
        }
      }
    }
    return { points: pts, linePositions: new Float32Array(lines) };
  }, []);

  useEffect(() => {
    const mesh = nodes.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    points.forEach((p, i) => {
      dummy.position.copy(p);
      dummy.scale.setScalar(i % 7 === 0 ? 1.9 : 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [points]);

  useFrame((state, delta) => {
    const g = root.current;
    if (!g) return;

    const aspect = size.width / size.height;
    const landscape = aspect > 1;
    const H = 2 * CAM_DISTANCE * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const W = H * aspect;
    const k = 1 - Math.pow(0.002, delta); // frame-rate independent easing
    const { idx, p } = scrollState;

    // Camera flies down the tunnel with scroll, with a little pointer sway.
    const cam = state.camera;
    const camZ = CAM_DISTANCE - p * TUNNEL_LENGTH;
    cam.position.z += (camZ - cam.position.z) * k;
    cam.position.x += (pointer.current.x * 0.5 + Math.sin(p * 7) * 0.5 - cam.position.x) * k;
    cam.position.y += (-pointer.current.y * 0.3 - cam.position.y) * k;
    cam.lookAt(cam.position.x * 0.3, cam.position.y * 0.3, cam.position.z - 10);

    // Forge stays a fixed distance ahead of the camera and drifts per section.
    let tx: number;
    let ty: number;
    let scale: number;
    if (landscape) {
      tx = sample(KF.x, idx) * W;
      ty = sample(KF.y, idx) * H;
      scale = Math.min(sample(KF.s, idx) * H, W / 9.5);
    } else {
      tx = 0;
      ty = H * (idx < 1 ? 0.27 - idx * 0.15 : 0.12);
      scale = Math.min(sample(KF.s, idx) * H, W / 12);
    }
    g.position.x += (tx - g.position.x) * k;
    g.position.y += (ty - g.position.y) * k;
    g.position.z = cam.position.z - CAM_DISTANCE;
    g.scale.setScalar(g.scale.x + (scale - g.scale.x) * k);
    g.rotation.x += (pointer.current.y * 0.28 - g.rotation.x) * k;

    scrollState.vel *= Math.pow(0.03, delta);

    if (!reduced) {
      const boost = Math.min(Math.abs(scrollState.vel), 80) * 0.012;
      if (spin.current) spin.current.rotation.y += delta * (0.12 + boost);
      if (core.current) {
        core.current.rotation.y -= delta * (0.25 + boost);
        core.current.rotation.x += delta * 0.1;
        core.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.025);
      }
    }
  });

  return (
    <group ref={root} scale={0.001}>
      <group ref={spin}>
        <mesh ref={core}>
          <icosahedronGeometry args={[1.25, 1]} />
          <meshPhysicalMaterial
            color="#dfe5ee"
            metalness={1}
            roughness={0.16}
            clearcoat={1}
            clearcoatRoughness={0.1}
            flatShading
            envMapIntensity={1.3}
          />
        </mesh>

        <mesh>
          <icosahedronGeometry args={[1.75, 1]} />
          <meshBasicMaterial color="#9fb6d8" wireframe transparent opacity={0.22} />
        </mesh>

        <mesh rotation={[0.95, 0.45, 0]}>
          <torusGeometry args={[2.05, 0.014, 8, 160]} />
          <meshBasicMaterial color="#ffb347" transparent opacity={0.7} />
        </mesh>

        <instancedMesh ref={nodes} args={[undefined, undefined, NODE_COUNT]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial color="#f3f6ff" />
        </instancedMesh>

        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#8fb0ff" transparent opacity={0.28} />
        </lineSegments>
      </group>
    </group>
  );
}

export default function Scene({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, CAM_DISTANCE], fov: FOV, near: 0.1, far: 80 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <fog attach="fog" args={["#000000", 12, 46]} />
      <Studio />
      <ambientLight intensity={0.25} />
      <pointLight position={[5, 4, 6]} intensity={60} color="#cfe0ff" />
      <pointLight position={[-6, -3, -4]} intensity={40} color="#ffb347" />
      <Starfield />
      <Tunnel reduced={reduced} />
      <Forge reduced={reduced} />
    </Canvas>
  );
}
