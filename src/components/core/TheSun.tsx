"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "framer-motion";

// ============================================================================
// GLSL SHADERS (Otimizado)
// ============================================================================

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vNormalView;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vNormalView = normalize(normalMatrix * normal);
    vPosition = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
    vWorldPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const getFragmentShader = (isMobile: boolean) => `
  uniform float u_time;
  uniform vec3 u_colorHot;
  uniform vec3 u_colorMid;
  uniform vec3 u_colorCold;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vNormalView;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  float random(in vec3 st) {
    return fract(sin(dot(st, vec3(12.9898, 78.233, 23.112))) * 12943.145);
  }

  float noise(in vec3 _pos) {
    vec3 i_pos = floor(_pos);
    vec3 f_pos = fract(_pos);
    float i_time = floor(u_time * 0.15);
    float f_time = fract(u_time * 0.15);
    float aa = random(i_pos + i_time);
    float ab = random(i_pos + i_time + vec3(1., 0., 0.));
    float ac = random(i_pos + i_time + vec3(0., 1., 0.));
    float ad = random(i_pos + i_time + vec3(1., 1., 0.));
    float ae = random(i_pos + i_time + vec3(0., 0., 1.));
    float af = random(i_pos + i_time + vec3(1., 0., 1.));
    float ag = random(i_pos + i_time + vec3(0., 1., 1.));
    float ah = random(i_pos + i_time + vec3(1., 1., 1.));
    float ba = random(i_pos + (i_time + 1.));
    float bb = random(i_pos + (i_time + 1.) + vec3(1., 0., 0.));
    float bc = random(i_pos + (i_time + 1.) + vec3(0., 1., 0.));
    float bd = random(i_pos + (i_time + 1.) + vec3(1., 1., 0.));
    float be = random(i_pos + (i_time + 1.) + vec3(0., 0., 1.));
    float bf = random(i_pos + (i_time + 1.) + vec3(1., 0., 1.));
    float bg = random(i_pos + (i_time + 1.) + vec3(0., 1., 1.));
    float bh = random(i_pos + (i_time + 1.) + vec3(1., 1., 1.));
    vec3 t = smoothstep(0., 1., f_pos);
    float t_time = smoothstep(0., 1., f_time);
    return mix(
      mix(mix(mix(aa, ab, t.x), mix(ac, ad, t.x), t.y), mix(mix(ae, af, t.x), mix(ag, ah, t.x), t.y), t.z),
      mix(mix(mix(ba, bb, t.x), mix(bc, bd, t.x), t.y), mix(mix(be, bf, t.x), mix(bg, bh, t.x), t.y), t.z),
      t_time
    );
  }

  #define NUM_OCTAVES ${isMobile ? 3 : 4}
  
  float fBm(in vec3 _pos, in float sz) {
    float v = 0.0;
    float a = 0.25;
    _pos *= sz;
    vec3 angle = vec3(-0.0008 * u_time, 0.0006 * u_time, 0.0003 * u_time);
    mat3 rotx = mat3(1, 0, 0, 0, cos(angle.x), -sin(angle.x), 0, sin(angle.x), cos(angle.x));
    mat3 roty = mat3(cos(angle.y), 0, sin(angle.y), 0, 1, 0, -sin(angle.y), 0, cos(angle.y));
    mat3 rotz = mat3(cos(angle.z), -sin(angle.z), 0, sin(angle.z), cos(angle.z), 0, 0, 0, 1);
    for (int i = 0; i < NUM_OCTAVES; ++i) {
      v += a * noise(_pos);
      _pos = rotx * roty * rotz * _pos * 2.0;
      a *= 0.75;
    }
    return v;
  }

  void main() {
    vec3 st = vWorldPosition;
    vec3 q = vec3(0.);
    q.x = fBm(st, 4.);
    q.y = fBm(st + vec3(1.2, 3.2, 1.52), 4.);
    q.z = fBm(st + vec3(0.02, 0.12, 0.152), 4.);
    float n = fBm(st + q + vec3(1.82, 1.32, 1.09), 4.);
    vec3 color = vec3(0.);
    color = mix(u_colorMid, u_colorHot, n * n);
    color = mix(color, u_colorCold, q * 0.6);
    float fresnelTerm_inner = 0.2 - 0.7 * min(dot(vPosition, vNormalView), 0.0);
    fresnelTerm_inner = pow(fresnelTerm_inner, 4.0);
    float fresnelTerm_outer = 1.0 + dot(normalize(vPosition), normalize(vNormalView));
    fresnelTerm_outer = pow(fresnelTerm_outer, 2.5);
    float fresnelTerm = fresnelTerm_inner + fresnelTerm_outer * 0.3;
    float raw_intensity = max(dot(vPosition, vNormalView), 0.);
    float glow = pow(raw_intensity, 3.0) * 0.5;
    vec3 finalColor = color * 1.4 + fresnelTerm * u_colorHot * 0.15 + glow * u_colorHot * 0.1;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function SunSphere({ madeForMobile }: { madeForMobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_colorHot: { value: new THREE.Color("#e8e8e8") },  // Cinza claro/prata
    u_colorMid: { value: new THREE.Color("#8a8a8a") },  // Cinza médio
    u_colorCold: { value: new THREE.Color("#4a4a4a") }, // Cinza escuro
  }), []);
  const fragmentShader = useMemo(() => getFragmentShader(madeForMobile), [madeForMobile]);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, madeForMobile ? 32 : 48, madeForMobile ? 32 : 48]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
}

// Inner glow atmosphere
const innerAtmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const innerAtmosphereFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
    // Gold/amber inner glow - #d4af37
    vec3 color = vec3(0.831, 0.686, 0.216);
    gl_FragColor = vec4(color, intensity * 0.8);
  }
`;

// Outer glow - soft feathered edge
const outerGlowVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const outerGlowFragmentShader = `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.4 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
    // Purple/violet glow - #8b5cf6 mixed with pink #ec4899
    vec3 color = mix(vec3(0.545, 0.361, 0.965), vec3(0.925, 0.282, 0.6), 0.3);
    float alpha = intensity * 0.5;
    gl_FragColor = vec4(color, alpha);
  }
`;

// Corona effect - very soft outer halo
const coronaVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const coronaFragmentShader = `
  varying vec3 vNormal;
  uniform float u_time;
  void main() {
    float intensity = pow(0.25 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
    // Animated pulsing with color cycling between gold and pink
    float pulse = 0.8 + 0.2 * sin(u_time * 0.5);
    float colorShift = 0.5 + 0.5 * sin(u_time * 0.2);
    // Mix between gold #d4af37 and pink #ec4899
    vec3 gold = vec3(0.831, 0.686, 0.216);
    vec3 pink = vec3(0.925, 0.282, 0.6);
    vec3 color = mix(gold, pink, colorShift) * pulse;
    float alpha = intensity * 0.4;
    gl_FragColor = vec4(color, alpha);
  }
`;

// Nebula haze - extremely soft blend with background  
const nebulaHazeVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaHazeFragmentShader = `
  varying vec3 vNormal;
  uniform float u_time;
  void main() {
    float intensity = pow(0.15 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
    float flicker = 0.9 + 0.1 * sin(u_time * 0.3 + 1.5);
    // Cycle through purple #8b5cf6, blue #3b82f6, teal #14b8a6
    float t = fract(u_time * 0.1);
    vec3 purple = vec3(0.545, 0.361, 0.965);
    vec3 blue = vec3(0.231, 0.51, 0.965);
    vec3 teal = vec3(0.078, 0.722, 0.651);
    vec3 color;
    if (t < 0.33) {
      color = mix(purple, blue, t * 3.0);
    } else if (t < 0.66) {
      color = mix(blue, teal, (t - 0.33) * 3.0);
    } else {
      color = mix(teal, purple, (t - 0.66) * 3.0);
    }
    color *= flicker;
    float alpha = intensity * 0.2;
    gl_FragColor = vec4(color, alpha);
  }
`;

function InnerAtmosphere({ isMobile }: { isMobile: boolean }) {
  return (
    <mesh scale={[1.08, 1.08, 1.08]}>
      <sphereGeometry args={[1, isMobile ? 32 : 48, isMobile ? 32 : 48]} />
      <shaderMaterial
        vertexShader={innerAtmosphereVertexShader}
        fragmentShader={innerAtmosphereFragmentShader}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function OuterGlow({ isMobile }: { isMobile: boolean }) {
  return (
    <mesh scale={[1.25, 1.25, 1.25]}>
      <sphereGeometry args={[1, isMobile ? 24 : 32, isMobile ? 24 : 32]} />
      <shaderMaterial
        vertexShader={outerGlowVertexShader}
        fragmentShader={outerGlowFragmentShader}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function Corona({ isMobile }: { isMobile: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh scale={[1.5, 1.5, 1.5]}>
      <sphereGeometry args={[1, isMobile ? 24 : 32, isMobile ? 24 : 32]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={coronaVertexShader}
        fragmentShader={coronaFragmentShader}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function NebulaHaze({ isMobile }: { isMobile: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh scale={[1.85, 1.85, 1.85]}>
      <sphereGeometry args={[1, isMobile ? 16 : 24, isMobile ? 16 : 24]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={nebulaHazeVertexShader}
        fragmentShader={nebulaHazeFragmentShader}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

interface TheSunProps {
  onClick: () => void;
}

export function TheSun({ onClick }: TheSunProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <motion.div
      className="w-[320px] h-[320px] md:w-[520px] md:h-[520px] cursor-pointer relative z-10"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        // CSS blur on the container edges for extra blending
        filter: 'drop-shadow(0 0 30px rgba(255, 150, 50, 0.4)) drop-shadow(0 0 60px rgba(255, 100, 20, 0.2))',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.1} />

        {/* Layer 5 (outermost): Nebula Haze - extremely soft blend */}
        <NebulaHaze isMobile={isMobile} />

        {/* Layer 4: Corona - animated soft halo */}
        <Corona isMobile={isMobile} />

        {/* Layer 3: Outer Glow - feathered edge */}
        <OuterGlow isMobile={isMobile} />

        {/* Layer 2: Inner Atmosphere */}
        <InnerAtmosphere isMobile={isMobile} />

        {/* Layer 1 (innermost): The Sun Core */}
        <SunSphere madeForMobile={isMobile} />
      </Canvas>

      {/* Click Hint Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white/20 text-xs font-mono tracking-[0.5em] animate-pulse">ACESSAR NÚCLEO</span>
      </div>
    </motion.div>
  );
}
