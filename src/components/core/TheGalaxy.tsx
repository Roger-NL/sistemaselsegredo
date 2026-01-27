"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ============================================================================
// GALAXY SHADER (Inspirado no Shadertoy, mas Otimizado)
// ============================================================================

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  
  uniform vec3 u_c1;
  uniform vec3 u_c2;
  uniform vec3 u_c3;
  uniform vec3 u_c4;

  varying vec2 vUv;

  // Simple Hash for Noise
  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  // 2D Noise
  float noise(in vec2 x) {
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 57.0;
    return mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
               mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y);
  }

  // FBM (Fractal Brownian Motion)
  float fbm(vec2 p) {
    float f = 0.0;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    f += 0.5000 * noise(p); p = m * p;
    f += 0.2500 * noise(p); p = m * p;
    f += 0.1250 * noise(p); p = m * p;
    f += 0.0625 * noise(p); p = m * p;
    return f;
  }

  void main() {
    vec2 st = vUv * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.15;

    // Distorted Flow
    float r = length(st);
    float a = atan(st.y, st.x);
    
    vec2 q = vec2(fbm(st + t * 0.2), fbm(st + vec2(1.2, 3.4) + t * 0.3));
    vec2 r_vec = vec2(fbm(st + 1.0 * q + vec2(2.3, 5.8) + 0.15 * t),
                      fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t));
    
    float f = fbm(st * 1.5 + r_vec);

    // Color Mixing
    vec3 color = mix(u_c1, u_c2, clamp(f * f * 2.5, 0.0, 1.0));
    color = mix(color, u_c3, clamp(length(q), 0.0, 1.0));
    color = mix(color, u_c4, clamp(r_vec.x, 0.0, 1.0));

    // Vignette
    float vignette = 1.0 - smoothstep(0.4, 1.5, r);
    color *= vignette * 0.9;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function GalaxyPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Cores convertidas para Vector3 (RGB 0-1)
  const colors = useMemo(() => ({
    c1: new THREE.Color("#1C0B19"), // Roxo
    c2: new THREE.Color("#2E933C"), // Verde
    c3: new THREE.Color("#EEF4D4"), // Verde Pálido
    c4: new THREE.Color("#D4AF37"), // Dourado
  }), []);

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(1, 1) },
    u_c1: { value: colors.c1 },
    u_c2: { value: colors.c2 },
    u_c3: { value: colors.c3 },
    u_c4: { value: colors.c4 },
  }), [colors]);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;
      material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    }
  });

  return (
    <mesh ref={meshRef} scale={[10, 10, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial 
        uniforms={uniforms} 
        vertexShader={vertexShader} 
        fragmentShader={fragmentShader} 
        depthWrite={false}
      />
    </mesh>
  );
}

export function TheGalaxy() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        gl={{ alpha: false, antialias: false, powerPreference: "default" }}
        dpr={[1, 1.5]} // Limit pixel ratio for performance
      >
        <GalaxyPlane />
      </Canvas>
    </div>
  );
}
