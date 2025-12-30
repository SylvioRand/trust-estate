import { useEffect, useRef } from "react";
import React from "react";

interface WaveCanvasProps {
	waveCount?: number;       // number of wave lines
	spacing?: number;         // small vertical offset per wave
	color?: string;           // main color of waves
	minAmplitude?: number;
	maxAmplitude?: number;
	thickness?: number;
};

type LineConfig = {
	phase: number;
	amplitude: number;
	frequency: number;
	speed: number;
};

const	WaveCanvas: React.FC<WaveCanvasProps> = ({
	waveCount = 10,
	spacing = 25,
	color = "var(--color-foreground)",
	minAmplitude = 10,
	maxAmplitude = 30,
	thickness = 2
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let width = canvas.offsetWidth;
		let height = canvas.offsetHeight;
		let time = 0;

		const resize = () => {
			width = canvas.offsetWidth;
			height = canvas.offsetHeight;
			canvas.width = width;
			canvas.height = height;
		};

		resize();
		window.addEventListener("resize", resize);

		// Generate per-wave configs once
		const configs: LineConfig[] = Array.from({ length: waveCount }, () => ({
			phase: Math.random() * Math.PI * 2,
			amplitude: minAmplitude + Math.random() * (maxAmplitude - minAmplitude),
			frequency: 0.008 + Math.random() * 0.014,
			speed: 0.004 + Math.random() * 0.02,
		}));

		const animate = () => {
			time += 1;
			ctx.clearRect(0, 0, width, height);

			const centerY = height / 2;

			for (let i = 0; i < waveCount; i++) {
				const { phase, amplitude, frequency, speed } = configs[i];
				const baseY = centerY + (i - waveCount / 2) * spacing;

				ctx.beginPath();
				for (let x = 0; x <= width; x += 4) {
					const y =
						baseY +
						Math.sin(x * frequency + time * speed + phase) * amplitude;
					x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
				}

				const resolvedColor = color?.startsWith("var(")
					? getComputedStyle(document.documentElement).getPropertyValue(color.slice(4, -1))
					: color;
				ctx.strokeStyle = resolvedColor || "#000"; // fallback if undefined
				ctx.lineWidth = thickness;

				ctx.stroke();
			}

			requestAnimationFrame(animate);
		};

		animate();

		return () => window.removeEventListener("resize", resize);
	}, [waveCount, spacing, color, minAmplitude, maxAmplitude, thickness]);

	return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
};

export default WaveCanvas;
