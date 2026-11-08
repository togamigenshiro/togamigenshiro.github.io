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
import { weaponPose, DRAW_DURATION, SHEATHE_DURATION } from "@/lib/blade-motion";

type State = "intro" | "sheathed" | "drawn";

/** Center the two complete supplied models in the same display space. */
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
    const center = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
    root.children.forEach((object) => { object.position.sub(center); });
    return root;
  }, [scene, sheath]);
}

type Hover = (p: { x: number; y: number } | null) => void;

function Katanas({ state, onRose, onHover, reduced }: { state: State; onRose: () => void; onHover: Hover; reduced: boolean }) {
  const seated = useKatanaPart(SHEATHED_URL, true);
  const blade = useKatanaPart(BLADE_URL);
  const assembly = useRef<THREE.Group>(null);
  const elapsed = useRef(SHEATHE_DURATION);
  const previousState = useRef<State>("intro");
  useEffect(() => {
    elapsed.current = previousState.current === "intro" ? SHEATHE_DURATION : 0;
    previousState.current = state;
  }, [state]);
  useFrame((_, raw) => {
    elapsed.current += raw;
    const drawing = state === "drawn";
    const pose = weaponPose(reduced ? (drawing ? DRAW_DURATION : SHEATHE_DURATION) : elapsed.current, drawing);
    seated.visible = !pose.drawn;
    blade.visible = pose.drawn;
    if (assembly.current) {
      assembly.current.scale.set(0.95 * pose.scale, 0.95, 0.95);
      assembly.current.position.x = pose.offset;
      assembly.current.rotation.z = -0.035;
      const canvas = assembly.current.userData['canvas'] as HTMLCanvasElement | undefined;
      if (canvas) canvas.dataset['visibleWeapon'] = pose.drawn ? "drawn" : "sheathed";
    }
  });
  const out = () => { document.body.style.cursor = ""; onHover(null); };
  const canvas = useThree((s) => s.gl.domElement);
  return (
    <group ref={assembly} scale={0.95} userData={{ canvas }}
      onPointerMove={(event) => {
        const local = assembly.current?.worldToLocal(event.point.clone());
        if (!local || Math.abs(local.x + 0.95) > 0.4) return out();
        event.stopPropagation(); document.body.style.cursor = "pointer";
        onHover({ x: event.nativeEvent.clientX, y: event.nativeEvent.clientY });
      }}
      onPointerOut={out}
      onClick={(event) => {
        const local = assembly.current?.worldToLocal(event.point.clone());
        if (!local || Math.abs(local.x + 0.95) > 0.4) return;
        event.stopPropagation(); out(); onRose();
      }}>
      <primitive object={seated} visible={state !== "drawn"} />
      <primitive object={blade} visible={state === "drawn"} />
    </group>
  );
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
    const speed = active || reduced ? 0 : 0.8;
    controls.autoRotateSpeed = THREE.MathUtils.damp(controls.autoRotateSpeed, speed, 3, dt);
    controls.autoRotate = !reduced && controls.autoRotateSpeed > 0.001;
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
    timers.current.push(setTimeout(() => sounds.current.push(playMotionCue("draw")), reduced ? 0 : drawingOut ? 160 : 180));
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

      <div className="absolute inset-x-0 bottom-32 flex flex-col items-center gap-3 md:bottom-14">
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
