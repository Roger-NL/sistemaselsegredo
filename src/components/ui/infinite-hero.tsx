"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// ============================================================================
// OPTIMIZED NEBULA SHADER (Domain Warping)
// ============================================================================

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_resolution;

  // Colors
  uniform vec3 u_c1; // #1C0B19 (Deep Purple)
  uniform vec3 u_c2; // #2E933C (Green)
  uniform vec3 u_c3; // #EEF4D4 (Pale Green)
  uniform vec3 u_c4; // #D4AF37 (Gold)

  // --- Fast Noise (Hash based) ---
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  
  float noise(vec2 x) {
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 57.0;
    return mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
               mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y);
  }

  // --- FBM (Fractal Brownian Motion) ---
  // Reduced octaves for performance (4 is enough for background)
  float fbm(vec2 p) {
    float f = 0.0;
    float amp = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 4; i++) {
      f += amp * noise(p);
      p = m * p;
      amp *= 0.5;
    }
    return f;
  }

  void main() {
    // Center coordinates: (0,0) is in the middle of the screen
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;
    
    // Slow time
    float t = u_time * 0.15;

    // --- Domain Warping (The "Nebula" Effect) ---
    // We distort the coordinate space recursively to create fluid-like swirls
    
    // Layer 1: Base distortion
    vec2 q = vec2(0.);
    q.x = fbm(uv + 0.00 * t);
    q.y = fbm(uv + vec2(1.0));

    // Layer 2: Secondary distortion
    vec2 r = vec2(0.);
    r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t);
    r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t);

    // Final Noise Value
    float f = fbm(uv + r);

    // --- Color Mixing ---
    // Start with Deep Void
    vec3 color = u_c1 * 0.2; 
    
    // Add Green/Nebula details
    color = mix(color, u_c2, clamp(f * f * 4.0, 0.0, 1.0));
    
    // Add Pale/Gold Highlights based on flow intensity
    color = mix(color, u_c4, clamp(length(q), 0.0, 1.0));
    color = mix(color, u_c3, clamp(r.x, 0.0, 1.0));

    // --- Masking / Vignette ---
    // Ensure the nebula is only in the center behind the sun and fades to black edges
    float dist = length(uv);
    float mask = 1.0 - smoothstep(0.2, 1.2, dist); // Fade out from center
    
    // Boost center brightness slightly
    color = color * mask * 1.5;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    u_c1: { value: new THREE.Color("#1C0B19") },
    u_c2: { value: new THREE.Color("#2E933C") },
    u_c3: { value: new THREE.Color("#EEF4D4") },
    u_c4: { value: new THREE.Color("#D4AF37") },
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = state.clock.elapsedTime;
      material.uniforms.u_resolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

interface InfiniteHeroProps {
  className?: string;
}

export function InfiniteHero({ className }: InfiniteHeroProps) {
  return (
    <div className={`absolute inset-0 w-full h-full bg-black ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]} // Optimization: Max pixel ratio 1.5
        gl={{ alpha: false, antialias: false, powerPreference: "default" }}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
}