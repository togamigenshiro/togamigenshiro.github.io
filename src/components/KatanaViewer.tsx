import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";
import { Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
const SHEATHED_URL = "/models/katana-sheathed.glb";
const BLADE_URL = "/models/katana-blade.glb";
import { playMotionCue } from "@/lib/sfx";
import { scrollToId } from "@/lib/scroll";
import { bladeTravel, DRAW_DURATION, SHEATHE_DURATION } from "@/lib/blade-motion";

type State = "intro" | "sheathed" | "drawn";

/** Bake the supplied meshes into one coordinate system; retain only the saya half of the seated asset. */
function useKatanaPart(url: string, sheath = false) {
  const { scene } = useGLTF(url);
  return useMemo(() => {
    scene.updateMatrixWorld(true);
    const root = new THREE.Group();
    const bounds = new THREE.Box3().setFromObject(scene);
    const scale = 4.2 / (bounds.max.x - bounds.min.x);
    const transform = new THREE.Matrix4().makeScale(scale, scale, scale);
    if (!sheath) transform.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const geometry = object.geometry.clone();
      // Quantized GLBs store normalized integers; matrix transforms need writable floats.
      for (const name of ["position", "normal"]) {
        const attribute = geometry.getAttribute(name);
        if (!attribute) continue;
        const values = new Float32Array(attribute.count * 3);
        for (let i = 0; i < attribute.count; i++) {
          values[i * 3] = attribute.getX(i);
          values[i * 3 + 1] = attribute.getY(i);
          values[i * 3 + 2] = attribute.getZ(i);
        }
        geometry.setAttribute(name, new THREE.BufferAttribute(values, 3));
      }
      geometry.applyMatrix4(object.matrixWorld);
      geometry.applyMatrix4(transform);
      if (sheath) {
        const positions = geometry.getAttribute("position");
        const source = geometry.index;
        const kept: number[] = [];
        const count = source ? source.count : positions.count;
        for (let i = 0; i < count; i += 3) {
          const a = source ? source.getX(i) : i;
          const b = source ? source.getX(i + 1) : i + 1;
          const c = source ? source.getX(i + 2) : i + 2;
          if ((positions.getX(a) + positions.getX(b) + positions.getX(c)) / 3 > -0.71) kept.push(a, b, c);
        }
        geometry.setIndex(kept);
      } else geometry.translate(-0.045, 0.035, 0.01);
      const original = Array.isArray(object.material) ? object.material : [object.material];
      const materials = original.map((material) => {
        const copy = material.clone();
        copy.transparent = false;
        copy.opacity = 1;
        copy.depthWrite = true;
        if (copy instanceof THREE.MeshStandardMaterial && !sheath) {
          copy.envMapIntensity = 1.35;
          copy.roughness = Math.max(0.3, copy.roughness);
        }
        return copy;
      });
      root.add(new THREE.Mesh(geometry, materials.length === 1 ? materials[0] : materials));
    });
    return root;
  }, [scene, sheath]);
}

type Hover = (p: { x: number; y: number } | null) => void;

function Katanas({ state, onRose, onHover, reduced }: { state: State; onRose: () => void; onHover: Hover; reduced: boolean }) {
  const sheath = useKatanaPart(SHEATHED_URL, true);
  const blade = useKatanaPart(BLADE_URL);
  const assembly = useRef<THREE.Group>(null);
  const moving = useRef<THREE.Group>(null);
  const highlight = useRef<THREE.SpotLight>(null);
  const mouthPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), -0.7), []);
  useEffect(() => {
    blade.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => { material.clippingPlanes = [mouthPlane]; material.needsUpdate = true; });
    });
  }, [blade, mouthPlane]);
  const elapsed = useRef(SHEATHE_DURATION);
  useEffect(() => { elapsed.current = state === "intro" ? SHEATHE_DURATION : 0; }, [state]);
  useFrame((_, raw) => {
    elapsed.current += raw;
    const drawn = state === "drawn";
    const amount = reduced ? (drawn ? 1 : 0) : bladeTravel(elapsed.current, drawn);
    if (moving.current) moving.current.position.x = -amount * 3.05;
    if (assembly.current) {
      assembly.current.position.x = amount * 1.22;
      // No twisting during insertion: the steel stays aligned with the mouth.
      assembly.current.rotation.z = -0.035;
      assembly.current.updateMatrixWorld(true);
      mouthPlane.set(new THREE.Vector3(-1, 0, 0), -0.7).applyMatrix4(assembly.current.matrixWorld);
    }
    if (highlight.current) {
      highlight.current.position.x = -3.3 + amount * 4.5;
      highlight.current.intensity = 5 + Math.sin(amount * Math.PI) * 4;
    }
  });
  const out = () => { document.body.style.cursor = ""; onHover(null); };
  return <>
    <spotLight ref={highlight} position={[-3, 2, 3]} angle={0.28} penumbra={0.8} intensity={6} />
    <group ref={assembly} scale={0.8}>
      <primitive object={sheath} />
      <group ref={moving}
        onPointerMove={(event) => {
          const local = moving.current?.worldToLocal(event.point.clone());
          if (!local || Math.abs(local.x + 0.95) > 0.4) return out();
          event.stopPropagation(); document.body.style.cursor = "pointer";
          onHover({ x: event.nativeEvent.clientX, y: event.nativeEvent.clientY });
        }}
        onPointerOut={out}
        onClick={(event) => {
          const local = moving.current?.worldToLocal(event.point.clone());
          if (!local || Math.abs(local.x + 0.95) > 0.4) return;
          event.stopPropagation(); out(); onRose();
        }}>
        <primitive object={blade} />
      </group>
    </group>
  </>;
}

/** Pause rotation during blade movement without snapping the user's chosen view. */
function CamRig({ settle, reduced }: { settle: React.MutableRefObject<number>; reduced: boolean }) {
  const controls = useThree((st) => st.controls) as unknown as OrbitImpl | null;
  const camera = useThree((st) => st.camera);
  const width = useThree((st) => st.size.width);
  const height = useThree((st) => st.size.height);
  useEffect(() => {
    const distance = Math.max(6.4, 6.6 / (2 * Math.tan(THREE.MathUtils.degToRad(20)) * width / height));
    camera.position.setLength(distance);
    controls?.update();
  }, [camera, controls, width, height]);
  useFrame((_, raw) => {
    if (!controls) return;
    const dt = Math.min(raw, 0.05);
    const active = settle.current > 0;
    controls.autoRotate = !active && !reduced;
    if (!active) return;
    settle.current -= dt;
  });
  return null;
}

function Loader() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="font-brush animate-pulse text-5xl text-primary">刀</p>
        <p className="mt-2 font-display text-xs tracking-[0.4em] text-gold">{Math.round(progress)}%</p>
      </div>
  );
}

export default function KatanaViewer() {
  const [state, setState] = useState<State>("intro");
  const settle = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const reduced = !!useReducedMotion();
  const { active: loading } = useProgress();
  const [drawing, setDrawing] = useState(false);
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sounds = useRef<(() => void)[]>([]);
  const onHover: Hover = (p) => {
    if (!p || !box.current) return setTip(null);
    const r = box.current.getBoundingClientRect();
    setTip({ x: p.x - r.left, y: p.y - r.top });
  };

  useEffect(() => {
    const a = setTimeout(() => setState("sheathed"), 300);
    return () => {
      clearTimeout(a);
      timers.current.forEach(clearTimeout);
      sounds.current.forEach((stop) => stop());
      document.body.style.cursor = "";
    };
  }, []);

  const toggle = () => {
    if (busy.current || loading) return;
    busy.current = true;
    setTip(null);
    setDrawing(true);
    const drawingOut = state !== "drawn";
    const duration = reduced ? 0.2 : drawingOut ? DRAW_DURATION : SHEATHE_DURATION;
    settle.current = duration + 0.1;
    sounds.current.forEach((stop) => stop());
    sounds.current = [playMotionCue("lock")];
    timers.current.forEach(clearTimeout);
    timers.current = [];
    timers.current.push(setTimeout(() => sounds.current.push(playMotionCue("draw")), reduced ? 0 : drawingOut ? 1050 : 700));
    timers.current.push(setTimeout(() => {
      sounds.current.push(playMotionCue("lock"));
      setDrawing(false);
      busy.current = false;
    }, duration * 1000));
    setState((s) => (s === "drawn" ? "sheathed" : "drawn"));
  };

  return (
    <div ref={box} className="relative h-full w-full" data-blade-state={state} data-blade-moving={drawing}>
      <Canvas gl={{ localClippingEnabled: true }} camera={{ position: [0, 0.4, 3.6], fov: 40 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[3, 4, 2]} intensity={1.6} color="#ffe2c0" />
        <directionalLight position={[-4, -1, -2]} intensity={1.2} color="#b3261e" />
        <Environment resolution={256}>
          <Lightformer intensity={2} position={[0, 4, 2]} scale={[8, 2, 1]} />
          <Lightformer intensity={1.5} color="#c0392b" position={[-4, 0, 0]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
          <Lightformer intensity={0.8} color="#e8d5b0" position={[4, 0, -2]} rotation-y={-Math.PI / 2} scale={[10, 1, 1]} />
        </Environment>
        <Suspense fallback={null}>
          <Katanas state={state} reduced={reduced} onHover={onHover} onRose={() => { if (!busy.current) scrollToId("rose-origin", true); }} />
          <CamRig settle={settle} reduced={reduced} />
        </Suspense>
        <OrbitControls enabled={!drawing} makeDefault enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} minPolarAngle={Math.PI / 3} maxPolarAngle={(2 * Math.PI) / 3} />
      </Canvas>
      <Loader />

      <div className="absolute inset-x-0 bottom-14 flex flex-col items-center gap-3">
        <Button variant="outline" size="lg" disabled={drawing || loading || state === "intro"}
          onClick={toggle}
          className="h-12 min-w-56 rounded-sm border-gold/60 bg-lacquer/70 font-display text-sm uppercase text-paper backdrop-blur hover:bg-primary hover:text-paper"
        >
          <Sword />{state === "drawn" ? "Sheathe · 納刀" : "Unsheathe · 抜刀"}
        </Button>
      </div>
      {tip && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[130%] whitespace-nowrap border border-primary/70 bg-lacquer/90 px-3 py-1.5 font-display text-xs tracking-[0.2em] text-paper shadow-lg backdrop-blur"
          style={{ left: tip.x, top: tip.y }}
        >
          🌹 Where did this rose come from? · 薔薇の由来
        </div>
      )}
      <p className="pointer-events-none absolute bottom-4 right-5 font-body text-sm italic text-paper/50">
        Model by @rosepath on Roblox
      </p>
    </div>
  );
}

useGLTF.preload(SHEATHED_URL);
useGLTF.preload(BLADE_URL);
