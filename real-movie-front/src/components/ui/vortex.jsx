import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { createNoise3D } from "simplex-noise";
import { motion } from "framer-motion";

export const Vortex = (props) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particleCount = props.particleCount || 1000; // Reduced particle count
  const particlePropCount = 10;
  const particlePropsLength = particleCount * particlePropCount;
  const rangeY = props.rangeY || 200;
  const baseTTL = 100;  
  const rangeTTL = 150;
  const baseSpeed = props.baseSpeed || 0.0;
  const rangeSpeed = props.rangeSpeed || 1.5;
  const baseRadius = props.baseRadius || 1;
  const rangeRadius = props.rangeRadius || 2;
  const baseHue = props.baseHue || 220;
  const rangeHue = 100;
  const noiseSteps = 3;
  const xOff = 0.00125;
  const yOff = 0.00125;
  const zOff = 0.0005;
  const backgroundColor = props.darkMode ? "#000000" : "#ffffff";
  
  // Memoize constants
  const constants = useMemo(() => ({
    HALF_PI: 0.5 * Math.PI,
    TAU: 2 * Math.PI,
    TO_RAD: Math.PI / 180
  }), []);

  // Memoize noise3D
  const noise3D = useMemo(() => createNoise3D(), []);
  
  // Use refs for mutable state
  const tickRef = useRef(0);
  const particlePropsRef = useRef(new Float32Array(particlePropsLength));
  const centerRef = useRef([0, 0]);

  // Memoize utility functions
  const utils = useMemo(() => ({
    rand: n => n * Math.random(),
    randRange: n => n - (n * Math.random() * 2),
    fadeInOut: (t, m) => {
      let hm = 0.5 * m;
      return Math.abs(((t + hm) % m) - hm) / hm;
    },
    lerp: (n1, n2, speed) => (1 - speed) * n1 + speed * n2
  }), []);

  const initParticle = useCallback((i) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let x = utils.rand(canvas.width);
    let y = centerRef.current[1] + utils.randRange(rangeY);
    let vx = 0;
    let vy = 0;
    let life = 0;
    let ttl = baseTTL + utils.rand(rangeTTL);
    let speed = baseSpeed + utils.rand(rangeSpeed);
    let radius = baseRadius + utils.rand(rangeRadius);
    let hue = baseHue + utils.rand(rangeHue);

    particlePropsRef.current.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
  }, [utils, rangeY, baseTTL, rangeTTL, baseSpeed, rangeSpeed, baseRadius, rangeRadius, baseHue, rangeHue]);

  const drawParticle = useCallback((x, y, x2, y2, life, ttl, radius, hue, ctx) => {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineWidth = radius;
    const opacity = props.darkMode ? utils.fadeInOut(life, ttl) : utils.fadeInOut(life, ttl) * 0.8;
    ctx.strokeStyle = `hsla(${hue},100%,60%,${opacity})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }, [props.darkMode, utils]);

  const updateParticle = useCallback((i, ctx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let i2 = 1 + i,
        i3 = 2 + i,
        i4 = 3 + i,
        i5 = 4 + i,
        i6 = 5 + i,
        i7 = 6 + i,
        i8 = 7 + i,
        i9 = 8 + i;

    let x = particlePropsRef.current[i];
    let y = particlePropsRef.current[i2];
    let n = noise3D(x * xOff, y * yOff, tickRef.current * zOff) * noiseSteps * constants.TAU;
    let vx = utils.lerp(particlePropsRef.current[i3], Math.cos(n), 0.5);
    let vy = utils.lerp(particlePropsRef.current[i4], Math.sin(n), 0.5);
    let life = particlePropsRef.current[i5];
    let ttl = particlePropsRef.current[i6];
    let speed = particlePropsRef.current[i7];
    let x2 = x + vx * speed;
    let y2 = y + vy * speed;
    let radius = particlePropsRef.current[i8];
    let hue = particlePropsRef.current[i9];

    drawParticle(x, y, x2, y2, life, ttl, radius, hue, ctx);

    life++;

    particlePropsRef.current[i] = x2;
    particlePropsRef.current[i2] = y2;
    particlePropsRef.current[i3] = vx;
    particlePropsRef.current[i4] = vy;
    particlePropsRef.current[i5] = life;

    (checkBounds(x, y, canvas) || life > ttl) && initParticle(i);
  }, [constants.TAU, drawParticle, initParticle, noise3D, utils, xOff, yOff, zOff]);

  const checkBounds = (x, y, canvas) => {
    return x > canvas.width || x < 0 || y > canvas.height || y < 0;
  };

  const resize = useCallback((canvas, ctx) => {
    const { innerWidth, innerHeight } = window;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.scale(dpr, dpr);

    centerRef.current = [0.5 * innerWidth, 0.5 * innerHeight];
  }, []);

  const renderGlow = useCallback((canvas, ctx) => {
    const glowBrightness = props.darkMode ? "200%" : "150%";
    
    ctx.save();
    ctx.filter = `blur(8px) brightness(${glowBrightness})`;
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.filter = `blur(4px) brightness(${glowBrightness})`;
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  }, [props.darkMode]);

  const draw = useCallback((canvas, ctx) => {
    tickRef.current++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw particles in batches
    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      updateParticle(i, ctx);
    }

    renderGlow(canvas, ctx);

    animationFrameRef.current = requestAnimationFrame(() => draw(canvas, ctx));
  }, [backgroundColor, particlePropsLength, renderGlow, updateParticle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !ctx) return;

    resize(canvas, ctx);
    
    // Initialize particles
    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      initParticle(i);
    }

    draw(canvas, ctx);

    const handleResize = () => resize(canvas, ctx);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw, initParticle, particlePropsLength, resize, props.darkMode]);

  return (
    <div className={cn("relative h-full w-full", props.containerClassName)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        ref={containerRef}
        className="absolute h-full w-full inset-0 z-0 bg-transparent flex items-center justify-center">
        <canvas ref={canvasRef}></canvas>
      </motion.div>
      <div className={cn("relative z-10", props.className)}>
        {props.children}
      </div>
    </div>
  );
};