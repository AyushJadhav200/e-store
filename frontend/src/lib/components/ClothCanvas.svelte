<script lang="ts">
	import { onMount } from 'svelte';
	import { weaveStyle } from '$lib/weave';
	import type { Weave } from '$lib/catalog';

	let {
		weave = 'plain',
		/** Threads across the shorter side. Lower = coarser cloth, closer to the eye. */
		threads = 46,
		warp = '#7a5f52',
		weft = '#a08678',
		/** Extra magnification while the pointer is held down. 1 = off. */
		magnify = 1,
		interactive = true,
		/** Strength of the slow drape. 0 = flat cloth on a table. */
		drape = 1,
		label = ''
	}: {
		weave?: Weave;
		threads?: number;
		warp?: string;
		weft?: string;
		magnify?: number;
		interactive?: boolean;
		drape?: number;
		label?: string;
	} = $props();

	const WEAVE_ID: Record<Weave, number> = {
		plain: 0,
		twill: 1,
		herringbone: 2,
		rib: 3,
		loopback: 4,
		moleskin: 5
	};

	const TRAIL = 8;

	let host: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	/** Set when WebGL2 is unavailable, so the CSS weave stands in. */
	let failed = $state(false);

	const vert = `#version 300 es
	void main() {
		// One oversized triangle covers the viewport with no attribute buffers.
		vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
		gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
	}`;

	const frag = `#version 300 es
	precision highp float;
	out vec4 fragColor;

	uniform vec2 uRes;
	uniform float uTime;
	uniform int uWeave;
	uniform float uThreads;
	uniform float uDrape;
	uniform vec3 uWarp;
	uniform vec3 uWeft;
	uniform vec3 uPtr[${TRAIL}];
	uniform int uPtrN;

	// Yarn cross-section. A semicircle has vertical tangents at the gap, which
	// shades as a hard tile edge; a flattened sine reads as a spun thread.
	float yarn(float f) {
		return pow(max(0.0, sin(3.14159265 * f)), 0.7);
	}

	float hash(vec2 p) {
		return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
	}

	// Structure of the cloth at thread coordinates t.
	// h is relief; top is 1 where a warp end floats over a weft pick.
	void structure(vec2 t, out float h, out float top) {
		vec2 c = floor(t);
		vec2 f = fract(t);
		float w = yarn(f.x);
		float p = yarn(f.y);

		if (uWeave == 4) {
			// Loopback: pulled loops on an offset grid, not an interlacing.
			vec2 g = fract(t * 0.5 + vec2(mod(floor(t.y * 0.5), 2.0) * 0.5, 0.0)) - 0.5;
			float d = length(g);
			h = smoothstep(0.5, 0.08, d) * 0.62;
			top = 0.35;
			return;
		}

		if (uWeave == 5) {
			// Moleskin: sueded until the weave is gone. Nap, not structure.
			float n = hash(floor(t * 3.0)) * 0.5 + hash(floor(t * 7.0 + 3.7)) * 0.5;
			h = 0.14 * n + 0.06 * w;
			top = 0.5 + 0.18 * n;
			return;
		}

		float over;
		if (uWeave == 1) {
			over = step(mod(c.x - c.y, 3.0), 1.5);            // 2/1 twill
		} else if (uWeave == 2) {
			float band = floor(c.x / 6.0);
			float dir = mod(band, 2.0) < 1.0 ? (c.x - c.y) : (c.x + c.y);
			over = step(mod(dir, 3.0), 1.5);                  // herringbone
		} else if (uWeave == 3) {
			over = 1.0;                                       // knitted rib: wales dominate
		} else {
			over = step(mod(c.x + c.y, 2.0), 0.5);            // plain, one over one under
		}

		h = mix(p, w, over) * 0.55 + mix(w, p, over) * 0.13;
		top = over;
	}

	// Slow fold of a hanging length, plus the wake the pointer drags through it.
	// Cloth on a roll falls in vertical folds that wander down their length, so
	// the field is mostly a function of x with y only bending it.
	float relief(vec2 uv, vec2 ar) {
		vec2 p = uv * ar;
		float t = uTime;
		float h = 0.0;

		h += uDrape * 0.085 * sin(p.x * 4.6 + 0.75 * sin(p.y * 1.3 + t * 0.11) + t * 0.17);
		h += uDrape * 0.042 * sin(p.x * 8.7 - 0.55 * sin(p.y * 0.9 - t * 0.09) + t * 0.13 + 2.1);
		h += uDrape * 0.030 * sin(p.y * 2.1 + t * 0.15 + 1.1);

		for (int i = 0; i < ${TRAIL}; i++) {
			if (i >= uPtrN) break;
			vec3 q = uPtr[i];
			float age = uTime - q.z;
			if (age < 0.0 || age > 2.4) continue;
			float d = distance(p, q.xy * ar);
			float amp = exp(-age * 1.7) * exp(-d * 3.4);
			h += sin(d * 20.0 - age * 8.5) * amp * 0.055;
			h -= exp(-d * 9.0) * exp(-age * 3.2) * 0.05;   // the cloth is pressed in under the finger
		}
		return h;
	}

	void main() {
		vec2 uv = gl_FragCoord.xy / uRes;
		vec2 ar = vec2(max(uRes.x / uRes.y, 1.0), max(uRes.y / uRes.x, 1.0));
		float e = 1.0 / min(uRes.x, uRes.y);

		// Relief is sampled three times so the normal comes out of the real surface.
		float h0 = relief(uv, ar);
		float hx = relief(uv + vec2(e, 0.0), ar);
		float hy = relief(uv + vec2(0.0, e), ar);

		// The weave rides on top of the fold, and stretches slightly where it bends.
		vec2 t = (uv + vec2(h0, h0) * 0.30) * ar * uThreads;
		float sh, top;
		structure(t, sh, top);

		// Yarn relief is a slope, not a step: sample a fraction of a thread away
		// and divide, or the crossings shade as hard tiles instead of round yarn.
		const float dt = 0.09;
		float sx, sy, tx, ty;
		structure(t + vec2(dt, 0.0), sx, tx);
		structure(t + vec2(0.0, dt), sy, ty);
		float mx = (sx - sh) / dt;
		float my = (sy - sh) / dt;

		float macro = 1.35;
		float micro = 0.20;
		vec3 n = normalize(vec3(
			-((hx - h0) / e * macro + mx * micro),
			-((hy - h0) / e * macro + my * micro),
			1.0
		));

		vec3 L = normalize(vec3(-0.42, 0.58, 0.70));
		vec3 V = vec3(0.0, 0.0, 1.0);
		vec3 H = normalize(L + V);

		// One dyed cloth is one colour. Warp and weft differ only enough to tell
		// the two directions apart — the rest of the read comes from light.
		vec3 base = mix(uWeft, uWarp, 0.32 + 0.34 * clamp(top, 0.0, 1.0));

		float diff = clamp(dot(n, L) * 0.5 + 0.5, 0.0, 1.0);
		// Cloth sheen is broad and soft; a tight highlight would read as plastic.
		// Wool sheen runs along the yarn, so the highlight is stretched, not round.
		vec3 axis = normalize(vec3(mix(0.0, 1.0, clamp(top, 0.0, 1.0)), mix(1.0, 0.0, clamp(top, 0.0, 1.0)), 0.0));
		float along = dot(normalize(H - axis * dot(H, axis)), n);
		float spec = pow(max(along, 0.0), 14.0) * 0.13 + pow(max(dot(n, H), 0.0), 30.0) * 0.05;
		// Light gathers on the crown of a fold and is lost in the valley.
		float fold = clamp(0.74 + h0 * 4.4, 0.40, 1.24);
		float ao = clamp(0.72 + sh * 0.32, 0.0, 1.06);

		vec3 col = base * (0.26 + 0.86 * diff) * ao * fold + spec * fold;

		// Fibre grain, then a soft edge so the cloth falls away at the sides.
		col += (hash(gl_FragCoord.xy) - 0.5) * 0.022;
		float vig = smoothstep(1.15, 0.25, length((uv - 0.5) * vec2(1.0, 0.85)) * 1.6);
		col *= mix(0.90, 1.0, vig);

		// Colours were converted sRGB → linear on the way in so the lighting maths
		// behaves; they have to be converted back on the way out, or every cloth
		// renders far darker than the colour it was given.
		fragColor = vec4(pow(max(col, 0.0), vec3(1.0 / 2.2)), 1.0);
	}`;

	function hex(value: string): [number, number, number] {
		const m = /^#?([\da-f]{6})$/i.exec(value.trim());
		if (!m) return [0.5, 0.4, 0.35];
		const n = parseInt(m[1], 16);
		// Approximate sRGB → linear so the lighting maths behaves.
		const ch = (v: number) => Math.pow(v / 255, 2.2);
		return [ch((n >> 16) & 255), ch((n >> 8) & 255), ch(n & 255)];
	}

	function compile(gl: WebGL2RenderingContext, type: number, src: string) {
		const sh = gl.createShader(type)!;
		gl.shaderSource(sh, src.trim());
		gl.compileShader(sh);
		if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
			console.error(gl.getShaderInfoLog(sh));
			return null;
		}
		return sh;
	}

	onMount(() => {
		const gl = canvas.getContext('webgl2', {
			antialias: false,
			alpha: false,
			powerPreference: 'low-power'
		});
		if (!gl) {
			failed = true;
			return;
		}

		const vs = compile(gl, gl.VERTEX_SHADER, vert);
		const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
		if (!vs || !fs) {
			failed = true;
			return;
		}

		const prog = gl.createProgram()!;
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(prog));
			failed = true;
			return;
		}
		gl.useProgram(prog);

		const u = (name: string) => gl.getUniformLocation(prog, name);
		const uRes = u('uRes');
		const uTime = u('uTime');
		const uWeave = u('uWeave');
		const uThreads = u('uThreads');
		const uDrape = u('uDrape');
		const uWarp = u('uWarp');
		const uWeft = u('uWeft');
		const uPtr = u('uPtr');
		const uPtrN = u('uPtrN');

		const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// Ring buffer of recent pointer samples; each leaves a decaying ripple.
		const trail = new Float32Array(TRAIL * 3);
		let trailN = 0;
		let write = 0;
		let held = false;
		let visible = true;
		let frame = 0;
		let start = performance.now();
		let threadScale = 1;
		// Colour and thread count are eased, so a slide change reads as the same
		// length of cloth being dyed and re-woven rather than a hard cut.
		let warpNow = hex(warp);
		let weftNow = hex(weft);
		let threadsNow = threads;

		const ease = (a: [number, number, number], b: [number, number, number], k: number) =>
			a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];

		function size() {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const box = host.getBoundingClientRect();
			const w = Math.max(1, Math.round(box.width * dpr));
			const h = Math.max(1, Math.round(box.height * dpr));
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
				gl!.viewport(0, 0, w, h);
			}
		}

		function draw(now: number) {
			const t = (now - start) / 1000;
			size();
			// Holding down draws the eye in: the cloth comes closer, threads grow.
			threadScale += ((held ? 1 / magnify : 1) - threadScale) * 0.08;
			gl!.uniform2f(uRes, canvas.width, canvas.height);
			gl!.uniform1f(uTime, still ? 6.2 : t);
			gl!.uniform1i(uWeave, WEAVE_ID[weave] ?? 0);
			threadsNow += (threads - threadsNow) * 0.12;
			gl!.uniform1f(uThreads, threadsNow * threadScale);
			gl!.uniform1f(uDrape, still ? 0.35 : drape);
			warpNow = ease(warpNow, hex(warp), 0.12);
			weftNow = ease(weftNow, hex(weft), 0.12);
			gl!.uniform3fv(uWarp, warpNow);
			gl!.uniform3fv(uWeft, weftNow);
			gl!.uniform3fv(uPtr, trail);
			gl!.uniform1i(uPtrN, trailN);
			gl!.drawArrays(gl!.TRIANGLES, 0, 3);
		}

		function loop(now: number) {
			frame = requestAnimationFrame(loop);
			if (!visible) return;
			draw(now);
		}

		function push(e: PointerEvent) {
			if (!interactive || still) return;
			const box = host.getBoundingClientRect();
			const x = (e.clientX - box.left) / box.width;
			const y = 1 - (e.clientY - box.top) / box.height;
			if (x < -0.2 || x > 1.2 || y < -0.2 || y > 1.2) return;
			trail[write * 3] = x;
			trail[write * 3 + 1] = y;
			trail[write * 3 + 2] = (performance.now() - start) / 1000;
			write = (write + 1) % TRAIL;
			trailN = Math.min(trailN + 1, TRAIL);
		}

		const io = new IntersectionObserver((entries) => {
			visible = entries[0].isIntersecting;
		});
		io.observe(host);

		const ro = new ResizeObserver(() => {
			size();
			if (still) draw(performance.now());
		});
		ro.observe(host);

		const onHidden = () => {
			visible = !document.hidden;
		};

		window.addEventListener('pointermove', push, { passive: true });
		host.addEventListener('pointerdown', () => (held = true));
		window.addEventListener('pointerup', () => (held = false));
		document.addEventListener('visibilitychange', onHidden);

		if (still) {
			size();
			draw(performance.now());
		} else {
			frame = requestAnimationFrame(loop);
		}

		return () => {
			cancelAnimationFrame(frame);
			io.disconnect();
			ro.disconnect();
			window.removeEventListener('pointermove', push);
			document.removeEventListener('visibilitychange', onHidden);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		};
	});
</script>

<div
	class="cloth-live"
	bind:this={host}
	role={label ? 'img' : 'presentation'}
	aria-label={label || undefined}
>
	{#if failed}
		<!-- No WebGL2: the CSS weave draws the same structure, without the light. -->
		<div class="fallback" style={weaveStyle(weave, 7)}></div>
	{/if}
	<canvas bind:this={canvas} class:hidden={failed}></canvas>
</div>

<style>
	.cloth-live {
		position: relative;
		overflow: hidden;
		background: var(--accent);
		touch-action: pan-y;
	}

	canvas,
	.fallback {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
	}

	.hidden {
		display: none;
	}
</style>
