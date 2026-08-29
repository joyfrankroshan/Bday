import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Avatar,
  Paper,
  IconButton,
  LinearProgress,
  Stack,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";

const BIRTH_DATE = new Date(2004, 7, 30); // August 30, 2004
const TRAITS = ["Sweet", "Loyal", "Beautiful", "One of a Kind"];
const BALLOON_COLORS = ["#ff8fab", "#8ecae6", "#ffd166", "#b5ead7"];

const FLOWER_MAIN =
  "https://images.unsplash.com/photo-1712258090339-b10d3fd56ab6?fm=jpg&q=60&w=500&auto=format&fit=crop";
const FLOWER_ALT =
  "https://images.unsplash.com/photo-1552174965-c6616f62fc4f?fm=jpg&q=60&w=400&auto=format&fit=crop";

const keyframesCSS = `
@keyframes floatUp {
  to { transform: translateY(-110vh) translateX(15px) rotate(15deg); opacity: 0; }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
@keyframes pop {
  0% { transform: scale(1); opacity: 1; }
  60% { transform: scale(1.4); opacity: 0.6; }
  100% { transform: scale(0); opacity: 0; }
}
@keyframes flicker {
  0% { transform: scale(1) rotate(-2deg); }
  100% { transform: scale(1.1) rotate(2deg); }
}
@keyframes sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
@keyframes unfold {
  from { transform: scaleY(0.7) translateY(20px); opacity: 0; }
  to { transform: scaleY(1) translateY(0); opacity: 1; }
}
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.15); }
}
@keyframes flashFade {
  0% { opacity: 0; }
  15% { opacity: 1; }
  100% { opacity: 0; }
}
`;

function useDaysSinceBirth() {
  return useMemo(() => {
    const now = new Date();
    return Math.floor((now - BIRTH_DATE) / (1000 * 60 * 60 * 24));
  }, []);
}

function FloatingHearts({ count = 18, resetKey }) {
  const hearts = useMemo(() => {
    const symbols = ["💗", "💕", "💖"];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      left: Math.random() * 100,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 8,
      size: 1 + Math.random() * 1.2,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, resetKey]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {hearts.map((h) => (
        <Box
          key={h.id}
          component="span"
          sx={{
            position: "absolute",
            bottom: "-40px",
            left: `${h.left}%`,
            fontSize: `${h.size}em`,
            color: "#f2a6c4",
            animation: `floatUp ${h.duration}s linear infinite`,
            animationDelay: `${h.delay}s`,
          }}
        >
          {h.symbol}
        </Box>
      ))}
    </Box>
  );
}

function Scene({ active, children }) {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: active ? "flex" : "none",
        opacity: active ? 1 : 0,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px 16px",
        transition: "opacity 0.6s ease",
        overflowY: "auto",
        maxHeight: "100%",
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Pull-and-release heart slingshot.
 * The heart can be dragged within a radius from center; a coil (line) is drawn
 * from the anchor to the heart. On release, if pulled far enough, it snaps back
 * and fires, triggering onRelease (which shows a pink flash and advances the scene).
 */
function HeartSlingshot({ onRelease }) {
  const MAX_PULL = 55; // px
  const containerRef = useRef(null);
  const draggingRef = useRef(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const getRelativePoint = (clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MAX_PULL) {
      const scale = MAX_PULL / dist;
      dx *= scale;
      dy *= scale;
    }
    return { x: dx, y: dy };
  };

  const handlePointerDown = (e) => {
    draggingRef.current = true;
    setDragging(true);
    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const point = getRelativePoint(e.clientX, e.clientY);
    setPos(point);
  };

  const handlePointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const pulledFarEnough = Math.sqrt(pos.x * pos.x + pos.y * pos.y) > MAX_PULL * 0.4;
    setPos({ x: 0, y: 0 });
    if (pulledFarEnough) {
      onRelease && onRelease();
    }
  };

  return (
    <Box
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      sx={{
        position: "relative",
        width: 220,
        height: 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
        touchAction: "none",
      }}
    >
      <svg
        width="220"
        height="220"
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <line
          x1={110}
          y1={110}
          x2={110 + pos.x}
          y2={110 + pos.y}
          stroke="rgba(163,53,90,0.35)"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </svg>
      <Box
        onPointerDown={handlePointerDown}
        sx={{
          fontSize: "3.4em",
          cursor: "grab",
          userSelect: "none",
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: dragging ? "none" : "transform 0.35s cubic-bezier(.2,1.4,.4,1)",
          filter: "drop-shadow(0 8px 14px rgba(230,67,122,0.35))",
        }}
      >
        ❤️
      </Box>
    </Box>
  );
}

function Balloons({ onAllPopped }) {
  const [popped, setPopped] = useState(() => TRAITS.map(() => false));

  const pop = (i) => {
    if (popped[i]) return;
    const next = [...popped];
    next[i] = true;
    setPopped(next);
    if (next.every(Boolean)) onAllPopped();
  };

  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      justifyContent="center"
      gap={{ xs: 1.75, sm: 3 }}
      sx={{ zIndex: 1, my: 2.5 }}
    >
      {TRAITS.map((trait, i) => (
        <Box
          key={trait}
          onClick={() => pop(i)}
          sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
        >
          <Box
            sx={{
              width: { xs: 46, sm: 60 },
              height: { xs: 60, sm: 78 },
              borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
              background: BALLOON_COLORS[i],
              boxShadow:
                "inset -8px -8px 15px rgba(0,0,0,0.15), inset 8px 8px 15px rgba(255,255,255,0.3)",
              transition: "transform 0.15s ease",
              ...(popped[i] ? { animation: "pop 0.35s forwards" } : {}),
              "&:hover": popped[i] ? {} : { transform: "scale(1.08) rotate(-3deg)" },
            }}
          />
          <Box sx={{ width: "2px", height: 40, background: "#ccc", mx: "auto" }} />
          <Typography
            sx={{
              mt: 1,
              fontWeight: 600,
              color: "#a3355a",
              minHeight: 22,
              fontSize: { xs: "0.8em", sm: "0.95em" },
              opacity: popped[i] ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          >
            {trait}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

function CandleBlow({ onBlownOut }) {
  const [out, setOut] = useState(false);
  const [hint, setHint] = useState("Blow into your mic, or tap the cake if it can't hear you");
  const [level, setLevel] = useState(0);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);

  const blowOut = useCallback(() => {
    setOut((wasOut) => {
      if (wasOut) return wasOut;
      setHint("Yay! Make a wish 🌟");
      onBlownOut && onBlownOut();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return true;
    });
  }, [onBlownOut]);

  useEffect(() => {
    let cancelled = false;

    async function tryMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const loop = () => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          setLevel(Math.min(100, avg * 2));
          if (avg > 35) {
            blowOut();
            return;
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        loop();
      } catch (e) {
        setHint("Mic not available — tap the cake instead 🎂");
      }
    }

    tryMic();

    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Box sx={{ position: "relative", zIndex: 1, my: 2, cursor: "pointer" }} onClick={blowOut}>
        {!out && (
          <Box
            sx={{
              width: 16,
              height: 22,
              background:
                "radial-gradient(circle at 50% 70%, #fff6b0, #ffb703 60%, #fb5607 100%)",
              borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
              mx: "auto",
              mb: "-2px",
              animation: "flicker 0.4s ease infinite alternate",
              transformOrigin: "bottom center",
            }}
          />
        )}
        <Box sx={{ width: 8, height: 40, background: "#f4d35e", mx: "auto", borderRadius: "2px" }} />
        <Typography sx={{ fontSize: { xs: "3.2em", sm: "5em" }, lineHeight: 1 }}>🎂</Typography>
      </Box>
      <Typography sx={{ fontSize: { xs: "0.8em", sm: "0.9em" }, color: "#b56b86", mt: 1.5, zIndex: 1, px: 1.5 }}>
        {hint}
      </Typography>
      <Box sx={{ width: { xs: "60vw", sm: 160 }, maxWidth: 160, mx: "auto", mt: 1.25, zIndex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={level}
          sx={{
            height: 8,
            borderRadius: 10,
            backgroundColor: "#ffd9e4",
            "& .MuiLinearProgress-bar": { backgroundColor: "#ff6b98" },
          }}
        />
      </Box>
    </>
  );
}

export default function JerphicaBirthdayCard() {
  const [scene, setScene] = useState(0);
  const [balloonsDone, setBalloonsDone] = useState(false);
  const [candleDone, setCandleDone] = useState(false);
  const [heartBurstKey, setHeartBurstKey] = useState(0);
  const [flash, setFlash] = useState(false);
  const daysSinceBirth = useDaysSinceBirth();

  const goTo = (n) => setScene(n);

  const handleSlingshotRelease = () => {
    setFlash(true);
    setTimeout(() => {
      goTo(1);
      setTimeout(() => setFlash(false), 50);
    }, 380);
  };

  const pinkBtnSx = {
    background: "linear-gradient(135deg,#ff8fab,#ff6b98)",
    color: "white",
    borderRadius: "30px",
    px: { xs: 2.5, sm: 3.5 },
    py: 1.25,
    fontSize: { xs: "0.9em", sm: "1em" },
    textTransform: "none",
    boxShadow: "0 6px 16px rgba(255,105,145,0.4)",
    zIndex: 1,
    "&:hover": {
      background: "linear-gradient(135deg,#ff7f9f,#ff5c8d)",
      boxShadow: "0 6px 16px rgba(255,105,145,0.5)",
    },
  };

  return (
    <Box
      sx={{
        height: "100dvh",
        width: "100%",
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        background: "linear-gradient(135deg,#ffe4ec,#fff0f5,#ffe9f3)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{keyframesCSS}</style>

      <FloatingHearts count={18} resetKey={heartBurstKey} />

      {flash && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            background: "#e6437a",
            zIndex: 10,
            animation: "flashFade 0.4s ease forwards",
            pointerEvents: "none",
          }}
        />
      )}

      <Box
        sx={{
          position: "relative",
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Scene 0: Pull & release heart */}
        <Scene active={scene === 0}>
          <Typography
            sx={{
              fontSize: { xs: "0.85em", sm: "1em" },
              color: "#b56b86",
              mb: 2,
              zIndex: 1,
              fontStyle: "italic",
            }}
          >
            a little something, for you
          </Typography>
          <HeartSlingshot onRelease={handleSlingshotRelease} />
          <Typography
            sx={{
              mt: 2,
              fontSize: "0.75em",
              letterSpacing: 2,
              color: "#c98ba0",
              textTransform: "uppercase",
              zIndex: 1,
            }}
          >
            pull & release
          </Typography>
        </Scene>

        {/* Scene 1: Intro */}
        <Scene active={scene === 1}>
          <Avatar
            src={FLOWER_ALT}
            alt="roses"
            sx={{
              width: { xs: 100, sm: 140 },
              height: { xs: 100, sm: 140 },
              border: "5px solid #fff",
              boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
              mb: 1.75,
              zIndex: 1,
              animation: "pulse 2.4s ease infinite",
            }}
          />
          <Typography sx={{ fontSize: { xs: "1.2em", sm: "1.6em" }, fontWeight: 600, color: "#a3355a", mb: 0.75, zIndex: 1 }}>
            A little something for you
          </Typography>
          <Typography sx={{ fontSize: { xs: "0.85em", sm: "1em" }, color: "#b56b86", mb: 3, zIndex: 1, px: 1 }}>
            Happy {daysSinceBirth.toLocaleString()}th day since your birth 🎉
          </Typography>
          <Typography sx={{ fontSize: { xs: "0.85em", sm: "1em" }, color: "#b56b86", mb: 3, zIndex: 1, px: 1 }}>
            Jerphica, tap below to open your card
          </Typography>
          <Button sx={pinkBtnSx} onClick={() => goTo(2)}>
            Open my card 🎁
          </Button>
        </Scene>

        {/* Scene 2: Balloons */}
        <Scene active={scene === 2}>
          <Typography variant="h5" sx={{ color: "#a3355a", fontWeight: 600, fontSize: { xs: "1.1em", sm: "1.5em" }, zIndex: 1 }}>
            Pop all 4 balloons
          </Typography>
          <Typography sx={{ fontSize: { xs: "0.85em", sm: "1em" }, color: "#b56b86", mb: 1, zIndex: 1 }}>
            You are...
          </Typography>
          <Balloons onAllPopped={() => setBalloonsDone(true)} />
          {balloonsDone && (
            <Button sx={pinkBtnSx} onClick={() => goTo(3)}>
              Continue →
            </Button>
          )}
        </Scene>

        {/* Scene 3: Candle */}
        <Scene active={scene === 3}>
          <Typography variant="h5" sx={{ color: "#a3355a", fontWeight: 600, fontSize: { xs: "1.1em", sm: "1.5em" }, zIndex: 1 }}>
            Blow the candle, Jerphica 🎀🎂
          </Typography>
          {scene === 3 && <CandleBlow onBlownOut={() => setCandleDone(true)} />}
          {candleDone && (
            <Button sx={{ ...pinkBtnSx, mt: 1 }} onClick={() => goTo(4)}>
              Continue →
            </Button>
          )}
        </Scene>

        {/* Scene 4: Bouquet */}
        <Scene active={scene === 4}>
          <Typography variant="h5" sx={{ color: "#a3355a", fontWeight: 600, fontSize: { xs: "1.1em", sm: "1.5em" }, zIndex: 1 }}>
            Your Rose Bouquet 🌹
          </Typography>
          <Avatar
            src={FLOWER_MAIN}
            alt="rose bouquet"
            variant="circular"
            sx={{
              width: { xs: 160, sm: 240 },
              height: { xs: 160, sm: 240 },
              border: "6px solid #fff",
              boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
              animation: "sway 3.5s ease-in-out infinite",
              zIndex: 1,
              mt: 2,
            }}
          />
          <Stack direction="row" gap={1.75} flexWrap="wrap" justifyContent="center" sx={{ mt: 2, zIndex: 1 }}>
            <Box
              component="img"
              src={FLOWER_ALT}
              alt="roses"
              sx={{
                width: { xs: 64, sm: 90 },
                height: { xs: 64, sm: 90 },
                objectFit: "cover",
                borderRadius: "14px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                border: "3px solid #fff",
              }}
            />
            <Box
              component="img"
              src={FLOWER_MAIN}
              alt="roses"
              sx={{
                width: { xs: 64, sm: 90 },
                height: { xs: 64, sm: 90 },
                objectFit: "cover",
                borderRadius: "14px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                border: "3px solid #fff",
              }}
            />
          </Stack>
          <Typography sx={{ fontSize: { xs: "0.85em", sm: "1em" }, color: "#b56b86", mt: 2.5, mb: 3, zIndex: 1 }}>
            Picked just for you
          </Typography>
          <Button sx={pinkBtnSx} onClick={() => goTo(5)}>
            Continue →
          </Button>
        </Scene>

        {/* Scene 5: Envelope */}
        <Scene active={scene === 5}>
          <Typography variant="h5" sx={{ color: "#a3355a", fontWeight: 600, fontSize: { xs: "1.1em", sm: "1.5em" }, zIndex: 1 }}>
            A Message From My Heart
          </Typography>
          <Typography sx={{ fontSize: { xs: "0.85em", sm: "1em" }, color: "#b56b86", mb: 3, zIndex: 1 }}>
            Tap to open
          </Typography>
          <Box
            onClick={() => goTo(6)}
            sx={{
              cursor: "pointer",
              zIndex: 1,
              "&:hover .envelope-emoji": { transform: "translateY(-6px)" },
            }}
          >
            <Typography
              className="envelope-emoji"
              sx={{ fontSize: { xs: "4em", sm: "6em" }, transition: "transform 0.3s ease" }}
            >
              💌
            </Typography>
            <Typography
              sx={{
                mt: 1.25,
                fontSize: { xs: "0.75em", sm: "0.85em" },
                letterSpacing: 1,
                color: "#b56b86",
                textTransform: "uppercase",
              }}
            >
              Tap to open
            </Typography>
          </Box>
        </Scene>

        {/* Scene 6: Letter */}
        <Scene active={scene === 6}>
          <Paper
            elevation={0}
            sx={{
              background: "rgba(255,255,255,0.85)",
              borderRadius: "18px",
              padding: { xs: "20px", sm: "30px 34px" },
              maxWidth: 420,
              width: "100%",
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              textAlign: "left",
              position: "relative",
              zIndex: 1,
              animation: "unfold 0.6s ease",
            }}
          >
            <Box
              component="img"
              src={FLOWER_ALT}
              alt="roses"
              sx={{
                width: "100%",
                maxWidth: 420,
                borderRadius: "18px 18px 0 0",
                objectFit: "cover",
                height: { xs: 90, sm: 140 },
                display: "block",
                mb: "-6px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                mx: "auto",
              }}
            />
            <IconButton
              onClick={() => setHeartBurstKey((k) => k + 1)}
              sx={{
                position: "absolute",
                top: -16,
                right: -12,
                background: "#e6437a",
                color: "white",
                width: 40,
                height: 40,
                boxShadow: "0 4px 12px rgba(230,67,122,0.5)",
                animation: "heartbeat 1.4s ease infinite",
                "&:hover": { background: "#d63a6d" },
              }}
            >
              <FavoriteIcon sx={{ fontSize: "1.1em" }} />
            </IconButton>
            <Typography sx={{ mb: 1.75, lineHeight: 1.5, color: "#5b3a4a", fontSize: { xs: "0.9em", sm: "1.02em" } }}>
              Dear Jerphica 🎀💗,
            </Typography>
            <Typography sx={{ mb: 1.75, lineHeight: 1.5, color: "#5b3a4a", fontSize: { xs: "0.9em", sm: "1.02em" } }}>
              Happy Birthday to someone truly special! 🎂
            </Typography>
            <Typography sx={{ mb: 1.75, lineHeight: 1.5, color: "#5b3a4a", fontSize: { xs: "0.9em", sm: "1.02em" } }}>
              You are <b>Sweet</b>, <b>Loyal</b>, <b>Beautiful</b>, <b>One of a Kind</b>.
            </Typography>
            <Typography sx={{ mb: 1.75, lineHeight: 1.5, color: "#5b3a4a", fontSize: { xs: "0.9em", sm: "1.02em" } }}>
              I hope today is as wonderful as you are, and this year brings you every
              bit of the love and happiness you give to everyone around you. I'll
              always be with you, till your very last day.
            </Typography>
            <Typography sx={{ mb: 1.75, lineHeight: 1.5, color: "#5b3a4a", fontSize: { xs: "0.9em", sm: "1.02em" }, fontStyle: "italic" }}>
              — always with you 💕
            </Typography>
            <Typography sx={{ fontSize: "0.85em", color: "#b56b86", mt: 0.5 }}>
              It's been {daysSinceBirth.toLocaleString()} days since the world got you 💗
            </Typography>
            <Typography sx={{ fontSize: "2em", textAlign: "right", mt: 0.75 }}>🐇🐰</Typography>
          </Paper>

          <Stack direction="row" gap={1} sx={{ mt: 3.25, zIndex: 1 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Box key={i} sx={{ width: 8, height: 8, borderRadius: "50%", background: "#e6437a" }} />
            ))}
          </Stack>
          <Typography component="footer" sx={{ mt: 2.75, fontSize: "0.85em", color: "#b56b86", zIndex: 1 }}>
            Made with love, just for you 🌸
          </Typography>
        </Scene>
      </Box>
    </Box>
  );
}
