"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ============================================================================
// GLSL SHADERS - Based on sangillee.com tutorial
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

const fragmentShader = `
  uniform float u_time;
  uniform vec3 u_colorHot;
  uniform vec3 u_colorMid;
  uniform vec3 u_colorCold;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vNormalView;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  // 3D Random
  float random(in vec3 st) {
    return fract(sin(dot(st, vec3(12.9898, 78.233, 23.112))) * 12943.145);
  }

  // 3D Noise with time interpolation
  float noise(in vec3 _pos) {
    vec3 i_pos = floor(_pos);
    vec3 f_pos = fract(_pos);
    
    float i_time = floor(u_time * 0.15);
    float f_time = fract(u_time * 0.15);

    // Eight corners of a cube (current time)
    float aa = random(i_pos + i_time);
    float ab = random(i_pos + i_time + vec3(1., 0., 0.));
    float ac = random(i_pos + i_time + vec3(0., 1., 0.));
    float ad = random(i_pos + i_time + vec3(1., 1., 0.));
    float ae = random(i_pos + i_time + vec3(0., 0., 1.));
    float af = random(i_pos + i_time + vec3(1., 0., 1.));
    float ag = random(i_pos + i_time + vec3(0., 1., 1.));
    float ah = random(i_pos + i_time + vec3(1., 1., 1.));

    // Eight corners (next time)
    float ba = random(i_pos + (i_time + 1.));
    float bb = random(i_pos + (i_time + 1.) + vec3(1., 0., 0.));
    float bc = random(i_pos + (i_time + 1.) + vec3(0., 1., 0.));
    float bd = random(i_pos + (i_time + 1.) + vec3(1., 1., 0.));
    float be = random(i_pos + (i_time + 1.) + vec3(0., 0., 1.));
    float bf = random(i_pos + (i_time + 1.) + vec3(1., 0., 1.));
    float bg = random(i_pos + (i_time + 1.) + vec3(0., 1., 1.));
    float bh = random(i_pos + (i_time + 1.) + vec3(1., 1., 1.));

    // Smooth step
    vec3 t = smoothstep(0., 1., f_pos);
    float t_time = smoothstep(0., 1., f_time);

    // Mix 8 corners with time interpolation
    return mix(
      mix(
        mix(mix(aa, ab, t.x), mix(ac, ad, t.x), t.y),
        mix(mix(ae, af, t.x), mix(ag, ah, t.x), t.y),
        t.z
      ),
      mix(
        mix(mix(ba, bb, t.x), mix(bc, bd, t.x), t.y),
        mix(mix(be, bf, t.x), mix(bg, bh, t.x), t.y),
        t.z
      ),
      t_time
    );
  }

  // Fractal Brownian Motion
  #define NUM_OCTAVES 4
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
    
    // Domain warping for organic look
    vec3 q = vec3(0.);
    q.x = fBm(st, 4.);
    q.y = fBm(st + vec3(1.2, 3.2, 1.52), 4.);
    q.z = fBm(st + vec3(0.02, 0.12, 0.152), 4.);
    
    float n = fBm(st + q + vec3(1.82, 1.32, 1.09), 4.);
    
    // Color mixing - hot center to cold edges
    vec3 color = vec3(0.);
    color = mix(u_colorMid, u_colorHot, n * n);
    color = mix(color, u_colorCold, q * 0.6);
    
    // Fresnel effect - brighter edges
    float fresnelTerm_inner = 0.2 - 0.7 * min(dot(vPosition, vNormalView), 0.0);
    fresnelTerm_inner = pow(fresnelTerm_inner, 4.0);
    
    float fresnelTerm_outer = 1.0 + dot(normalize(vPosition), normalize(vNormalView));
    fresnelTerm_outer = pow(fresnelTerm_outer, 2.5);
    
    float fresnelTerm = fresnelTerm_inner + fresnelTerm_outer * 0.3;
    
    // Glow effect
    float raw_intensity = max(dot(vPosition, vNormalView), 0.);
    float glow = pow(raw_intensity, 3.0) * 0.5;
    
    // Combine effects
    vec3 finalColor = color * 1.4 + fresnelTerm * u_colorHot * 0.15 + glow * u_colorHot * 0.1;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// ============================================================================
// SUN SPHERE COMPONENT
// ============================================================================

function SunSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_colorHot: { value: new THREE.Color("#fffbeb") },  // Cream white
    u_colorMid: { value: new THREE.Color("#f59e0b") },  // Amber
    u_colorCold: { value: new THREE.Color("#b45309") }, // Dark orange
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

// ============================================================================
// GLOW SPHERE (Outer atmosphere)
// ============================================================================

// ============================================================================
// ATMOSPHERE SPHERE (Volumetric Glow)
// ============================================================================

const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  void main() {
    // Soft falloff
    float intensity = pow(0.35 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
    // Subtle golden glow, not solid wall
    gl_FragColor = vec4(1.0, 0.7, 0.2, 0.6) * intensity; 
  }
`;

function AtmosphereSphere() {
  return (
    // Reduced Scale (1.35x) - Just a corona/rim, not a supernova
    <mesh scale={[1.35, 1.35, 1.35]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// ============================================================================
// MAIN EXPORT - SUN SHADER COMPONENT
// ============================================================================

export function SunShader() {
  // ---------------------------------------------------------------------
  // 1️⃣  Keep the canvas perfectly square regardless of zoom/resize
  // ---------------------------------------------------------------------
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState<number>(0);

  React.useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newSize = Math.round(Math.min(rect.width, rect.height));
        if (Math.abs(newSize - size) >= 1) {
          setSize(newSize);
        }
      }
    };
    updateSize();
    // Add resize listener
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [size]);

  // ---------------------------------------------------------------------
  // 2️⃣  Render the Canvas with Atmospheric Layer
  // ---------------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-visible transition-all duration-700 ease-in-out"
    >
      {size > 0 && (
        <Canvas
          // Move camera back to ~7.0 to compensate for the 3x canvas expansion
          // This keeps the "Sun Core" the same visual size (matching the button)
          // but allows the "Atmosphere" to spill into the extra space.
          camera={{ position: [0, 0, 7.0], fov: 45 }}
          style={{ width: size, height: size, background: "transparent" }}
          dpr={Math.min(window.devicePixelRatio || 1, 1.5)}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.1} />
          {/* Atmosphere Layer (Back) */}
          <AtmosphereSphere />
          {/* Main Sun Sphere */}
          <SunSphere />
        </Canvas>
      )}
    </div>
  );
}

