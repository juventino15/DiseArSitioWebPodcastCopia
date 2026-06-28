import { useEffect, useMemo, useRef, useState } from "react";
import type { ElementType } from "react";
import { ArrowRight, Check, CircleStop, Copy, Instagram, Mail, Mic, Music, Pause, Play, Radio, Send, Upload, Volume2, Youtube } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import logoImg from "../imports/logo_sin_fondo.png";

type RecordingState = "idle" | "recording" | "recorded" | "sent";

const ApplePodcastsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M11.996 2.001a4.93 4.93 0 0 0-4.928 4.93v5.188a4.925 4.925 0 0 0 1.258 3.292.98.98 0 1 1-1.464 1.298 6.879 6.879 0 0 1-1.751-4.59V6.93a6.887 6.887 0 1 1 13.774 0v5.188a6.879 6.879 0 0 1-1.75 4.588.98.98 0 1 1-1.465-1.296 4.923 4.923 0 0 0 1.256-3.29V6.931a4.93 4.93 0 0 0-4.93-4.93Z" />
    <path d="M11.996 9.422a2.956 2.956 0 0 0-2.954 2.954v2.798a2.955 2.955 0 0 0 5.91 0v-2.798a2.957 2.957 0 0 0-2.956-2.954Z" />
    <path d="M12.977 15.176a.98.98 0 0 1-.98.979h-.001a.98.98 0 0 1-.98-.98v-3.799a.98.98 0 1 1 1.961 0v3.8Z" />
    <path d="M12 21.018a.98.98 0 0 1-.98-.98v-2.883a.98.98 0 1 1 1.96 0v2.883a.98.98 0 0 1-.98.98Z" />
    <path d="M11.996 5.865a1.066 1.066 0 1 0 0 2.133 1.066 1.066 0 0 0 0-2.133Z" />
  </svg>
);

const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm4.587 14.42c-.18.295-.56.388-.855.207-2.34-1.428-5.286-1.75-8.756-.957-.333.076-.665-.133-.74-.467-.077-.334.133-.666.466-.74 3.79-.868 7.03-.5 9.678 1.117.295.18.388.56.207.855Zm1.21-3.237c-.228.372-.714.492-1.087.264-2.673-1.642-6.757-2.13-9.52-1.166-.423.147-.88-.076-1.028-.5-.147-.424.076-.88.5-1.028 3.19-1.113 7.697-.564 10.767 1.326.372.227.492.713.264 1.087Zm.114-3.393C14.73 7.915 8.543 7.712 4.97 8.796c-.504.153-1.037-.13-1.19-.634-.153-.504.13-1.037.635-1.19 4.14-1.256 11.004-1.026 14.675 1.155.45.267.6.85.334 1.3-.267.45-.85.6-1.3.334Z" />
  </svg>
);

const episodes = [
  {
    title: "Me fui sin tener todas las respuestas",
    guest: "Ana Laura",
    theme: "Cambio de país, miedo y maestría",
    time: "48 min",
  },
  {
    title: "Cómo aprendí a empezar de nuevo",
    guest: "Natalí Salazar",
    theme: "Emprendimiento, duelo y resiliencia",
    time: "52 min",
  },
  {
    title: "La decisión que cambió mi familia",
    guest: "Mariana R.",
    theme: "Cuidado, límites y amor cotidiano",
    time: "41 min",
  },
];

type Platform = {
  name: string;
  icon: ElementType;
  url: string;
};

const spotifyShowUrl = "https://open.spotify.com/show/58donxSBf9yxQySkx3nh9k?si=b3b1b9467f9847e4";
const spotifyEmbedUrl = "https://open.spotify.com/embed/show/58donxSBf9yxQySkx3nh9k?utm_source=generator&theme=0";

const platforms: Platform[] = [
  { name: "Spotify", icon: SpotifyIcon, url: spotifyShowUrl },
  { name: "YouTube", icon: Youtube, url: "https://www.youtube.com/@ContandoHistoriasPodcast" },
  { name: "Instagram", icon: Instagram, url: "https://www.instagram.com/contandohistorias_podcast/" },
  { name: "Apple Podcasts", icon: ApplePodcastsIcon, url: "https://podcasts.apple.com/mx/podcast/contando-historias/id1808998146?l=en-GB" },
  { name: "Amazon Music", icon: Music, url: "https://music.amazon.com.mx/podcasts/154e320e-f6c1-415c-beaa-ee1c6ee6b6b0/contando-historias" },
];

const EMAIL_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gracias por compartir tu historia</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@700;900&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:#F0EAE2;font-family:'Montserrat',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EAE2;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr><td style="background:#1F4E5F;border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
          <p style="margin:0;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#F2C94C;">Podcast de historias reales</p>
          <h1 style="margin:12px 0 0;font-family:'Poppins',sans-serif;font-size:36px;font-weight:900;line-height:1.1;color:#F9F4EE;">Contando<br/>Historias</h1>
        </td></tr>

        <tr><td style="background:#F08329;height:6px;"></td></tr>

        <tr><td style="background:#FFFDF9;padding:48px 40px 40px;">
          <p style="margin:0 0 8px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#F08329;">Hola, {{NOMBRE}}</p>
          <h2 style="margin:0 0 24px;font-family:'Poppins',sans-serif;font-size:28px;font-weight:900;line-height:1.15;color:#1F4E5F;">Tu historia llegó.<br/>Gracias por la valentía.</h2>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.8;color:#3A5560;">Recibimos tu mensaje y queremos que sepas que lo leemos con mucha atención y cuidado. Cada historia que llega al buzón de <strong>Contando Historias</strong> es un acto de generosidad que tomamos muy en serio.</p>
          <p style="margin:0 0 32px;font-size:16px;line-height:1.8;color:#3A5560;">Nos pondremos en contacto contigo si tu historia es seleccionada para un episodio. Mientras tanto, te invitamos a escuchar las historias que ya forman parte del podcast.</p>

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#F0EAE2;border-left:4px solid #F08329;border-radius:0 12px 12px 0;padding:20px 24px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:18px;font-style:italic;line-height:1.6;color:#1F4E5F;">"Cada historia importa, incluso y sobre todo, las que parecen peque&#241;as."</p>
              <p style="margin:8px 0 0;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#F08329;">Contando Historias &middot; 2025</p>
            </td></tr>
          </table>

          <p style="margin:36px 0 20px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#1F4E5F;">&#191;Qu&#233; sigue?</p>

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="52" valign="top" style="padding-bottom:24px;"><div style="width:36px;height:36px;background:#1F4E5F;border-radius:50%;text-align:center;line-height:36px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:900;color:#F9F4EE;">1</div></td>
              <td valign="top" style="padding-bottom:24px;">
                <p style="margin:0 0 4px;font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700;color:#1F4E5F;">Revisamos tu historia</p>
                <p style="margin:0;font-family:'Montserrat',sans-serif;font-size:14px;line-height:1.7;color:#5E747C;">Leemos y escuchamos cada mensaje con cuidado en los pr&#243;ximos d&#237;as.</p>
              </td>
            </tr>
            <tr>
              <td width="52" valign="top" style="padding-bottom:24px;"><div style="width:36px;height:36px;background:#F08329;border-radius:50%;text-align:center;line-height:36px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:900;color:#fff;">2</div></td>
              <td valign="top" style="padding-bottom:24px;">
                <p style="margin:0 0 4px;font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700;color:#1F4E5F;">Si es seleccionada, te contactamos</p>
                <p style="margin:0;font-family:'Montserrat',sans-serif;font-size:14px;line-height:1.7;color:#5E747C;">Te escribiremos al correo que nos dejaste para coordinar los siguientes pasos.</p>
              </td>
            </tr>
            <tr>
              <td width="52" valign="top"><div style="width:36px;height:36px;background:#018060;border-radius:50%;text-align:center;line-height:36px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:900;color:#fff;">3</div></td>
              <td valign="top">
                <p style="margin:0 0 4px;font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700;color:#1F4E5F;">Tu historia llega al mundo</p>
                <p style="margin:0;font-family:'Montserrat',sans-serif;font-size:14px;line-height:1.7;color:#5E747C;">Se convierte en un episodio que inspira a otras personas a contar las suyas.</p>
              </td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:40px;">
            <tr><td align="center">
              <a href="https://open.spotify.com/show/58donxSBf9yxQySkx3nh9k" style="display:inline-block;background:#1F4E5F;color:#F9F4EE;font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:16px 36px;border-radius:100px;">Escuchar el podcast &#8594;</a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="background:#F0EAE2;padding:32px 40px;text-align:center;">
          <p style="margin:0 0 16px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#5E747C;">S&#237;guenos</p>
          <table align="center" cellpadding="0" cellspacing="0"><tr>
            <td style="padding:0 6px;"><a href="https://www.instagram.com/contandohistorias_podcast/" style="display:inline-block;background:#1F4E5F;color:#F9F4EE;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;text-decoration:none;padding:10px 16px;border-radius:100px;">Instagram</a></td>
            <td style="padding:0 6px;"><a href="https://www.youtube.com/@ContandoHistoriasPodcast" style="display:inline-block;background:#F08329;color:#fff;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;text-decoration:none;padding:10px 16px;border-radius:100px;">YouTube</a></td>
            <td style="padding:0 6px;"><a href="https://open.spotify.com/show/58donxSBf9yxQySkx3nh9k" style="display:inline-block;background:#018060;color:#fff;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;text-decoration:none;padding:10px 16px;border-radius:100px;">Spotify</a></td>
          </tr></table>
        </td></tr>

        <tr><td style="background:#1F4E5F;border-radius:0 0 20px 20px;padding:28px 40px;text-align:center;">
          <p style="margin:0 0 8px;font-family:'Montserrat',sans-serif;font-size:12px;color:rgba(249,244,238,0.6);">Contando Historias Podcast &middot; contacto.contandohistorias@gmail.com</p>
          <p style="margin:0;font-family:'Montserrat',sans-serif;font-size:11px;color:rgba(249,244,238,0.35);">Recibiste este correo porque compartiste una historia con nosotros.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

function EmailPreviewPage({ onBack }: { onBack: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyHtml = () => {
    const textarea = document.createElement("textarea");
    textarea.value = EMAIL_HTML;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F0EAE2]">
      <div className="sticky top-0 z-40 border-b border-border bg-white/90 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 font-['Montserrat'] text-sm font-bold text-secondary transition hover:bg-secondary hover:text-secondary-foreground">
              ← Volver
            </button>
            <div>
              <p className="font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-accent">Plantilla HTML</p>
              <p className="font-['Poppins'] text-base font-black text-secondary">Email de agradecimiento</p>
            </div>
          </div>
          <button onClick={copyHtml} className={`flex items-center gap-2 rounded-full px-5 py-3 font-['Montserrat'] text-sm font-bold transition ${copied ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-[#173A46]"}`}>
            {copied ? <><Check className="size-4" /> ¡Copiado!</> : <><Copy className="size-4" /> Copiar HTML</>}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-white p-5 sm:grid-cols-3">
          <div>
            <p className="font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-muted-foreground">Asunto sugerido</p>
            <p className="mt-1 font-['Montserrat'] text-sm font-semibold text-secondary">Gracias por compartir tu historia 🎙️</p>
          </div>
          <div>
            <p className="font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-muted-foreground">Variable dinámica</p>
            <p className="mt-1 font-['Montserrat'] text-sm font-semibold text-accent">{"{{NOMBRE}} → nombre del remitente"}</p>
          </div>
          <div>
            <p className="font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-muted-foreground">Compatible con</p>
            <p className="mt-1 font-['Montserrat'] text-sm font-semibold text-secondary">Mailchimp · Resend · SendGrid · Brevo</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-white px-5 py-3">
            <div className="size-3 rounded-full bg-red-400" />
            <div className="size-3 rounded-full bg-yellow-400" />
            <div className="size-3 rounded-full bg-green-400" />
            <span className="ml-3 font-['Montserrat'] text-xs text-muted-foreground">{"Vista previa — {{NOMBRE}} = \"Ana Laura\""}</span>
          </div>
          <iframe
            srcDoc={EMAIL_HTML.replace("{{NOMBRE}}", "Ana Laura")}
            title="Vista previa email de agradecimiento"
            className="w-full border-0 bg-white"
            style={{ height: "920px" }}
          />
        </div>
      </div>
    </div>
  );
}

function AudioMailbox() {
  const [tab, setTab] = useState<"audio" | "escrito">("audio");

  // Audio state
  const [state, setState] = useState<RecordingState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioAccepted, setAudioAccepted] = useState(false);
  const [audioContact, setAudioContact] = useState({ nombre: "", telefono: "", correo: "" });
  const interval = useRef<number | null>(null);

  const timer = useMemo(() => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }, [seconds]);

  const start = () => {
    setState("recording");
    setSeconds(0);
    interval.current = window.setInterval(() => {
      setSeconds((value) => (value >= 300 ? 300 : value + 1));
    }, 1000);
  };

  const stop = () => {
    if (interval.current) window.clearInterval(interval.current);
    setState("recorded");
  };

  const reset = () => {
    if (interval.current) window.clearInterval(interval.current);
    setState("idle");
    setSeconds(0);
  };

  const handleAudioContact = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioContact((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const audioContactValid = audioAccepted && audioContact.nombre.trim() && audioContact.correo.trim();

  const sendAudio = () => {
    if (!audioContactValid) return;
    setState("sent");
  };

  // Written form state
  const [form, setForm] = useState({ nombre: "", telefono: "", correo: "", mensaje: "" });
  const [formAccepted, setFormAccepted] = useState(false);
  const [formSent, setFormSent] = useState(false);

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const sendForm = () => {
    if (!formAccepted || !form.nombre || !form.correo || !form.mensaje) return;
    setFormSent(true);
  };

  const formValid = formAccepted && form.nombre.trim() && form.correo.trim() && form.mensaje.trim();

  return (
    <section id="buzon" className="bg-card px-5 py-20 text-foreground md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="lg:sticky lg:top-8">
          <p className="mb-4 font-['Montserrat'] text-xs font-bold uppercase tracking-[0.28em] text-accent">Buzón de historias</p>
          <h2 className="font-['Poppins'] text-4xl font-black leading-[0.96] text-secondary md:text-6xl">Queremos escucharte</h2>
          <div className="mt-4 h-1.5 w-72 max-w-full bg-accent" />
          <p className="mt-8 max-w-md font-['Montserrat'] text-lg leading-8 text-foreground/80">
            Comparte tu historia como prefieras: graba un audio de máximo <strong>90 segundos</strong> o escríbenos directamente. Puede ser anónimo.
          </p>
        </div>

        <div className="w-full min-w-0 rounded-[2rem] border border-border bg-[#F9F4EE] p-4 shadow-[0_24px_80px_rgba(31,78,95,0.12)] sm:p-5 md:p-8">

          {/* Tab switcher */}
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5">
            <button
              type="button"
              onClick={() => setTab("audio")}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-3 font-['Montserrat'] text-xs font-bold transition sm:gap-2 sm:px-4 sm:text-sm ${tab === "audio" ? "bg-secondary text-secondary-foreground shadow-sm" : "text-secondary/60 hover:text-secondary"}`}
            >
              <Mic className="size-4 shrink-0" /> Grabar audio
            </button>
            <button
              type="button"
              onClick={() => setTab("escrito")}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-3 font-['Montserrat'] text-xs font-bold transition sm:gap-2 sm:px-4 sm:text-sm ${tab === "escrito" ? "bg-secondary text-secondary-foreground shadow-sm" : "text-secondary/60 hover:text-secondary"}`}
            >
              <Mail className="size-4 shrink-0" /> Escribir mensaje
            </button>
          </div>

          {/* Audio tab */}
          {tab === "audio" && (
            <>
              <div className="rounded-[1.5rem] bg-white p-4 text-center sm:p-6 md:p-8">
                <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Mic className="size-7" />
                </div>
                <h3 className="font-['Poppins'] text-2xl font-bold text-secondary">Contando Historias</h3>
                <p className="mt-2 font-['Montserrat'] text-sm text-muted-foreground">¿Tu micrófono está listo?</p>

                <div className="mx-auto mt-8 w-full rounded-2xl border border-border bg-[#F7EFE6] p-4 sm:p-5">
                  <div className="mb-5 flex items-center justify-between font-['Montserrat'] text-sm font-semibold text-secondary">
                    <span>Audio</span>
                    <span className="tabular-nums">{timer} / 05:00</span>
                  </div>
                  <div className="mb-6 flex h-16 items-end justify-center gap-1 overflow-hidden rounded-xl bg-white px-2 py-3 sm:gap-1.5 sm:px-4">
                    {Array.from({ length: 28 }).map((_, index) => (
                      <span
                        key={index}
                        className={`w-1.5 shrink-0 rounded-full ${state === "recording" ? "bg-accent" : "bg-secondary/30"}`}
                        style={{ height: `${18 + ((index * 13 + seconds * 7) % 42)}px` }}
                      />
                    ))}
                  </div>
                  {state === "idle" && (
                    <button onClick={start} className="flex w-full items-center justify-center gap-3 rounded-xl bg-secondary px-4 py-4 font-['Montserrat'] text-sm font-bold text-secondary-foreground transition hover:bg-[#173A46] sm:px-6">
                      <Mic className="size-5 shrink-0" /> Empezar a grabar
                    </button>
                  )}
                  {state === "recording" && (
                    <button onClick={stop} className="flex w-full items-center justify-center gap-3 rounded-xl bg-accent px-4 py-4 font-['Montserrat'] text-sm font-bold text-accent-foreground transition hover:brightness-95 sm:px-6">
                      <CircleStop className="size-5 shrink-0" /> Detener grabación
                    </button>
                  )}
                  {state === "recorded" && (
                    <div className="grid gap-3 grid-cols-2">
                      <button className="flex items-center justify-center gap-2 rounded-xl border border-secondary/25 px-3 py-4 font-['Montserrat'] text-sm font-bold text-secondary transition hover:bg-secondary/5">
                        <Play className="size-4 shrink-0" /> Escuchar
                      </button>
                      <button onClick={reset} className="flex items-center justify-center gap-2 rounded-xl border border-secondary/25 px-3 py-4 font-['Montserrat'] text-sm font-bold text-secondary transition hover:bg-secondary/5">
                        <Pause className="size-4 shrink-0" /> Repetir
                      </button>
                    </div>
                  )}
                  {state === "sent" && (
                    <div className="rounded-xl bg-primary px-4 py-4 font-['Montserrat'] text-sm font-bold text-primary-foreground">
                      <Check className="mr-2 inline size-5" /> Historia recibida. Gracias por confiar.
                    </div>
                  )}
                </div>

                <div className="mt-5 flex justify-center gap-2 font-['Montserrat'] text-xs font-semibold text-muted-foreground">
                  <span className={state !== "idle" ? "text-secondary" : ""}>① Graba</span>
                  <span>·</span>
                  <span className={state === "recorded" || state === "sent" ? "text-secondary" : ""}>② Escucha</span>
                  <span>·</span>
                  <span className={state === "sent" ? "text-secondary" : ""}>③ Envía</span>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-secondary p-4 text-secondary-foreground sm:p-6 md:p-8">
                <h4 className="font-['Poppins'] text-xl font-black leading-tight sm:text-2xl md:text-3xl">¿Cómo podemos contactarte?</h4>
                <p className="mt-4 font-['Montserrat'] text-sm leading-7 text-secondary-foreground/80 sm:text-base">
                  Deja tus datos para que podamos comunicarnos contigo si tu historia es seleccionada. El teléfono es opcional.
                </p>
                <div className="mt-6 grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary-foreground/70">Nombre *</label>
                      <input
                        name="nombre"
                        value={audioContact.nombre}
                        onChange={handleAudioContact}
                        placeholder="Tu nombre"
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-['Montserrat'] text-sm text-secondary-foreground placeholder:text-secondary-foreground/40 outline-none transition focus:border-white/50 focus:bg-white/15"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary-foreground/70">Teléfono</label>
                      <input
                        name="telefono"
                        value={audioContact.telefono}
                        onChange={handleAudioContact}
                        placeholder="+52 33 0000 0000"
                        type="tel"
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-['Montserrat'] text-sm text-secondary-foreground placeholder:text-secondary-foreground/40 outline-none transition focus:border-white/50 focus:bg-white/15"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary-foreground/70">Correo electrónico *</label>
                    <input
                      name="correo"
                      value={audioContact.correo}
                      onChange={handleAudioContact}
                      placeholder="tucorreo@email.com"
                      type="email"
                      className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-['Montserrat'] text-sm text-secondary-foreground placeholder:text-secondary-foreground/40 outline-none transition focus:border-white/50 focus:bg-white/15"
                    />
                  </div>
                </div>
                <label className="mt-6 flex cursor-pointer items-start gap-3 font-['Montserrat'] text-sm leading-6">
                  <input type="checkbox" checked={audioAccepted} onChange={(e) => setAudioAccepted(e.target.checked)} className="mt-1 size-5 shrink-0 accent-[#F08329]" />
                  Acepto compartir mi audio y datos con Contando Historias Podcast y confirmo que soy autor/a del material enviado.
                </label>
                <button onClick={sendAudio} disabled={state !== "recorded" || !audioContactValid} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-accent px-4 py-4 font-['Montserrat'] text-sm font-bold text-accent-foreground transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45">
                  <Send className="size-5 shrink-0" /> Enviar mi historia
                </button>
              </div>
            </>
          )}

          {/* Written tab */}
          {tab === "escrito" && (
            <>
              {formSent ? (
                <div className="rounded-[1.5rem] bg-white px-6 py-16 text-center sm:px-8">
                  <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-7" />
                  </div>
                  <h3 className="font-['Poppins'] text-2xl font-bold text-secondary">¡Mensaje recibido!</h3>
                  <p className="mt-3 font-['Montserrat'] text-muted-foreground">Gracias por compartir tu historia con nosotros. Te contactaremos pronto.</p>
                </div>
              ) : (
                <div className="rounded-[1.5rem] bg-white p-4 sm:p-6 md:p-8">
                  <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Mail className="size-7" />
                  </div>
                  <h3 className="text-center font-['Poppins'] text-2xl font-bold text-secondary">Cuéntanos tu historia</h3>
                  <p className="mt-2 text-center font-['Montserrat'] text-sm text-muted-foreground">Todos los campos marcados con * son obligatorios.</p>

                  <div className="mt-8 grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Nombre *</label>
                        <input
                          name="nombre"
                          value={form.nombre}
                          onChange={handleField}
                          placeholder="Tu nombre completo"
                          className="w-full rounded-xl border border-border bg-[#F7EFE6] px-4 py-3 font-['Montserrat'] text-sm text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Teléfono</label>
                        <input
                          name="telefono"
                          value={form.telefono}
                          onChange={handleField}
                          placeholder="+52 33 0000 0000"
                          type="tel"
                          className="w-full rounded-xl border border-border bg-[#F7EFE6] px-4 py-3 font-['Montserrat'] text-sm text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Correo electrónico *</label>
                      <input
                        name="correo"
                        value={form.correo}
                        onChange={handleField}
                        placeholder="tucorreo@email.com"
                        type="email"
                        className="w-full rounded-xl border border-border bg-[#F7EFE6] px-4 py-3 font-['Montserrat'] text-sm text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Tu historia *</label>
                      <textarea
                        name="mensaje"
                        value={form.mensaje}
                        onChange={handleField}
                        placeholder="Cuéntanos brevemente tu historia, una decisión valiente, un momento de cambio o lo que quieras compartir con el podcast..."
                        rows={5}
                        className="w-full resize-none rounded-xl border border-border bg-[#F7EFE6] px-4 py-3 font-['Montserrat'] text-sm text-foreground outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {!formSent && (
                <div className="mt-6 rounded-[1.5rem] bg-secondary p-4 text-secondary-foreground sm:p-6 md:p-8">
                  <h4 className="font-['Poppins'] text-xl font-black leading-tight sm:text-2xl md:text-3xl">Tu información está segura.</h4>
                  <p className="mt-4 font-['Montserrat'] text-sm leading-7 text-secondary-foreground/80 sm:text-base">
                    Tus datos solo se usarán para contactarte si tu historia es seleccionada. Nunca los compartiremos con terceros.
                  </p>
                  <label className="mt-6 flex cursor-pointer items-start gap-3 font-['Montserrat'] text-sm leading-6">
                    <input type="checkbox" checked={formAccepted} onChange={(e) => setFormAccepted(e.target.checked)} className="mt-1 size-5 shrink-0 accent-[#F08329]" />
                    Acepto que Contando Historias guarde mis datos y me contacte sobre mi historia.
                  </label>
                  <button onClick={sendForm} disabled={!formValid} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-accent px-4 py-4 font-['Montserrat'] text-sm font-bold text-accent-foreground transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45">
                    <Send className="size-5 shrink-0" /> Enviar mensaje
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

type Story = {
  id: number;
  slug: string;
  title: string;
  author: string;
  date: string;
  readTime: string;
  tag: string;
  featured: boolean;
  published: boolean;
  scheduledAt: string;
  excerpt: string;
  body: string[];
  seoDescription: string;
  seoSlug: string;
  coverImage: string;
  questions: string[];
};

type Submission = {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  tipo: "audio" | "escrito";
  contenido: string;
  fecha: string;
  status: "pendiente" | "revisado" | "seleccionado" | "descartado";
};

type Subscriber = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  fecha: string;
};

const MOCK_SUBMISSIONS: Submission[] = [
  { id: 1, nombre: "Laura Gómez", correo: "laura@email.com", telefono: "+52 33 1234 5678", tipo: "escrito", contenido: "Quería contarles que hace dos años tuve que dejar mi trabajo para cuidar a mi mamá. Fue la decisión más difícil de mi vida pero también la más humana. Aprendí que el cuidado también es un acto político.", fecha: "15 jun 2026", status: "pendiente" },
  { id: 2, nombre: "Anónimo", correo: "anon@proton.me", telefono: "", tipo: "audio", contenido: "audio_submission_002.m4a · 1:47 min", fecha: "12 jun 2026", status: "revisado" },
  { id: 3, nombre: "Carlos V.", correo: "carlos.v@gmail.com", telefono: "+52 55 9876 5432", tipo: "escrito", contenido: "Mi historia es sobre cómo dejé la Ciudad de México después de 15 años para volver a mi pueblo. Todos me dijeron que estaba loco. Pero fue lo mejor que hice.", fecha: "8 jun 2026", status: "seleccionado" },
  { id: 4, nombre: "Fernanda R.", correo: "fer.r@outlook.com", telefono: "", tipo: "audio", contenido: "audio_submission_004.mp3 · 2:13 min", fecha: "3 jun 2026", status: "pendiente" },
  { id: 5, nombre: "Miguel Ángel S.", correo: "mas@gmail.com", telefono: "+52 81 5555 0000", tipo: "escrito", contenido: "Cuando perdí mi trabajo durante la pandemia pensé que todo se acababa. Resultó ser el inicio de la etapa más creativa de mi vida.", fecha: "28 may 2026", status: "descartado" },
];

const MOCK_SUBSCRIBERS: Subscriber[] = [
  { id: 1, nombre: "Paola", apellido: "Martínez", email: "paola.m@gmail.com", fecha: "20 jun 2026" },
  { id: 2, nombre: "Rodrigo", apellido: "Fuentes", email: "rfuentes@hotmail.com", fecha: "18 jun 2026" },
  { id: 3, nombre: "Andrea", apellido: "López", email: "andrea.lopez@gmail.com", fecha: "15 jun 2026" },
  { id: 4, nombre: "Tomás", apellido: "Herrera", email: "tomas.h@gmail.com", fecha: "10 jun 2026" },
  { id: 5, nombre: "Daniela", apellido: "Castro", email: "dani.castro@yahoo.com", fecha: "5 jun 2026" },
  { id: 6, nombre: "Emilio", apellido: "Vargas", email: "e.vargas@gmail.com", fecha: "1 jun 2026" },
];

const INITIAL_STORIES: Story[] = [
  {
    id: 1,
    slug: "me-fui-sin-tener-todas-las-respuestas",
    title: "Me fui sin tener todas las respuestas",
    author: "Ana Laura",
    date: "12 de junio, 2025",
    readTime: "6 min",
    tag: "Cambio de país",
    featured: true,
    published: true,
    scheduledAt: "",
    seoDescription: "",
    seoSlug: "",
    coverImage: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    questions: ["¿Hubo un momento en tu vida donde tuviste que irte sin tener todo claro?", "¿Qué te impidió dar un salto parecido al de Ana Laura? ¿O qué te ayudó a darlo?", "¿Qué significa para ti 'estar lista o listo' para algo?"],
    excerpt: "Tenía 28 años, un trabajo estable y una familia que me amaba. Y aun así, algo en mí sabía que necesitaba irme.",
    body: [
      "Tenía 28 años, un trabajo estable y una familia que me amaba. Y aun así, algo en mí sabía que necesitaba irme. No era insatisfacción, era curiosidad. Una curiosidad que me quemaba por dentro cada vez que veía un avión cruzar el cielo desde la ventana de mi oficina.",
      "La decisión no llegó de golpe. Llegó en capas, como cuando pelas una cebolla y no sabes cuántas capas faltan. Primero fue el pensamiento fugaz: \"¿y si me voy a estudiar afuera?\". Luego fue investigar becas a las 2 de la mañana. Luego fue no poder dormir sin pensar en ello.",
      "Mi mamá me preguntó si estaba segura. Le dije que no. Creo que eso fue lo más honesto que le he dicho en mi vida. No estaba segura de nada, pero estaba segura de que si no lo intentaba, me arrepentiría para siempre.",
      "Llegué a Canadá con una maleta de 23 kilos, un inglés funcional y mucho miedo. El primer mes lloré casi todos los días. No por extrañar, sino por la inmensidad de haberlo hecho. Por la extraña mezcla de orgullo y terror que te da cuando finalmente haces la cosa que tanto temías.",
      "Hoy, tres años después, no tengo todas las respuestas. Pero aprendí algo que nadie me había enseñado: no necesitas tenerlas para empezar.",
    ],
  },
  {
    id: 2,
    slug: "como-aprendi-a-empezar-de-nuevo",
    title: "Cómo aprendí a empezar de nuevo",
    author: "Natalí Salazar",
    date: "28 de mayo, 2025",
    readTime: "5 min",
    tag: "Emprendimiento",
    featured: false,
    published: true,
    scheduledAt: "",
    seoDescription: "",
    seoSlug: "",
    coverImage: "https://images.unsplash.com/photo-1520460095596-52dcd38c5f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    questions: ["¿Tú también has cerrado algo que te costó mucho construir? ¿Cómo lo viviste?", "¿Qué romanticizamos del emprendimiento que nadie nos dice antes de empezar?", "¿Cuándo supiste que era momento de soltar algo que ya no funcionaba?"],
    excerpt: "Cerré mi negocio un martes por la mañana. Firmé los papeles, salí, me compré un café y me senté en una banca a llorar.",
    body: [
      "Cerré mi negocio un martes por la mañana. Firmé los papeles, salí, me compré un café y me senté en una banca a llorar. No porque hubiera fracasado, sino porque por fin había tomado la decisión que llevaba dos años evitando.",
      "Emprender se romantiza mucho. Te dicen que es libertad, que es pasión, que es construir algo tuyo. Y sí, es todo eso. Pero también es incertidumbre crónica, noches sin dormir y la extraña soledad de ser la única que puede resolver los problemas.",
      "Mi cafetería duró cuatro años. En esos cuatro años aprendí más sobre mí misma que en los diez anteriores juntos. Aprendí que soy más resiliente de lo que creía. Que pedir ayuda no es debilidad. Que a veces cerrar una puerta es el acto más valiente que existe.",
      "Empezar de nuevo no se siente como un comienzo. Se siente como un vacío. Un espacio en blanco que da miedo porque no sabes qué va a llenarlo. Pero con el tiempo, ese espacio se convierte en posibilidad.",
      "Hoy estoy construyendo algo nuevo. No sé si va a funcionar. Pero esta vez lo hago sabiendo que puedo sobrevivir si no funciona. Y eso lo cambia todo.",
    ],
  },
  {
    id: 3,
    slug: "la-decision-que-cambio-mi-familia",
    title: "La decisión que cambió mi familia",
    author: "Mariana R.",
    date: "10 de mayo, 2025",
    readTime: "7 min",
    tag: "Familia",
    featured: false,
    published: true,
    scheduledAt: "",
    seoDescription: "",
    seoSlug: "",
    coverImage: "https://images.unsplash.com/photo-1610986719243-7cdf28a29772?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    questions: ["¿Hay algún límite que te costó mucho trabajo poner con alguien que quieres?", "¿Cómo cambió una relación importante cuando empezaste a decir que no?", "¿En tu familia, el amor se demostró más con presencia o con palabras?"],
    excerpt: "Cuando le dije a mi mamá que no iría a su cumpleaños, hubo un silencio que duró segundos pero se sintió como años.",
    body: [
      "Cuando le dije a mi mamá que no iría a su cumpleaños, hubo un silencio que duró segundos pero se sintió como años. No fui por cuidarme. Por primera vez en mucho tiempo, elegí a mí misma.",
      "Crecí en una familia donde el amor se expresaba a través de la presencia. Estar era querer. Faltar era una herida. Aprendí muy temprano a aparecer aunque estuviera rota, aunque estuviera agotada, aunque no pudiera más.",
      "Esa dinámica me costó años de terapia entender. Y todavía más años practicar. Porque entender algo con la cabeza y cambiarlo con el cuerpo son dos cosas completamente distintas.",
      "El día que no fui a ese cumpleaños sentí culpa, miedo y una extraña paz que no sabía cómo nombrar. Después supe que esa paz se llama límite. Que poner un límite no es dejar de amar. Es amarse también a una misma.",
      "Mi relación con mi mamá cambió después de eso. No de golpe, no perfectamente. Pero cambió. Empezamos a hablar de verdad, no solo de lo que se espera que digas en una llamada familiar. Y eso, para mí, vale más que cualquier presencia forzada.",
    ],
  },
  {
    id: 4,
    slug: "el-dia-que-deje-de-fingir-que-estaba-bien",
    title: "El día que dejé de fingir que estaba bien",
    author: "Rodrigo M.",
    date: "22 de abril, 2025",
    readTime: "8 min",
    tag: "Salud mental",
    featured: false,
    published: true,
    scheduledAt: "",
    seoDescription: "",
    seoSlug: "",
    coverImage: "https://images.unsplash.com/photo-1714976694810-85add1a29c96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    questions: ["¿Cuánto tiempo tardaste en pedir ayuda cuando la necesitabas? ¿Qué te frenó?", "¿Qué te enseñó sobre ti mismo una crisis que no esperabas tener?", "¿Cómo describes la diferencia entre estar bien y estar presente?"],
    excerpt: "Pedir ayuda fue lo más difícil que he hecho. Más que cambiar de trabajo, más que terminar una relación. Porque implica admitir lo que uno lleva años callando.",
    body: [
      "Pedir ayuda fue lo más difícil que he hecho. Más que cambiar de trabajo, más que terminar una relación. Porque implica admitir lo que uno lleva años callando.",
      "Yo aprendí de chico que los hombres no lloran. Que los problemas se resuelven solos. Que mostrar vulnerabilidad es sinónimo de debilidad. Esas ideas se instalan tan profundo que uno ni siquiera las cuestiona. Solo vive con ellas, cargándolas en silencio.",
      "El detonante fue una crisis de ansiedad en el metro. Me bajé en la estación que no era, me senté en el piso y no pude moverme por veinte minutos. La gente pasaba a mi lado. Nadie preguntó nada. Y yo pensé: así exactamente me he sentido por dentro los últimos tres años.",
      "Busqué un psicólogo esa misma semana. La primera sesión fue incómoda, torpe, llena de silencios. Pero fui. Y seguí yendo. Y poco a poco empecé a entender que pedir ayuda no es rendirse. Es, de hecho, el primer acto de verdadera valentía.",
      "Hoy no estoy curado de nada. Pero estoy presente. Y esa diferencia lo es todo.",
    ],
  },
  {
    id: 5,
    slug: "aprendi-a-cocinar-y-me-salve-la-vida",
    title: "Aprendí a cocinar y me salvé la vida",
    author: "Sofía C.",
    date: "5 de abril, 2025",
    readTime: "4 min",
    tag: "Duelo",
    featured: false,
    published: true,
    scheduledAt: "",
    seoDescription: "",
    seoSlug: "",
    coverImage: "https://images.unsplash.com/photo-1592837613828-4b65deb44f15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    questions: ["¿Qué ritual o hábito te ayudó a procesar una pérdida?", "¿Hay algo que heredaste de alguien que ya no está que te define hoy?", "¿Cómo describes tu propio duelo? ¿Se parece al que describes Sofía o es completamente diferente?"],
    excerpt: "Cuando murió mi abuela, heredé sus cuadernos de recetas. No sabía que cocinarlas sería la forma en que aprendería a despedirme de ella.",
    body: [
      "Cuando murió mi abuela, heredé sus cuadernos de recetas. Tres libretas de pasta dura llenas de su letra apretada, con manchas de aceite y anotaciones al margen como 'más ajo' o 'esto le encantaba a tu tío Carlos'.",
      "No sé cocinar. O no sabía. Me metía a la cocina solo para calentar cosas o hacer café. Pero esa tarde, con las libretas en la mano, decidí intentar hacer su arroz con leche.",
      "Me quedó horrible la primera vez. Y la segunda. A la tercera vez, cuando por fin me acercaba al sabor que recordaba, me puse a llorar sin parar. No de tristeza. De algo que no sé cómo llamar. Reconocimiento, quizás. La sensación de que ella seguía ahí, en ese olor, en esa textura.",
      "Cocinar sus recetas se convirtió en mi ritual de duelo. Cada sábado hago algo de su libreta. Cada vez aprendo algo nuevo sobre ella, sobre mí, sobre lo que significa querer a alguien que ya no está.",
      "El duelo no se supera. Se transforma. Y a veces, si tienes suerte, se convierte en algo que puedes compartir con otros.",
    ],
  },
  {
    id: 6,
    slug: "me-divorcié-y-volví-a-nacer",
    title: "Me divorcié y volví a nacer",
    author: "Carmen V.",
    date: "18 de marzo, 2025",
    readTime: "6 min",
    tag: "Relaciones",
    featured: false,
    published: true,
    scheduledAt: "",
    seoDescription: "",
    seoSlug: "",
    coverImage: "https://images.unsplash.com/photo-1529218164294-0d21b06ea831?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    questions: ["¿Hubo un momento en que dejaste de reconocerte dentro de una relación o rol? ¿Cómo te diste cuenta?", "¿Qué significa para ti volver a ti mismo después de perderte?", "¿Qué le dirías a alguien que siente que 'tiene todo' pero algo importante falta?"],
    excerpt: "Doce años de matrimonio. Dos hijas. Una casa bonita. Y una mujer que había olvidado completamente quién era antes de todo eso.",
    body: [
      "Doce años de matrimonio. Dos hijas. Una casa bonita. Y una mujer que había olvidado completamente quién era antes de todo eso.",
      "No hubo una traición, ni una pelea devastadora. Hubo algo más silencioso y más difícil de nombrar: la acumulación de años siendo alguien que no era yo. La versión de mí que creía que debía ser, que sonreía en las fotos, que organizaba las cenas de navidad, que nunca decía lo que realmente pensaba.",
      "Cuando le dije a mi ex que quería separarme, él me preguntó por qué. Le dije: porque necesito recordar quién soy. No lo entendió. Yo tampoco lo entendía del todo todavía.",
      "Los primeros meses sola fueron los más extraños de mi vida. Ruidosos por dentro, silenciosos por fuera. Pero poco a poco empezaron a aparecer cosas. Me acordé que me gustaba leer. Que quería aprender a pintar. Que tenía opiniones sobre política que nunca decía en voz alta.",
      "Mis hijas me ven distinta ahora. Más presente, dicen. Supongo que tiene sentido: cuando una vuelve a sí misma, puede estar de verdad con los demás.",
    ],
  },
  {
    id: 7,
    slug: "deje-la-carrera-que-todos-querían-para-mí",
    title: "Dejé la carrera que todos querían para mí",
    author: "Diego A.",
    date: "2 de marzo, 2025",
    readTime: "5 min",
    tag: "Vocación",
    featured: false,
    published: false,
    scheduledAt: "",
    seoDescription: "",
    seoSlug: "",
    coverImage: "https://images.unsplash.com/photo-1667053508464-eb11b394df83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    questions: ["¿Hay algo que siempre quisiste hacer pero nunca te diste permiso de intentar?", "¿Qué carrera, rol o camino seguiste más por expectativas de otros que por elección propia?", "¿Qué dirías hoy a alguien que está pensando en cambiar de rumbo profesional?"],
    excerpt: "Tres años de ingeniería. Buenas calificaciones. Un futuro claro. Y una certeza creciente de que todo eso no tenía nada que ver conmigo.",
    body: [
      "Tres años de ingeniería. Buenas calificaciones. Un futuro claro. Y una certeza creciente de que todo eso no tenía nada que ver conmigo.",
      "Mi papá es ingeniero. Mi tío es ingeniero. La carrera no fue una elección, fue una herencia. Algo que se asumía sin cuestionarse, como el apellido o el lugar donde uno crece.",
      "El momento en que lo supe fue en una clase de termodinámica. El profesor explicaba algo y yo miraba por la ventana, pensando en el guión que llevaba semanas escribiendo en secreto. Pensé: si pudiera elegir estar en cualquier lugar ahora mismo, no sería aquí.",
      "Decirle a mi familia fue la conversación más larga de mi vida. Hubo lágrimas, silencios, argumentos sobre el dinero y el futuro. Pero también, al final, algo que no esperaba: mi papá diciéndome que él también había querido hacer otra cosa.",
      "Hoy estudio guion en una escuela pequeña, trabajo de mesero los fines de semana y soy más feliz de lo que nunca fui con mis buenas calificaciones.",
    ],
  },
  {
    id: 8,
    slug: "adopte-un-perro-y-aprendi-a-quedarme",
    title: "Adopté un perro y aprendí a quedarme",
    author: "Valentina H.",
    date: "14 de febrero, 2025",
    readTime: "4 min",
    tag: "Resiliencia",
    featured: false,
    published: true,
    scheduledAt: "",
    seoDescription: "",
    seoSlug: "",
    coverImage: "https://images.unsplash.com/photo-1767958325352-fdc5ea983dcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80",
    questions: ["¿Hay algo o alguien que te ancló en un momento en que todo en ti quería escapar?", "¿Cómo describes la diferencia entre huir y soltar?", "¿Qué aprendiste sobre ti cuando decidiste quedarte en lugar de irte?"],
    excerpt: "Siempre fui de las que huye. De ciudades, de trabajos, de relaciones. Hasta que llegó Canelo y me enseñó que quedarse también puede ser valiente.",
    body: [
      "Siempre fui de las que huye. De ciudades, de trabajos, de relaciones. Lo llamaba libertad. Ahora sé que era miedo con mejor marketing.",
      "Adopté a Canelo en un momento de mi vida en que todo lo demás estaba en pausa. Recién había terminado una relación, había renunciado a un trabajo y estaba pensando en cambiar de ciudad otra vez. Un perro callejero, flaco, con las orejas chuecas.",
      "Lo que no había calculado es lo que significa tener a alguien que depende de ti. Canelo me necesitaba. Necesitaba ser paseado, alimentado, acompañado. Por primera vez en años, yo era el punto fijo de algo.",
      "Quedarse no siempre es rendirse. A veces quedarse es lo más radical que puedes hacer. Es decir: este lugar, esta vida, este momento, valen la pena.",
      "No me cambié de ciudad. Llevo ya dieciocho meses aquí. Los más largos que he pasado en un mismo lugar en diez años. Y Canelo duerme en mis pies mientras escribo esto.",
    ],
  },
];

const ALL_TAGS = ["Todos", "Cambio de país", "Emprendimiento", "Familia", "Salud mental", "Duelo", "Relaciones", "Vocación", "Resiliencia"];

const tagColors: Record<string, string> = {
  "Cambio de país": "bg-[#9BB4C7]/30 text-[#1F4E5F]",
  "Emprendimiento": "bg-[#F08329]/15 text-[#B05A10]",
  "Familia": "bg-[#018060]/15 text-[#015040]",
  "Salud mental": "bg-[#F2C94C]/20 text-[#7A6020]",
  "Duelo": "bg-[#9BB4C7]/30 text-[#1F4E5F]",
  "Relaciones": "bg-[#F5B6CF]/30 text-[#8B3A5A]",
  "Vocación": "bg-[#F08329]/15 text-[#B05A10]",
  "Resiliencia": "bg-[#018060]/15 text-[#015040]",
};

function StoryCard({ story, onRead, index }: { story: Story; onRead: (s: Story) => void; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      onClick={() => onRead(story)}
    >
      {/* Cover image */}
      <div className="relative h-44 w-full overflow-hidden">
        {story.coverImage ? (
          <img
            src={story.coverImage}
            alt={story.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${index % 3 === 0 ? "from-secondary to-[#173A46]" : index % 3 === 1 ? "from-accent/80 to-[#B05A10]" : "from-primary to-[#015040]"}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 font-['Montserrat'] text-xs font-bold backdrop-blur-sm ${tagColors[story.tag] ?? "bg-white/80 text-secondary"}`}>
          {story.tag}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="font-['Montserrat'] text-xs text-muted-foreground">{story.readTime} de lectura</span>
        </div>
        <h3 className="font-['Poppins'] text-lg font-black leading-snug text-secondary transition-colors group-hover:text-accent">{story.title}</h3>
        <p className="mt-2 flex-1 font-['Montserrat'] text-sm leading-7 text-foreground/65 line-clamp-3">{story.excerpt}</p>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="font-['Montserrat'] text-sm font-bold text-secondary">{story.author}</p>
            <p className="font-['Montserrat'] text-xs text-muted-foreground">{story.date}</p>
          </div>
          <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors group-hover:bg-accent">
            <ArrowRight className="size-3.5" />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function BlogPage({ stories, onBack, onRead }: { stories: Story[]; onBack: () => void; onRead: (s: Story) => void }) {
  const [activeTag, setActiveTag] = useState("Todos");
  const published = stories.filter((s) => s.published);
  const featured = published.find((s) => s.featured) ?? published[0];
  const filtered = published.filter((s) => s.id !== featured?.id && (activeTag === "Todos" || s.tag === activeTag));
  const availableTags = ALL_TAGS.filter((t) => t === "Todos" || published.some((s) => s.tag === t));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-[#F9F4EE]/90 px-5 py-4 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <button onClick={onBack} className="flex items-center gap-2 font-['Montserrat'] text-sm font-bold text-secondary hover:text-accent">
            ← Volver al sitio
          </button>
          <p className="font-['Poppins'] text-lg font-black text-secondary">Historias escritas</p>
          <p className="font-['Montserrat'] text-sm text-muted-foreground">{published.length} historias</p>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary px-5 py-20 text-secondary-foreground md:py-28">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[#F08329]/8" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-white/10" />
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 font-['Montserrat'] text-xs font-bold uppercase tracking-[0.32em] text-[#F2C94C]">Blog · Contando Historias</p>
          <h1 className="max-w-3xl font-['Poppins'] text-5xl font-black leading-[0.93] md:text-7xl">Historias que merecen ser leídas.</h1>
          <p className="mt-6 max-w-xl font-['Montserrat'] text-lg leading-8 text-secondary-foreground/70">Relatos reales de personas comunes con decisiones valientes. Cada historia es un espejo.</p>
        </div>
      </section>

      {/* Featured story */}
      {featured && (
        <section className="px-5 py-12">
          <div className="mx-auto max-w-6xl">
            <p className="mb-5 font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-accent">Historia destacada</p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => onRead(featured)}
              className="group cursor-pointer overflow-hidden rounded-[2rem] border border-border bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              {featured.coverImage && (
                <div className="relative h-64 w-full overflow-hidden md:h-72">
                  <img src={featured.coverImage} alt={featured.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <span className={`absolute left-6 top-6 rounded-full px-3 py-1 font-['Montserrat'] text-xs font-bold backdrop-blur-sm ${tagColors[featured.tag] ?? "bg-white/80 text-secondary"}`}>{featured.tag}</span>
                </div>
              )}
              <div className="p-8 md:p-10">
                {!featured.coverImage && (
                  <div className="mb-5 flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 font-['Montserrat'] text-xs font-bold ${tagColors[featured.tag] ?? "bg-muted text-secondary"}`}>{featured.tag}</span>
                    <span className="font-['Montserrat'] text-xs text-muted-foreground">{featured.readTime} de lectura</span>
                  </div>
                )}
                {featured.coverImage && <p className="mb-3 font-['Montserrat'] text-xs text-muted-foreground">{featured.readTime} de lectura</p>}
                <h2 className="font-['Poppins'] text-3xl font-black leading-tight text-secondary transition-colors group-hover:text-accent md:text-4xl">{featured.title}</h2>
                <p className="mt-4 max-w-2xl font-['Lora'] text-lg italic leading-8 text-foreground/75">{featured.excerpt}</p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary font-['Poppins'] text-base font-black text-secondary-foreground">
                    {featured.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-['Montserrat'] text-sm font-bold text-secondary">{featured.author}</p>
                    <p className="font-['Montserrat'] text-xs text-muted-foreground">{featured.date}</p>
                  </div>
                  <span className="ml-auto flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 font-['Montserrat'] text-sm font-bold text-secondary-foreground transition-colors group-hover:bg-accent">
                    Leer historia <ArrowRight className="size-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Filter + grid */}
      <section className="px-5 pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`rounded-full border px-4 py-2 font-['Montserrat'] text-sm font-bold transition ${activeTag === tag ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card text-secondary hover:border-secondary/40"}`}
              >
                {tag}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="py-16 text-center font-['Montserrat'] text-muted-foreground">No hay historias en esta categoría aún.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((story, i) => (
                <StoryCard key={story.id} story={story} onRead={onRead} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

type Reaction = "❤️" | "🙌" | "💭" | "✨";
const REACTIONS: Reaction[] = ["❤️", "🙌", "💭", "✨"];
const REACTION_LABELS: Record<Reaction, string> = { "❤️": "Me tocó", "🙌": "Así fue", "💭": "Me hizo pensar", "✨": "Inspirador" };

type StoryResponse = {
  id: number;
  author: string;
  text: string;
  date: string;
  questionIndex: number;
  reactions: Record<Reaction, number>;
};

const MOCK_RESPONSES: StoryResponse[] = [
  { id: 1, author: "Paulina G.", text: "Yo también lo viví. Me fui a España sin tener nada claro y lo que creí que iba a ser un fracaso terminó siendo lo mejor que me pasó. La incertidumbre es rara, te enseña mucho.", date: "hace 2 días", questionIndex: 0, reactions: { "❤️": 8, "🙌": 5, "💭": 2, "✨": 3 } },
  { id: 2, author: "Andrés T.", text: "Siempre pensé que 'estar lista' significaba no tener miedo. Ahora entiendo que significa ir aunque tengas miedo.", date: "hace 4 días", questionIndex: 2, reactions: { "❤️": 14, "🙌": 3, "💭": 6, "✨": 4 } },
  { id: 3, author: "Marce V.", text: "Mi abuela siempre decía 'uno sale cuando ya no cabe'. Nunca entendí eso hasta que renuncié a mi trabajo sin tener otro. Ahora lo entiendo completamente.", date: "hace 1 semana", questionIndex: 0, reactions: { "❤️": 21, "🙌": 9, "💭": 4, "✨": 7 } },
];

function ConversationSection({ story }: { story: Story }) {
  const [activeQ, setActiveQ] = useState<number | null>(null);
  const [responses, setResponses] = useState<StoryResponse[]>(MOCK_RESPONSES);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [expandedResponses, setExpandedResponses] = useState<Set<number>>(new Set([0]));
  const [votedReactions, setVotedReactions] = useState<Record<number, Set<Reaction>>>({});

  const toggleReaction = (responseId: number, emoji: Reaction) => {
    setVotedReactions((prev) => {
      const current = new Set(prev[responseId] ?? []);
      const alreadyVoted = current.has(emoji);
      if (alreadyVoted) current.delete(emoji); else current.add(emoji);
      return { ...prev, [responseId]: current };
    });
    setResponses((prev) => prev.map((r) => {
      if (r.id !== responseId) return r;
      const alreadyVoted = votedReactions[responseId]?.has(emoji);
      return { ...r, reactions: { ...r.reactions, [emoji]: r.reactions[emoji] + (alreadyVoted ? -1 : 1) } };
    }));
  };

  const questions = story.questions?.length ? story.questions : [
    "¿Qué cambió en tu forma de ver este tema después de leer esta historia?",
    "¿Hay alguna experiencia propia que te hizo pensar diferente?",
    "¿Qué conversación te gustaría tener a partir de esto?",
  ];

  const handleSubmit = () => {
    if (!text.trim()) return;
    const newResponse: StoryResponse = {
      id: Date.now(),
      author: name.trim() || "Anónimo",
      text: text.trim(),
      date: "ahora mismo",
      questionIndex: activeQ!,
      reactions: { "❤️": 0, "🙌": 0, "💭": 0, "✨": 0 },
    };
    setResponses((prev) => [newResponse, ...prev]);
    setText("");
    setName("");
    setSubmitted(true);
    setActiveQ(null);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const toggleResponses = (qi: number) => {
    setExpandedResponses((prev) => {
      const next = new Set(prev);
      if (next.has(qi)) next.delete(qi); else next.add(qi);
      return next;
    });
  };

  return (
    <section className="mt-16 border-t border-border pt-16">
      {/* Header */}
      <div className="mb-10">
        <p className="mb-2 font-['Montserrat'] text-xs font-bold uppercase tracking-[0.3em] text-accent">Para seguir la conversación</p>
        <h2 className="font-['Poppins'] text-3xl font-black leading-tight text-secondary md:text-4xl">
          ¿Qué te dejó esta historia?
        </h2>
        <p className="mt-3 font-['Montserrat'] text-base leading-7 text-foreground/65">
          Estas preguntas no tienen respuesta correcta. Solo queremos escucharte.
        </p>
        <div className="mt-4 h-1 w-14 bg-accent" />
      </div>

      {submitted && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3 rounded-2xl bg-primary/10 px-5 py-4">
          <Check className="size-5 shrink-0 text-primary" />
          <p className="font-['Montserrat'] text-sm font-semibold text-primary">¡Gracias! Tu respuesta es parte de la conversación ahora.</p>
        </motion.div>
      )}

      <div className="space-y-5">
        {questions.map((question, qi) => {
          const qResponses = responses.filter((r) => r.questionIndex === qi);
          const isOpen = activeQ === qi;
          const showingResponses = expandedResponses.has(qi);

          return (
            <motion.div
              key={qi}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qi * 0.1 }}
              className={`overflow-hidden rounded-2xl border transition-all duration-300 ${isOpen ? "border-accent bg-white shadow-lg" : "border-border bg-card hover:border-secondary/40 hover:shadow-sm"}`}
            >
              {/* Question header */}
              <button
                type="button"
                onClick={() => setActiveQ(isOpen ? null : qi)}
                className="flex w-full items-start gap-4 p-6 text-left"
              >
                <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full font-['Poppins'] text-sm font-black transition ${isOpen ? "bg-accent text-accent-foreground" : "bg-muted text-secondary"}`}>
                  {qi + 1}
                </div>
                <div className="flex-1">
                  <p className={`font-['Poppins'] text-base font-black leading-snug transition ${isOpen ? "text-secondary" : "text-secondary"}`}>
                    {question}
                  </p>
                  {qResponses.length > 0 && !isOpen && (
                    <p className="mt-1.5 font-['Montserrat'] text-xs text-muted-foreground">
                      {qResponses.length} respuesta{qResponses.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <span className={`shrink-0 font-['Montserrat'] text-xs font-bold transition ${isOpen ? "text-accent" : "text-muted-foreground"}`}>
                  {isOpen ? "▲ Cerrar" : "Responder ↓"}
                </span>
              </button>

              {/* Response form + existing responses */}
              {isOpen && (
                <div className="border-t border-border px-6 pb-6 pt-5">
                  <div className="space-y-3">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Escribe tu respuesta aquí... Puede ser breve o larga, personal o reflexiva."
                      rows={4}
                      autoFocus
                      className="w-full resize-none rounded-xl border border-border bg-[#F9F4EE] px-4 py-3 font-['Montserrat'] text-sm leading-7 text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                    />
                    <div className="flex items-center gap-3">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tu nombre (opcional)"
                        className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 font-['Montserrat'] text-sm outline-none focus:border-secondary"
                      />
                      <button
                        onClick={handleSubmit}
                        disabled={!text.trim()}
                        className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-['Montserrat'] text-sm font-bold text-accent-foreground transition enabled:hover:brightness-95 disabled:opacity-40"
                      >
                        <Send className="size-4" /> Enviar
                      </button>
                    </div>
                    <p className="font-['Montserrat'] text-xs text-muted-foreground">
                      Tu respuesta puede ser anónima. Al enviar aceptas que puede aparecer en este espacio.
                    </p>
                  </div>
                </div>
              )}

              {/* Existing responses */}
              {qResponses.length > 0 && (
                <div className={`border-t border-border ${isOpen ? "" : ""}`}>
                  <button
                    type="button"
                    onClick={() => toggleResponses(qi)}
                    className="flex w-full items-center gap-2 px-6 py-3 font-['Montserrat'] text-xs font-bold text-muted-foreground hover:text-secondary"
                  >
                    <span className={`transition ${showingResponses ? "rotate-90" : ""}`}>▶</span>
                    {showingResponses ? "Ocultar" : "Ver"} {qResponses.length} respuesta{qResponses.length !== 1 ? "s" : ""}
                  </button>

                  {showingResponses && (
                    <div className="divide-y divide-border border-t border-border">
                      {qResponses.map((r) => (
                        <div key={r.id} className="px-6 py-4">
                          <div className="flex gap-4">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary font-['Poppins'] text-sm font-black text-secondary-foreground">
                              {r.author.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-['Montserrat'] text-sm font-bold text-secondary">{r.author}</p>
                                <p className="font-['Montserrat'] text-xs text-muted-foreground">{r.date}</p>
                              </div>
                              <p className="font-['Montserrat'] text-sm leading-7 text-foreground/80">{r.text}</p>
                            </div>
                          </div>

                          {/* Reactions */}
                          <div className="mt-3 ml-13 flex flex-wrap gap-2 pl-[52px]">
                            {REACTIONS.map((emoji) => {
                              const voted = votedReactions[r.id]?.has(emoji);
                              const count = r.reactions[emoji];
                              return (
                                <div key={emoji} className="relative group">
                                  <button
                                    type="button"
                                    onClick={() => toggleReaction(r.id, emoji)}
                                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-['Montserrat'] text-xs font-semibold transition-all ${voted ? "border-accent bg-accent/10 text-accent" : "border-border bg-white text-muted-foreground hover:border-accent/40 hover:bg-accent/5 hover:text-secondary"}`}
                                  >
                                    <span>{emoji}</span>
                                    {count > 0 && <span className={`tabular-nums ${voted ? "text-accent font-bold" : ""}`}>{count}</span>}
                                  </button>
                                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-secondary px-2.5 py-1 font-['Montserrat'] text-xs font-semibold text-secondary-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                                    {REACTION_LABELS[emoji]}
                                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-secondary" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

    </section>
  );
}

function StoryPage({ story, onBack }: { story: Story; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-[#F9F4EE]/90 px-5 py-4 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-3xl items-center justify-between gap-6">
          <button onClick={onBack} className="flex items-center gap-2 font-['Montserrat'] text-sm font-bold text-secondary hover:text-accent">
            ← Todas las historias
          </button>
          <span className={`rounded-full px-3 py-1 font-['Montserrat'] text-xs font-bold ${tagColors[story.tag] ?? "bg-muted text-secondary"}`}>{story.tag}</span>
        </nav>
      </header>

      {story.coverImage && (
        <div className="relative h-72 w-full overflow-hidden md:h-96">
          <img src={story.coverImage} alt={story.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
      )}

      <article className="mx-auto max-w-2xl px-5 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-6 flex items-center gap-3 font-['Montserrat'] text-sm text-muted-foreground">
            <span>{story.date}</span><span>·</span><span>{story.readTime} de lectura</span>
          </div>
          <h1 className="font-['Poppins'] text-4xl font-black leading-[1.05] text-secondary md:text-5xl">{story.title}</h1>
          <div className="my-7 h-1 w-16 bg-accent" />
          <p className="font-['Lora'] text-xl italic leading-relaxed text-foreground/75 md:text-2xl">{story.excerpt}</p>

          <div className="my-10 flex items-center gap-4 rounded-2xl border border-border bg-card px-6 py-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary font-['Poppins'] text-lg font-black text-secondary-foreground">
              {story.author.charAt(0)}
            </div>
            <div>
              <p className="font-['Montserrat'] text-sm font-bold text-secondary">{story.author}</p>
              <p className="font-['Montserrat'] text-xs text-muted-foreground">Historia compartida con Contando Historias</p>
            </div>
          </div>

          <div className="space-y-7">
            {story.body.map((paragraph, i) => (
              <p key={i} className="font-['Montserrat'] text-base leading-8 text-foreground/80 md:text-lg md:leading-9">{paragraph}</p>
            ))}
          </div>

          <ConversationSection story={story} />

          <div className="mt-12 rounded-[1.5rem] bg-secondary p-8 text-secondary-foreground">
            <p className="font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-[#F2C94C]">¿Tu historia también merece ser contada?</p>
            <h3 className="mt-3 font-['Poppins'] text-3xl font-black leading-tight">Comparte la tuya.</h3>
            <p className="mt-3 font-['Montserrat'] text-sm leading-7 text-secondary-foreground/75">Graba un audio o escríbenos. Puede ser anónimo.</p>
            <button onClick={onBack} className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-['Montserrat'] text-sm font-bold text-accent-foreground transition hover:brightness-95">
              Ir al buzón <ArrowRight className="size-4" />
            </button>
          </div>
        </motion.div>
      </article>
    </div>
  );
}

// ─── ADMIN PANEL ────────────────────────────────────────────────────────────

type AdminView = "list" | "new" | "edit";
type TranscribeStep = "idle" | "uploading" | "transcribing" | "formatting" | "done" | "error";

const EMPTY_STORY: Omit<Story, "id" | "slug"> = {
  title: "", author: "", date: "", readTime: "", tag: "Resiliencia",
  featured: false, published: false, scheduledAt: "", excerpt: "", body: [""],
  seoDescription: "", seoSlug: "", coverImage: "",
  questions: [
    "¿Qué cambió en tu forma de ver este tema después de leer esta historia?",
    "¿Hay alguna experiencia propia que te hizo pensar diferente?",
    "¿Qué conversación te gustaría tener a partir de esto?",
  ],
};

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

function parseHtmlToParagraphs(html: string): string[] {
  const div = document.createElement("div");
  div.innerHTML = html;
  const result: string[] = [];
  div.querySelectorAll("p, blockquote, h2, h3, li").forEach((el) => {
    const text = el.textContent?.trim();
    if (text) result.push(text);
  });
  return result.length ? result : [div.textContent?.trim() ?? ""].filter(Boolean);
}

type MediaModal = "none" | "link" | "image" | "youtube";

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function RichEditor({ initialHtml, onChange }: { initialHtml: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileImgRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"visual" | "html">("visual");
  const [rawHtml, setRawHtml] = useState(initialHtml);
  const [modal, setModal] = useState<MediaModal>("none");

  // Link modal state
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");

  // Image modal state
  const [imgUrl, setImgUrl] = useState("");
  const [imgAlt, setImgAlt] = useState("");
  const [imgTab, setImgTab] = useState<"url" | "upload">("url");

  // YouTube modal state
  const [ytUrl, setYtUrl] = useState("");

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = initialHtml || "<p><br></p>";
  }, []);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const updateFormats = () => {
    const f = new Set<string>();
    if (document.queryCommandState("bold")) f.add("bold");
    if (document.queryCommandState("italic")) f.add("italic");
    if (document.queryCommandState("underline")) f.add("underline");
    setActiveFormats(f);
  };

  const notifyChange = () => {
    const html = editorRef.current?.innerHTML ?? "";
    setRawHtml(html);
    onChange(html);
  };

  const exec = (cmd: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    updateFormats();
    notifyChange();
  };

  const insertHtmlAtCursor = (html: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand("insertHTML", false, html);
    notifyChange();
  };

  const openModal = (m: MediaModal) => {
    saveSelection();
    // Pre-fill link text from selection
    if (m === "link") {
      const sel = window.getSelection();
      setLinkText(sel?.toString() || "");
      setLinkUrl("https://");
    }
    if (m === "image") { setImgUrl(""); setImgAlt(""); setImgTab("url"); }
    if (m === "youtube") setYtUrl("");
    setModal(m);
  };

  const insertLink = () => {
    const text = linkText || linkUrl;
    insertHtmlAtCursor(`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color:#1F4E5F;text-decoration:underline;">${text}</a>`);
    setModal("none");
  };

  const insertImage = (src: string, alt: string) => {
    insertHtmlAtCursor(`<figure style="margin:1.5rem 0;"><img src="${src}" alt="${alt}" style="max-width:100%;border-radius:12px;display:block;" />${alt ? `<figcaption style="text-align:center;font-size:0.8rem;color:#5E747C;margin-top:6px;">${alt}</figcaption>` : ""}</figure><p><br></p>`);
    setModal("none");
  };

  const insertImageFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => insertImage(e.target?.result as string, file.name.replace(/\.[^.]+$/, ""));
    reader.readAsDataURL(file);
    setModal("none");
  };

  const insertYoutube = () => {
    const id = getYouTubeId(ytUrl);
    if (!id) return;
    insertHtmlAtCursor(`<figure style="margin:1.5rem 0;position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;"><iframe src="https://www.youtube.com/embed/${id}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></figure><p><br></p>`);
    setModal("none");
  };

  const applyHtml = () => {
    if (editorRef.current) editorRef.current.innerHTML = rawHtml;
    onChange(rawHtml);
    setViewMode("visual");
  };

  const sep = <div className="mx-1 h-5 w-px bg-border" />;

  const tb = (label: React.ReactNode, title: string, onAction: () => void, isActive?: boolean) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onAction(); }}
      className={`flex h-8 min-w-[2rem] items-center justify-center rounded px-1.5 font-['Montserrat'] text-sm font-bold transition ${isActive ? "bg-secondary text-secondary-foreground" : "text-secondary/70 hover:bg-muted hover:text-secondary"}`}
    >{label}</button>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      {/* ── Toolbar row 1: media ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-[#EEE8E1] px-3 py-1.5">
        <span className="mr-1 font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-muted-foreground">Insertar</span>
        {tb(<span className="flex items-center gap-1 text-xs">🖼 Imagen</span>, "Insertar imagen", () => openModal("image"))}
        {tb(<span className="flex items-center gap-1 text-xs">▶ YouTube</span>, "Insertar video de YouTube", () => openModal("youtube"))}
        {tb(<span className="flex items-center gap-1 text-xs">🔗 Link</span>, "Insertar enlace", () => openModal("link"))}
        <input ref={fileImgRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && insertImageFromFile(e.target.files[0])} />
      </div>

      {/* ── Toolbar row 2: formatting ────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-[#F9F4EE] px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          <select
            defaultValue="p"
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => exec("formatBlock", e.target.value)}
            className="h-8 rounded border border-border bg-white px-2 font-['Montserrat'] text-xs font-semibold text-secondary outline-none"
          >
            <option value="p">Párrafo</option>
            <option value="h2">Título H2</option>
            <option value="h3">Subtítulo H3</option>
            <option value="blockquote">Cita</option>
          </select>
          {sep}
          {tb(<strong>B</strong>, "Negrita", () => exec("bold"), activeFormats.has("bold"))}
          {tb(<em>I</em>, "Cursiva", () => exec("italic"), activeFormats.has("italic"))}
          {tb(<u>U</u>, "Subrayado", () => exec("underline"), activeFormats.has("underline"))}
          {sep}
          {tb(<span className="text-base">❝</span>, "Cita", () => exec("formatBlock", "blockquote"))}
          {tb(<span>≡</span>, "Lista con viñetas", () => exec("insertUnorderedList"))}
          {tb(<span>①</span>, "Lista numerada", () => exec("insertOrderedList"))}
          {sep}
          {tb(<span>↩</span>, "Deshacer", () => exec("undo"))}
          {tb(<span>↪</span>, "Rehacer", () => exec("redo"))}
          {sep}
          {tb(<span className="text-xs">✕fmt</span>, "Quitar formato", () => exec("removeFormat"))}
        </div>
        <div className="flex rounded-lg border border-border bg-white p-0.5">
          <button type="button" onClick={() => setViewMode("visual")} className={`rounded-md px-3 py-1 font-['Montserrat'] text-xs font-bold transition ${viewMode === "visual" ? "bg-secondary text-secondary-foreground" : "text-secondary/60 hover:text-secondary"}`}>Visual</button>
          <button type="button" onClick={() => setViewMode("html")} className={`rounded-md px-3 py-1 font-['Montserrat'] text-xs font-bold transition ${viewMode === "html" ? "bg-secondary text-secondary-foreground" : "text-secondary/60 hover:text-secondary"}`}>HTML</button>
        </div>
      </div>

      {/* ── Editor area ──────────────────────────────────────── */}
      {viewMode === "visual" ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => { notifyChange(); updateFormats(); }}
          onKeyUp={updateFormats}
          onMouseUp={updateFormats}
          className="min-h-[380px] cursor-text p-5 font-['Montserrat'] text-base leading-8 text-foreground outline-none [&_a]:text-secondary [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-5 [&_blockquote]:font-[Lora,Georgia,serif] [&_blockquote]:italic [&_blockquote]:text-foreground/70 [&_figure]:my-5 [&_figcaption]:mt-1.5 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:text-muted-foreground [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:font-[Poppins,sans-serif] [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-secondary [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-[Poppins,sans-serif] [&_h3]:text-lg [&_h3]:font-black [&_h3]:text-secondary [&_img]:max-w-full [&_img]:rounded-xl [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6"
        />
      ) : (
        <div className="p-4">
          <textarea value={rawHtml} onChange={(e) => setRawHtml(e.target.value)} rows={18} className="w-full resize-y rounded-lg border border-border bg-[#F9F4EE] px-4 py-3 font-mono text-xs leading-6 text-foreground outline-none focus:border-secondary" />
          <button type="button" onClick={applyHtml} className="mt-3 rounded-full bg-secondary px-4 py-2 font-['Montserrat'] text-xs font-bold text-secondary-foreground">Aplicar HTML</button>
        </div>
      )}

      {/* ── Status bar ───────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-border bg-[#F9F4EE] px-4 py-1.5">
        <span className="font-['Montserrat'] text-xs text-muted-foreground">{parseHtmlToParagraphs(rawHtml).length} párrafos</span>
        <span className="font-['Montserrat'] text-xs text-muted-foreground">{rawHtml.replace(/<[^>]+>/g, "").length} caracteres</span>
      </div>

      {/* ── MODALS ───────────────────────────────────────────── */}
      {modal !== "none" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={() => setModal("none")}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>

            {/* Link modal */}
            {modal === "link" && (
              <>
                <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                  <p className="font-['Poppins'] text-base font-black text-secondary">Insertar enlace</p>
                  <button onClick={() => setModal("none")} className="text-muted-foreground hover:text-secondary">✕</button>
                </div>
                <div className="space-y-4 px-6 py-5">
                  <div>
                    <label className="mb-1 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">URL *</label>
                    <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-border px-3 py-2.5 font-['Montserrat'] text-sm outline-none focus:border-secondary" autoFocus />
                  </div>
                  <div>
                    <label className="mb-1 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Texto del enlace</label>
                    <input value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Texto visible (opcional)" className="w-full rounded-lg border border-border px-3 py-2.5 font-['Montserrat'] text-sm outline-none focus:border-secondary" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setModal("none")} className="flex-1 rounded-xl border border-border py-2.5 font-['Montserrat'] text-sm font-bold text-secondary hover:bg-muted">Cancelar</button>
                    <button onClick={insertLink} disabled={!linkUrl || linkUrl === "https://"} className="flex-1 rounded-xl bg-secondary py-2.5 font-['Montserrat'] text-sm font-bold text-secondary-foreground disabled:opacity-40">Insertar</button>
                  </div>
                </div>
              </>
            )}

            {/* Image modal */}
            {modal === "image" && (
              <>
                <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                  <p className="font-['Poppins'] text-base font-black text-secondary">Insertar imagen</p>
                  <button onClick={() => setModal("none")} className="text-muted-foreground hover:text-secondary">✕</button>
                </div>
                <div className="px-6 py-5">
                  <div className="mb-4 flex rounded-xl border border-border bg-muted/30 p-1">
                    <button onClick={() => setImgTab("url")} className={`flex-1 rounded-lg py-2 font-['Montserrat'] text-xs font-bold transition ${imgTab === "url" ? "bg-white text-secondary shadow-sm" : "text-muted-foreground"}`}>URL externa</button>
                    <button onClick={() => setImgTab("upload")} className={`flex-1 rounded-lg py-2 font-['Montserrat'] text-xs font-bold transition ${imgTab === "upload" ? "bg-white text-secondary shadow-sm" : "text-muted-foreground"}`}>Subir archivo</button>
                  </div>

                  {imgTab === "url" ? (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">URL de la imagen *</label>
                        <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-border px-3 py-2.5 font-['Montserrat'] text-sm outline-none focus:border-secondary" autoFocus />
                      </div>
                      <div>
                        <label className="mb-1 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Descripción (alt)</label>
                        <input value={imgAlt} onChange={(e) => setImgAlt(e.target.value)} placeholder="Descripción de la imagen" className="w-full rounded-lg border border-border px-3 py-2.5 font-['Montserrat'] text-sm outline-none focus:border-secondary" />
                      </div>
                      {imgUrl && <img src={imgUrl} alt={imgAlt} className="w-full rounded-lg object-cover" style={{ maxHeight: 140 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                    </div>
                  ) : (
                    <div
                      onClick={() => fileImgRef.current?.click()}
                      className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border transition hover:border-secondary hover:bg-muted/20"
                    >
                      <span className="text-2xl">🖼</span>
                      <p className="font-['Montserrat'] text-sm font-semibold text-secondary">Click para seleccionar</p>
                      <p className="font-['Montserrat'] text-xs text-muted-foreground">JPG, PNG, WebP, GIF</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setModal("none")} className="flex-1 rounded-xl border border-border py-2.5 font-['Montserrat'] text-sm font-bold text-secondary hover:bg-muted">Cancelar</button>
                    {imgTab === "url" && <button onClick={() => insertImage(imgUrl, imgAlt)} disabled={!imgUrl} className="flex-1 rounded-xl bg-secondary py-2.5 font-['Montserrat'] text-sm font-bold text-secondary-foreground disabled:opacity-40">Insertar</button>}
                  </div>
                </div>
              </>
            )}

            {/* YouTube modal */}
            {modal === "youtube" && (
              <>
                <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                  <p className="font-['Poppins'] text-base font-black text-secondary">Insertar video de YouTube</p>
                  <button onClick={() => setModal("none")} className="text-muted-foreground hover:text-secondary">✕</button>
                </div>
                <div className="space-y-4 px-6 py-5">
                  <div>
                    <label className="mb-1 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">URL del video *</label>
                    <input value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full rounded-lg border border-border px-3 py-2.5 font-['Montserrat'] text-sm outline-none focus:border-secondary" autoFocus />
                  </div>
                  {ytUrl && getYouTubeId(ytUrl) && (
                    <div className="overflow-hidden rounded-xl" style={{ paddingBottom: "56.25%", position: "relative", height: 0 }}>
                      <iframe src={`https://www.youtube.com/embed/${getYouTubeId(ytUrl)}`} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }} title="Preview" />
                    </div>
                  )}
                  {ytUrl && !getYouTubeId(ytUrl) && <p className="font-['Montserrat'] text-xs text-destructive">URL de YouTube no válida</p>}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setModal("none")} className="flex-1 rounded-xl border border-border py-2.5 font-['Montserrat'] text-sm font-bold text-secondary hover:bg-muted">Cancelar</button>
                    <button onClick={insertYoutube} disabled={!getYouTubeId(ytUrl)} className="flex-1 rounded-xl bg-secondary py-2.5 font-['Montserrat'] text-sm font-bold text-secondary-foreground disabled:opacity-40">Insertar</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const MOCK_TRANSCRIPTION = `Hola, me llamo Gabriela. Quería contar algo que me pasó hace tres años y que cambió completamente la forma en que veo mi vida. Yo siempre fui de esas personas que planean todo, que necesitan tener el control de cada cosa antes de dar un paso. Y un día me diagnosticaron con una enfermedad autoinmune que básicamente me dijo: ya no puedes planear nada. Tuve que aprender a vivir con incertidumbre. Al principio fue horrible. Lloraba mucho, sentía que todo lo que había construido se derrumbaba. Pero poco a poco, casi sin darme cuenta, fui aprendiendo algo que nunca nadie me había enseñado: que la incertidumbre no es el enemigo. Que puedes estar bien sin saber qué viene después. Hoy, tres años después, vivo de una manera completamente diferente. Más presente, más agradecida. Y paradójicamente, más libre que nunca.`;

const MOCK_FORMATTED = {
  title: "Aprendí a vivir sin saber qué viene después",
  excerpt: "Siempre fui de las que planean todo. Hasta que un diagnóstico me enseñó que la incertidumbre no es el enemigo.",
  tag: "Salud mental",
  readTime: "5 min",
  body: [
    "Hola, me llamo Gabriela. Siempre fui de esas personas que planean todo, que necesitan tener el control de cada cosa antes de dar un paso. Mi agenda, mi carrera, mis relaciones: todo tenía un orden, una lógica, un rumbo claro.",
    "Un día me diagnosticaron con una enfermedad autoinmune. Y con ese diagnóstico llegó algo que no esperaba: la incertidumbre total. Ya no podía planear nada con certeza. Mi cuerpo había cambiado las reglas del juego sin avisarme.",
    "Al principio fue horrible. Lloraba mucho, sentía que todo lo que había construido con tanto cuidado se derrumbaba de golpe. Me aferré a los médicos, a los pronósticos, a cualquier número que me dijera que todo iba a estar bien.",
    "Pero poco a poco, casi sin darme cuenta, fui aprendiendo algo que nunca nadie me había enseñado: que la incertidumbre no es el enemigo. Que puedes estar bien sin saber qué viene después. Que vivir en el presente no es una frase de autoayuda, es una habilidad que se aprende cuando no te queda otra.",
    "Hoy, tres años después, vivo de una manera completamente diferente. Más presente, más agradecida, más honesta conmigo misma. Y paradójicamente, más libre que nunca.",
  ],
};

function AdminPanel({ stories, onBack, onSave, onDelete, onTogglePublish, onToggleFeatured }: {
  stories: Story[];
  onBack: () => void;
  onSave: (story: Story) => void;
  onDelete: (id: number) => void;
  onTogglePublish: (id: number) => void;
  onToggleFeatured: (id: number) => void;
}) {
  const [adminView, setAdminView] = useState<AdminView>("list");
  const [editing, setEditing] = useState<Story | null>(null);
  const [form, setForm] = useState<Omit<Story, "id" | "slug">>(EMPTY_STORY);
  const [editorHtml, setEditorHtml] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [showNewTag, setShowNewTag] = useState(false);

  const allAvailableTags = [...ALL_TAGS.filter((t) => t !== "Todos"), ...customTags];

  const addCustomTag = () => {
    const tag = newTagInput.trim();
    if (!tag || allAvailableTags.includes(tag)) return;
    setCustomTags((prev) => [...prev, tag]);
    setForm((f) => ({ ...f, tag }));
    setNewTagInput("");
    setShowNewTag(false);
  };
  const [editorKey, setEditorKey] = useState(0);

  // Audio flow state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  const [transcribeStep, setTranscribeStep] = useState<TranscribeStep>("idle");
  const [audioPanelOpen, setAudioPanelOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storyToHtml = (body: string[]) =>
    body.map((p) => `<p>${p}</p>`).join("\n");

  const openNew = () => {
    setForm(EMPTY_STORY);
    setEditorHtml("");
    setEditorKey((k) => k + 1);
    setEditing(null);
    setAudioFile(null);
    setTranscription("");
    setTranscribeStep("idle");
    setAdminView("new");
  };

  const openEdit = (story: Story) => {
    setEditing(story);
    setForm({ title: story.title, author: story.author, date: story.date, readTime: story.readTime, tag: story.tag, featured: story.featured, published: story.published, scheduledAt: story.scheduledAt ?? "", excerpt: story.excerpt, body: story.body, seoDescription: story.seoDescription ?? "", seoSlug: story.seoSlug ?? "", coverImage: story.coverImage ?? "", questions: story.questions ?? [] });
    const html = storyToHtml(story.body);
    setEditorHtml(html);
    setEditorKey((k) => k + 1);
    setAudioFile(null);
    setTranscription("");
    setTranscribeStep("idle");
    setAdminView("edit");
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.author.trim()) return;
    const body = parseHtmlToParagraphs(editorHtml);
    const story: Story = {
      id: editing?.id ?? Date.now(),
      slug: editing?.slug ?? slugify(form.title),
      ...form,
      body: body.length ? body : [""],
    };
    onSave(story);
    setAdminView("list");
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("audio/")) return;
    setAudioFile(file);
    setTranscription("");
    setTranscribeStep("idle");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const runTranscription = async () => {
    setTranscribeStep("uploading");
    await new Promise((r) => setTimeout(r, 900));
    setTranscribeStep("transcribing");
    await new Promise((r) => setTimeout(r, 1800));
    setTranscription(MOCK_TRANSCRIPTION);
    setTranscribeStep("done");
  };

  const runFormatting = async () => {
    setTranscribeStep("formatting");
    await new Promise((r) => setTimeout(r, 2200));
    const result = MOCK_FORMATTED;
    setForm((f) => ({
      ...f,
      title: result.title,
      excerpt: result.excerpt,
      tag: result.tag,
      readTime: result.readTime,
    }));
    const html = storyToHtml(result.body);
    setEditorHtml(html);
    setEditorKey((k) => k + 1);
    setTranscribeStep("done");
  };

  const stepLabel: Record<TranscribeStep, string> = {
    idle: "",
    uploading: "Subiendo archivo...",
    transcribing: "Transcribiendo con Whisper...",
    formatting: "Formateando con Claude IA...",
    done: "",
    error: "Ocurrió un error. Intenta de nuevo.",
  };

  // ── list-view state ────────────────────────────────────────────────────
  const [adminSection, setAdminSection] = useState<"stories" | "buzon" | "newsletter">("stories");
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState<"todos" | "publicada" | "borrador" | "programada">("todos");
  const [previewStory, setPreviewStory] = useState<Story | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [subscribers] = useState<Subscriber[]>(MOCK_SUBSCRIBERS);
  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [newsletterBody, setNewsletterBody] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [selectedSubs, setSelectedSubs] = useState<number[]>([]);

  const publishedCount = stories.filter((s) => s.published).length;
  const draftsCount = stories.filter((s) => !s.published).length;
  const scheduledCount = stories.filter((s) => s.scheduledAt && !s.published).length;

  const filteredStories = stories.filter((s) => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.author.toLowerCase().includes(search.toLowerCase());
    const matchTag = filterTag === "Todos" || s.tag === filterTag;
    const matchStatus = filterStatus === "todos" || (filterStatus === "publicada" && s.published) || (filterStatus === "borrador" && !s.published && !s.scheduledAt) || (filterStatus === "programada" && !!s.scheduledAt && !s.published);
    return matchSearch && matchTag && matchStatus;
  });

  const statusBadge = (s: Submission) => {
    const map = { pendiente: "bg-[#F2C94C]/20 text-[#7A6020]", revisado: "bg-[#9BB4C7]/30 text-[#1F4E5F]", seleccionado: "bg-primary/10 text-primary", descartado: "bg-muted text-muted-foreground" };
    return map[s.status];
  };

  const convertToStory = (sub: Submission) => {
    openNew();
    setForm((f) => ({ ...f, author: sub.nombre, excerpt: sub.contenido.slice(0, 120) }));
  };

  if (adminView === "new" || adminView === "edit") {
    const isProcessing = ["uploading", "transcribing", "formatting"].includes(transcribeStep);

    return (
      <div className="min-h-screen bg-[#F0EAE2]">
        <header className="sticky top-0 z-40 border-b border-border bg-white/90 px-5 py-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <button onClick={() => setAdminView("list")} className="flex items-center gap-2 font-['Montserrat'] text-sm font-bold text-secondary hover:text-accent">← Cancelar</button>
            <p className="font-['Poppins'] text-base font-black text-secondary">{editing ? "Editar historia" : "Nueva historia"}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewStory({ id: editing?.id ?? 0, slug: editing?.slug ?? slugify(form.title), ...form, body: parseHtmlToParagraphs(editorHtml) })}
                disabled={!form.title.trim()}
                className="rounded-full border border-border px-4 py-2 font-['Montserrat'] text-sm font-bold text-secondary transition enabled:hover:bg-muted disabled:opacity-40"
              >
                Vista previa
              </button>
              <button
                onClick={() => { setForm((f) => ({ ...f, published: false })); setTimeout(handleSave, 0); }}
                disabled={!form.title.trim() || !form.author.trim()}
                className="rounded-full border border-border px-4 py-2 font-['Montserrat'] text-sm font-bold text-secondary transition enabled:hover:border-secondary enabled:hover:bg-secondary enabled:hover:text-secondary-foreground disabled:opacity-40"
              >
                Borrador
              </button>
              <button
                onClick={() => { setForm((f) => ({ ...f, published: true })); setTimeout(handleSave, 0); }}
                disabled={!form.title.trim() || !form.author.trim()}
                className="rounded-full bg-primary px-5 py-2 font-['Montserrat'] text-sm font-bold text-primary-foreground transition enabled:hover:brightness-95 disabled:opacity-40"
              >
                Publicar
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-5 py-8">

          {/* ── AUDIO PANEL ─────────────────────────────────────────── */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setAudioPanelOpen(!audioPanelOpen)}
              className="flex w-full items-center justify-between px-6 py-4 transition hover:bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-accent text-white">
                  <Mic className="size-4" />
                </div>
                <div className="text-left">
                  <p className="font-['Montserrat'] text-sm font-bold text-secondary">Audio → Historia con IA</p>
                  <p className="font-['Montserrat'] text-xs text-muted-foreground">Sube el audio del episodio y genera la historia automáticamente</p>
                </div>
              </div>
              <span className="font-['Montserrat'] text-xs text-muted-foreground">{audioPanelOpen ? "▲ Ocultar" : "▼ Mostrar"}</span>
            </button>

            {audioPanelOpen && (
              <div className="border-t border-border px-6 pb-6 pt-5">
                {/* Steps indicator */}
                <div className="mb-6 flex items-center gap-0">
                  {[
                    { n: "1", label: "Subir audio" },
                    { n: "2", label: "Transcribir" },
                    { n: "3", label: "Formatear con IA" },
                  ].map((step, i) => {
                    const done = (i === 0 && audioFile) || (i === 1 && transcription) || (i === 2 && transcribeStep === "done" && form.title);
                    const active = (i === 0 && !audioFile) || (i === 1 && audioFile && !transcription) || (i === 2 && transcription && transcribeStep !== "done");
                    return (
                      <div key={step.n} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`flex size-8 items-center justify-center rounded-full font-['Montserrat'] text-xs font-bold transition ${done ? "bg-primary text-primary-foreground" : active ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {done ? <Check className="size-4" /> : step.n}
                          </div>
                          <span className={`font-['Montserrat'] text-xs font-semibold ${active ? "text-secondary" : "text-muted-foreground"}`}>{step.label}</span>
                        </div>
                        {i < 2 && <div className={`mb-4 h-px flex-1 mx-2 transition ${done ? "bg-primary" : "bg-border"}`} />}
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Drop zone */}
                  <div>
                    <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition ${isDragging ? "border-accent bg-accent/5" : audioFile ? "border-primary bg-primary/5" : "border-border hover:border-secondary/40 hover:bg-muted/30"}`}
                    >
                      {audioFile ? (
                        <>
                          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><Mic className="size-5" /></div>
                          <div>
                            <p className="font-['Montserrat'] text-sm font-bold text-primary">{audioFile.name}</p>
                            <p className="font-['Montserrat'] text-xs text-muted-foreground">{(audioFile.size / 1024 / 1024).toFixed(1)} MB · Listo para transcribir</p>
                          </div>
                          <p className="font-['Montserrat'] text-xs text-muted-foreground">Click para cambiar el archivo</p>
                        </>
                      ) : (
                        <>
                          <div className="flex size-12 items-center justify-center rounded-full bg-muted"><Upload className="size-5 text-muted-foreground" /></div>
                          <div>
                            <p className="font-['Montserrat'] text-sm font-semibold text-secondary">Arrastra el audio aquí</p>
                            <p className="font-['Montserrat'] text-xs text-muted-foreground">o haz click para seleccionar</p>
                          </div>
                          <p className="font-['Montserrat'] text-xs text-muted-foreground">MP3, WAV, M4A · máx. 25 MB</p>
                        </>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={runTranscription}
                        disabled={!audioFile || isProcessing || !!transcription}
                        className="flex items-center justify-center gap-2 rounded-xl bg-secondary py-3 font-['Montserrat'] text-sm font-bold text-secondary-foreground transition enabled:hover:bg-[#173A46] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {transcribeStep === "transcribing" ? (
                          <><span className="animate-spin">⟳</span> Transcribiendo...</>
                        ) : transcription ? (
                          <><Check className="size-4" /> Transcripción lista</>
                        ) : (
                          <><Mic className="size-4" /> Transcribir con Whisper</>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={runFormatting}
                        disabled={!transcription || isProcessing || transcribeStep === "formatting"}
                        className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 font-['Montserrat'] text-sm font-bold text-accent-foreground transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {transcribeStep === "formatting" ? (
                          <><span className="animate-spin">⟳</span> Formateando...</>
                        ) : (
                          <>✦ Formatear historia con Claude</>
                        )}
                      </button>
                    </div>

                    {isProcessing && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-secondary/8 px-4 py-3">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="size-1.5 rounded-full bg-secondary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                        <p className="font-['Montserrat'] text-xs font-semibold text-secondary">{stepLabel[transcribeStep]}</p>
                      </div>
                    )}
                  </div>

                  {/* Transcription result */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Transcripción</label>
                      {transcription && (
                        <span className="font-['Montserrat'] text-xs text-muted-foreground">{transcription.split(" ").length} palabras</span>
                      )}
                    </div>
                    <textarea
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      placeholder="La transcripción del audio aparecerá aquí. Puedes editarla antes de formatear."
                      rows={8}
                      className="w-full resize-none rounded-xl border border-border bg-[#F9F4EE] px-4 py-3 font-['Montserrat'] text-sm leading-7 text-foreground/80 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10"
                    />
                    {transcription && (
                      <p className="mt-1.5 font-['Montserrat'] text-xs text-muted-foreground">
                        ✎ Puedes editar la transcripción antes de formatear con IA.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── MAIN EDITOR + SIDEBAR ───────────────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-[1fr_268px]">
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Título *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="El título de esta historia..."
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 font-['Poppins'] text-xl font-black text-secondary outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Extracto</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Una frase en primera persona que enganche al lector..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 font-['Lora'] text-base italic text-foreground/80 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/10"
                />
              </div>

              <div>
                <label className="mb-2 block font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Contenido</label>
                <RichEditor key={editorKey} initialHtml={editorHtml} onChange={setEditorHtml} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-white p-5">
                <p className="mb-4 font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Publicación</p>
                <div className="space-y-3">
                  {[
                    { label: "Publicada", key: "published" as const, color: "bg-primary" },
                    { label: "Destacada", key: "featured" as const, color: "bg-accent" },
                  ].map(({ label, key, color }) => (
                    <div key={key} className="flex cursor-pointer items-center justify-between" onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}>
                      <span className="font-['Montserrat'] text-sm font-semibold text-secondary">{label}</span>
                      <div className={`relative h-6 w-11 rounded-full transition-colors ${form[key] ? color : "bg-muted"}`}>
                        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form[key] ? "left-5" : "left-0.5"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white p-5">
                <p className="mb-4 font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Detalles</p>
                <div className="space-y-3">
                  {([
                    { label: "Autor/a *", key: "author", placeholder: "Nombre" },
                    { label: "Fecha visible", key: "date", placeholder: "27 de junio, 2026" },
                    { label: "Tiempo de lectura", key: "readTime", placeholder: "5 min" },
                  ] as const).map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="mb-1 block font-['Montserrat'] text-xs font-semibold text-muted-foreground">{label}</label>
                      <input
                        value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full rounded-lg border border-border px-3 py-2 font-['Montserrat'] text-sm outline-none focus:border-secondary"
                      />
                    </div>
                  ))}

                  {/* Categoría con opción de agregar */}
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="font-['Montserrat'] text-xs font-semibold text-muted-foreground">Categoría</label>
                      <button
                        type="button"
                        onClick={() => setShowNewTag(!showNewTag)}
                        className="font-['Montserrat'] text-xs font-bold text-accent hover:underline"
                      >
                        {showNewTag ? "Cancelar" : "+ Nueva"}
                      </button>
                    </div>
                    {showNewTag ? (
                      <div className="flex gap-1.5">
                        <input
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
                          placeholder="Nombre de categoría..."
                          autoFocus
                          className="flex-1 rounded-lg border border-accent px-3 py-2 font-['Montserrat'] text-sm outline-none focus:ring-2 focus:ring-accent/20"
                        />
                        <button
                          type="button"
                          onClick={addCustomTag}
                          disabled={!newTagInput.trim()}
                          className="rounded-lg bg-accent px-3 py-2 font-['Montserrat'] text-xs font-bold text-accent-foreground disabled:opacity-40"
                        >
                          <Check className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <select
                        value={form.tag}
                        onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 font-['Montserrat'] text-sm outline-none focus:border-secondary"
                      >
                        {allAvailableTags.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    )}
                    {customTags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {customTags.map((t) => (
                          <span key={t} className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 font-['Montserrat'] text-xs font-bold text-accent">
                            {t}
                            <button type="button" onClick={() => setCustomTags((prev) => prev.filter((c) => c !== t))} className="text-accent/60 hover:text-accent">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Programar publicación */}
                  <div className="pt-1">
                    <div className="mb-2 flex items-center gap-2">
                      <div className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${form.scheduledAt ? "bg-primary" : "bg-muted"}`}
                        onClick={() => setForm((f) => ({ ...f, scheduledAt: f.scheduledAt ? "" : new Date(Date.now() + 86400000).toISOString().slice(0, 16) }))}>
                        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${form.scheduledAt ? "left-4" : "left-0.5"}`} />
                      </div>
                      <label className="font-['Montserrat'] text-xs font-semibold text-muted-foreground">Programar publicación</label>
                    </div>
                    {form.scheduledAt && (
                      <div>
                        <input
                          type="datetime-local"
                          value={form.scheduledAt}
                          onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                          className="w-full rounded-lg border border-border px-3 py-2 font-['Montserrat'] text-sm outline-none focus:border-secondary"
                        />
                        <p className="mt-1.5 font-['Montserrat'] text-xs text-muted-foreground">
                          La historia se publicará automáticamente en esta fecha.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover image */}
              <div className="rounded-2xl border border-border bg-white p-5">
                <p className="mb-1 font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Imagen de portada</p>
                <p className="mb-4 font-['Montserrat'] text-xs text-muted-foreground">Se muestra en las cards del blog</p>

                {form.coverImage ? (
                  <div className="relative overflow-hidden rounded-xl">
                    <img src={form.coverImage} alt="Portada" className="h-36 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
                      className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 text-sm font-bold"
                    >✕</button>
                  </div>
                ) : (
                  <div
                    onClick={() => { const inp = document.getElementById("cover-file-input") as HTMLInputElement; inp?.click(); }}
                    className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border transition hover:border-accent hover:bg-accent/5"
                  >
                    <span className="text-xl">🖼</span>
                    <p className="font-['Montserrat'] text-xs font-semibold text-secondary">Click para subir imagen</p>
                    <p className="font-['Montserrat'] text-xs text-muted-foreground">JPG, PNG, WebP</p>
                  </div>
                )}

                <input
                  id="cover-file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => setForm((f) => ({ ...f, coverImage: ev.target?.result as string }));
                    reader.readAsDataURL(file);
                  }}
                />

                <div className="mt-3">
                  <label className="mb-1 block font-['Montserrat'] text-xs font-semibold text-muted-foreground">O pega una URL</label>
                  <input
                    value={form.coverImage}
                    onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-border px-3 py-2 font-['Montserrat'] text-xs outline-none focus:border-secondary"
                  />
                </div>
              </div>

              {/* Preview card */}
              {form.title && (
                <div className="overflow-hidden rounded-2xl border border-border bg-white">
                  {form.coverImage
                    ? <img src={form.coverImage} alt="Portada" className="h-28 w-full object-cover" />
                    : <div className="h-1.5 w-full bg-accent" />
                  }
                  <div className="p-4">
                    <p className="font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Vista previa</p>
                    <span className={`rounded-full px-2.5 py-1 font-['Montserrat'] text-xs font-bold ${tagColors[form.tag] ?? "bg-muted text-secondary"}`}>{form.tag}</span>
                    <p className="mt-2 font-['Poppins'] text-sm font-black leading-snug text-secondary">{form.title}</p>
                    {form.excerpt && <p className="mt-1.5 font-['Montserrat'] text-xs leading-5 text-foreground/60 line-clamp-2">{form.excerpt}</p>}
                    <p className="mt-3 font-['Montserrat'] text-xs text-muted-foreground">{form.author || "Autor"} · {form.readTime || "— min"}</p>
                  </div>
                </div>
              )}

              {/* SEO */}
              <div className="rounded-2xl border border-border bg-white p-5">
                <p className="mb-1 font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">SEO</p>
                <p className="mb-4 font-['Montserrat'] text-xs text-muted-foreground">Cómo aparecerá en buscadores</p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block font-['Montserrat'] text-xs font-semibold text-muted-foreground">URL personalizada</label>
                    <div className="flex items-center overflow-hidden rounded-lg border border-border">
                      <span className="shrink-0 bg-muted px-2 py-2 font-['Montserrat'] text-xs text-muted-foreground">/historias/</span>
                      <input
                        value={form.seoSlug || slugify(form.title)}
                        onChange={(e) => setForm((f) => ({ ...f, seoSlug: e.target.value }))}
                        placeholder={slugify(form.title) || "url-de-la-historia"}
                        className="flex-1 min-w-0 px-2 py-2 font-['Montserrat'] text-xs outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block font-['Montserrat'] text-xs font-semibold text-muted-foreground">Meta descripción</label>
                    <textarea
                      value={form.seoDescription}
                      onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                      placeholder="Descripción para Google (máx. 160 caracteres)..."
                      maxLength={160}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-border px-3 py-2 font-['Montserrat'] text-xs leading-5 outline-none focus:border-secondary"
                    />
                    <p className={`mt-1 text-right font-['Montserrat'] text-xs ${form.seoDescription.length > 140 ? "text-accent" : "text-muted-foreground"}`}>
                      {form.seoDescription.length}/160
                    </p>
                  </div>
                  {form.title && (
                    <div className="rounded-lg border border-border bg-[#F9F4EE] p-3">
                      <p className="font-['Montserrat'] text-xs font-bold text-muted-foreground mb-1">Vista previa Google</p>
                      <p className="font-['Montserrat'] text-xs text-[#1a0dab] font-semibold truncate">contandohistorias.com/historias/{form.seoSlug || slugify(form.title)}</p>
                      <p className="font-['Montserrat'] text-sm font-bold text-[#202124] leading-snug mt-0.5 line-clamp-1">{form.title}</p>
                      <p className="font-['Montserrat'] text-xs text-[#4d5156] leading-5 mt-0.5 line-clamp-2">{form.seoDescription || form.excerpt}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Questions editor */}
              <div className="rounded-2xl border border-border bg-white p-5">
                <p className="mb-1 font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Preguntas de conversación</p>
                <p className="mb-4 font-['Montserrat'] text-xs text-muted-foreground">Aparecen al final del artículo e impulsan el SEO</p>
                <div className="space-y-2">
                  {(form.questions ?? []).map((q, qi) => (
                    <div key={qi} className="flex items-start gap-2">
                      <span className="mt-2.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/20 font-['Montserrat'] text-xs font-bold text-accent">{qi + 1}</span>
                      <input
                        value={q}
                        onChange={(e) => setForm((f) => ({ ...f, questions: f.questions.map((old, i) => i === qi ? e.target.value : old) }))}
                        className="flex-1 rounded-lg border border-border px-3 py-2 font-['Montserrat'] text-xs leading-5 outline-none focus:border-secondary"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }))}
                        className="mt-2 text-muted-foreground hover:text-destructive text-sm"
                      >✕</button>
                    </div>
                  ))}
                </div>
                {(form.questions ?? []).length < 4 && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, questions: [...(f.questions ?? []), ""] }))}
                    className="mt-3 w-full rounded-xl border border-dashed border-border py-2 font-['Montserrat'] text-xs font-bold text-muted-foreground transition hover:border-accent hover:text-accent"
                  >
                    + Agregar pregunta
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {previewStory && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-8 backdrop-blur-sm" onClick={() => setPreviewStory(null)}>
            <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-accent px-3 py-1 font-['Montserrat'] text-xs font-bold text-accent-foreground">Vista previa</span>
                <button onClick={() => setPreviewStory(null)} className="flex size-8 items-center justify-center rounded-full bg-white font-bold text-secondary hover:bg-muted">✕</button>
              </div>
              <div className="overflow-hidden rounded-[2rem] bg-background shadow-2xl">
                <div className="px-8 py-12 md:px-12">
                  <div className="mb-5 flex items-center gap-3 font-['Montserrat'] text-sm text-muted-foreground">
                    <span className={`rounded-full px-3 py-1 font-bold text-xs ${tagColors[previewStory.tag] ?? "bg-muted text-secondary"}`}>{previewStory.tag}</span>
                    <span>{previewStory.date || "—"}</span><span>·</span><span>{previewStory.readTime || "— min"}</span>
                  </div>
                  <h1 className="font-['Poppins'] text-3xl font-black leading-tight text-secondary md:text-4xl">{previewStory.title}</h1>
                  <div className="my-6 h-1 w-14 bg-accent" />
                  <p className="font-['Lora'] text-lg italic leading-relaxed text-foreground/75">{previewStory.excerpt}</p>
                  <div className="my-8 flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-['Poppins'] text-base font-black text-secondary-foreground">{(previewStory.author || "A").charAt(0)}</div>
                    <div>
                      <p className="font-['Montserrat'] text-sm font-bold text-secondary">{previewStory.author || "Autor"}</p>
                      <p className="font-['Montserrat'] text-xs text-muted-foreground">Historia compartida con Contando Historias</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {previewStory.body.filter(Boolean).map((p, i) => (
                      <p key={i} className="font-['Montserrat'] text-base leading-8 text-foreground/80">{p}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EAE2]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/90 px-5 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 font-['Montserrat'] text-sm font-bold text-secondary hover:text-accent">← Volver</button>
            <div className="hidden sm:block">
              <p className="font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-accent">Contando Historias</p>
              <p className="font-['Poppins'] text-base font-black text-secondary leading-tight">Panel de administración</p>
            </div>
          </div>
          {/* Nav tabs */}
          <div className="flex rounded-xl border border-border bg-muted p-1">
            {(["stories", "buzon", "newsletter"] as const).map((sec) => {
              const labels = { stories: "Historias", buzon: "Buzón", newsletter: "Newsletter" };
              const badges = { stories: stories.length, buzon: submissions.filter(s => s.status === "pendiente").length, newsletter: subscribers.length };
              return (
                <button key={sec} onClick={() => setAdminSection(sec)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-['Montserrat'] text-xs font-bold transition ${adminSection === sec ? "bg-white text-secondary shadow-sm" : "text-muted-foreground hover:text-secondary"}`}>
                  {labels[sec]}
                  <span className={`rounded-full px-1.5 py-0.5 text-xs ${adminSection === sec ? "bg-secondary text-secondary-foreground" : "bg-border text-muted-foreground"}`}>{badges[sec]}</span>
                </button>
              );
            })}
          </div>
          {adminSection === "stories" && (
            <button onClick={openNew} className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 font-['Montserrat'] text-sm font-bold text-secondary-foreground transition hover:bg-[#173A46]">
              + Nueva
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">

        {/* ══ HISTORIAS ══════════════════════════════════════════════════ */}
        {adminSection === "stories" && (
          <>
            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Total", value: stories.length, color: "text-secondary" },
                { label: "Publicadas", value: publishedCount, color: "text-primary" },
                { label: "Borradores", value: draftsCount, color: "text-accent" },
                { label: "Programadas", value: scheduledCount, color: "text-[#F2C94C]" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border bg-white p-4 text-center">
                  <p className={`font-['Poppins'] text-3xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="mt-0.5 font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Search + filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex flex-1 min-w-48 items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5">
                <span className="text-muted-foreground text-sm">🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por título o autor..."
                  className="flex-1 font-['Montserrat'] text-sm outline-none bg-transparent"
                />
                {search && <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-secondary text-xs">✕</button>}
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)} className="rounded-xl border border-border bg-white px-3 py-2.5 font-['Montserrat'] text-sm outline-none">
                <option value="todos">Todos los estados</option>
                <option value="publicada">Publicadas</option>
                <option value="borrador">Borradores</option>
                <option value="programada">Programadas</option>
              </select>
              <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="rounded-xl border border-border bg-white px-3 py-2.5 font-['Montserrat'] text-sm outline-none">
                {ALL_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              <div className="border-b border-border px-6 py-3 flex items-center justify-between">
                <p className="font-['Montserrat'] text-sm font-bold text-secondary">{filteredStories.length} historia{filteredStories.length !== 1 ? "s" : ""}</p>
                {(search || filterTag !== "Todos" || filterStatus !== "todos") && (
                  <button onClick={() => { setSearch(""); setFilterTag("Todos"); setFilterStatus("todos"); }} className="font-['Montserrat'] text-xs text-accent hover:underline">Limpiar filtros</button>
                )}
              </div>
              {filteredStories.length === 0 ? (
                <div className="px-6 py-12 text-center font-['Montserrat'] text-sm text-muted-foreground">No se encontraron historias con esos filtros.</div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredStories.map((story) => (
                    <div key={story.id} className="flex items-center gap-4 px-6 py-4 transition hover:bg-muted/30">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 font-['Montserrat'] text-xs font-bold ${tagColors[story.tag] ?? "bg-muted text-secondary"}`}>{story.tag}</span>
                          {story.featured && <span className="rounded-full bg-[#F2C94C]/25 px-2.5 py-0.5 font-['Montserrat'] text-xs font-bold text-[#7A6020]">Destacada</span>}
                          {story.scheduledAt && !story.published && <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 font-['Montserrat'] text-xs font-bold text-secondary">Programada</span>}
                        </div>
                        <p className="font-['Poppins'] text-sm font-black text-secondary truncate">{story.title}</p>
                        <p className="font-['Montserrat'] text-xs text-muted-foreground">{story.author} · {story.date} · {story.readTime}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button onClick={() => setPreviewStory(story)} className="hidden rounded-full border border-border px-3 py-1.5 font-['Montserrat'] text-xs font-bold text-secondary transition hover:bg-muted sm:block">
                          Preview
                        </button>
                        <button onClick={() => onTogglePublish(story.id)} className={`rounded-full px-3 py-1.5 font-['Montserrat'] text-xs font-bold transition ${story.published ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-muted text-muted-foreground hover:bg-secondary/10 hover:text-secondary"}`}>
                          {story.published ? "Publicada" : "Borrador"}
                        </button>
                        <button onClick={() => openEdit(story)} className="rounded-full border border-border px-3 py-1.5 font-['Montserrat'] text-xs font-bold text-secondary transition hover:border-secondary hover:bg-secondary hover:text-secondary-foreground">Editar</button>
                        {confirmDelete === story.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => { onDelete(story.id); setConfirmDelete(null); }} className="rounded-full bg-destructive px-3 py-1.5 font-['Montserrat'] text-xs font-bold text-white">Confirmar</button>
                            <button onClick={() => setConfirmDelete(null)} className="rounded-full border border-border px-2 py-1.5 font-['Montserrat'] text-xs text-muted-foreground">✕</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(story.id)} className="rounded-full border border-border px-3 py-1.5 font-['Montserrat'] text-xs font-bold text-muted-foreground transition hover:border-destructive hover:text-destructive">Eliminar</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ BUZÓN ══════════════════════════════════════════════════════ */}
        {adminSection === "buzon" && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(["pendiente", "revisado", "seleccionado", "descartado"] as const).map((s) => (
                <div key={s} className="rounded-2xl border border-border bg-white p-4 text-center">
                  <p className="font-['Poppins'] text-3xl font-black text-secondary">{submissions.filter(sub => sub.status === s).length}</p>
                  <p className="mt-0.5 font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-muted-foreground capitalize">{s}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              <div className="border-b border-border px-6 py-3">
                <p className="font-['Montserrat'] text-sm font-bold text-secondary">{submissions.length} mensajes recibidos</p>
              </div>
              <div className="divide-y divide-border">
                {submissions.map((sub) => (
                  <div key={sub.id} className="px-6 py-4 transition hover:bg-muted/20">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`rounded-full px-2.5 py-0.5 font-['Montserrat'] text-xs font-bold ${statusBadge(sub)}`}>{sub.status}</span>
                          <span className={`rounded-full px-2.5 py-0.5 font-['Montserrat'] text-xs font-bold ${sub.tipo === "audio" ? "bg-accent/15 text-accent" : "bg-secondary/10 text-secondary"}`}>{sub.tipo}</span>
                          <span className="font-['Montserrat'] text-xs text-muted-foreground">{sub.fecha}</span>
                        </div>
                        <p className="font-['Montserrat'] text-sm font-bold text-secondary">{sub.nombre}</p>
                        <p className="font-['Montserrat'] text-xs text-muted-foreground">{sub.correo}{sub.telefono ? ` · ${sub.telefono}` : ""}</p>
                        <p className="mt-2 font-['Montserrat'] text-sm leading-6 text-foreground/70 line-clamp-2">{sub.contenido}</p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <select
                          value={sub.status}
                          onChange={(e) => setSubmissions((prev) => prev.map((s) => s.id === sub.id ? { ...s, status: e.target.value as Submission["status"] } : s))}
                          className="rounded-lg border border-border bg-white px-2 py-1.5 font-['Montserrat'] text-xs outline-none"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="revisado">Revisado</option>
                          <option value="seleccionado">Seleccionado</option>
                          <option value="descartado">Descartado</option>
                        </select>
                        {sub.status === "seleccionado" && (
                          <button onClick={() => { convertToStory(sub); setAdminSection("stories"); }} className="rounded-lg bg-accent px-3 py-1.5 font-['Montserrat'] text-xs font-bold text-accent-foreground transition hover:brightness-95">
                            → Crear historia
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ NEWSLETTER ═════════════════════════════════════════════════ */}
        {adminSection === "newsletter" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Subscribers */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="font-['Poppins'] text-xl font-black text-secondary">{subscribers.length} suscriptores</p>
                <button className="rounded-full border border-border px-4 py-2 font-['Montserrat'] text-xs font-bold text-secondary hover:bg-muted">Exportar CSV</button>
              </div>
              <div className="overflow-hidden rounded-2xl border border-border bg-white">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <input type="checkbox" checked={selectedSubs.length === subscribers.length} onChange={(e) => setSelectedSubs(e.target.checked ? subscribers.map(s => s.id) : [])} className="accent-secondary" />
                  <span className="font-['Montserrat'] text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {selectedSubs.length > 0 ? `${selectedSubs.length} seleccionados` : "Seleccionar todos"}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {subscribers.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-3 px-4 py-3 transition hover:bg-muted/20">
                      <input type="checkbox" checked={selectedSubs.includes(sub.id)} onChange={(e) => setSelectedSubs((prev) => e.target.checked ? [...prev, sub.id] : prev.filter((id) => id !== sub.id))} className="accent-secondary" />
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary font-['Poppins'] text-sm font-black text-secondary-foreground">{sub.nombre.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-['Montserrat'] text-sm font-bold text-secondary truncate">{sub.nombre} {sub.apellido}</p>
                        <p className="font-['Montserrat'] text-xs text-muted-foreground truncate">{sub.email}</p>
                      </div>
                      <p className="shrink-0 font-['Montserrat'] text-xs text-muted-foreground">{sub.fecha}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compose email */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-white p-5">
                <p className="mb-4 font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Enviar newsletter</p>
                {newsletterSent ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-5" /></div>
                    <p className="font-['Poppins'] text-lg font-black text-secondary">¡Enviado!</p>
                    <p className="mt-1 font-['Montserrat'] text-sm text-muted-foreground">Tu newsletter llegó a {selectedSubs.length || subscribers.length} suscriptores.</p>
                    <button onClick={() => { setNewsletterSent(false); setNewsletterSubject(""); setNewsletterBody(""); }} className="mt-4 rounded-full border border-border px-4 py-2 font-['Montserrat'] text-sm font-bold text-secondary hover:bg-muted">Nuevo envío</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block font-['Montserrat'] text-xs font-semibold text-muted-foreground">Destinatarios</label>
                      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 font-['Montserrat'] text-sm text-secondary">
                        {selectedSubs.length > 0 ? `${selectedSubs.length} seleccionados` : `Todos los suscriptores (${subscribers.length})`}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block font-['Montserrat'] text-xs font-semibold text-muted-foreground">Asunto *</label>
                      <input value={newsletterSubject} onChange={(e) => setNewsletterSubject(e.target.value)} placeholder="Nueva historia en el podcast..." className="w-full rounded-lg border border-border px-3 py-2 font-['Montserrat'] text-sm outline-none focus:border-secondary" />
                    </div>
                    <div>
                      <label className="mb-1 block font-['Montserrat'] text-xs font-semibold text-muted-foreground">Mensaje *</label>
                      <textarea value={newsletterBody} onChange={(e) => setNewsletterBody(e.target.value)} placeholder="Escribe el contenido del newsletter..." rows={6} className="w-full resize-none rounded-lg border border-border px-3 py-2 font-['Montserrat'] text-sm leading-6 outline-none focus:border-secondary" />
                    </div>
                    <button
                      onClick={() => { if (newsletterSubject && newsletterBody) setNewsletterSent(true); }}
                      disabled={!newsletterSubject.trim() || !newsletterBody.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 font-['Montserrat'] text-sm font-bold text-secondary-foreground transition enabled:hover:bg-[#173A46] disabled:opacity-40"
                    >
                      <Send className="size-4" /> Enviar newsletter
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-white p-5">
                <p className="mb-3 font-['Montserrat'] text-xs font-bold uppercase tracking-wider text-secondary">Historias recientes</p>
                <p className="font-['Montserrat'] text-xs text-muted-foreground mb-3">Agrega un link rápido al mensaje:</p>
                <div className="space-y-2">
                  {stories.filter(s => s.published).slice(0, 3).map((s) => (
                    <button key={s.id} onClick={() => setNewsletterBody((b) => b + `\n\n📖 ${s.title}\ncontandohistorias.com/historias/${s.seoSlug || s.slug}`)} className="w-full rounded-lg border border-border px-3 py-2.5 text-left font-['Montserrat'] text-xs font-semibold text-secondary transition hover:border-secondary hover:bg-muted/30">
                      + {s.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Preview modal desde la lista */}
      {previewStory && !["new", "edit"].includes(adminView) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-8 backdrop-blur-sm" onClick={() => setPreviewStory(null)}>
          <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-accent px-3 py-1 font-['Montserrat'] text-xs font-bold text-accent-foreground">Vista previa</span>
              <button onClick={() => setPreviewStory(null)} className="flex size-8 items-center justify-center rounded-full bg-white font-bold text-secondary hover:bg-muted">✕</button>
            </div>
            <div className="overflow-hidden rounded-[2rem] bg-background shadow-2xl">
              <div className="px-8 py-12 md:px-12">
                <div className="mb-5 flex items-center gap-3 font-['Montserrat'] text-sm text-muted-foreground">
                  <span className={`rounded-full px-3 py-1 font-bold text-xs ${tagColors[previewStory.tag] ?? "bg-muted text-secondary"}`}>{previewStory.tag}</span>
                  <span>{previewStory.date || "—"}</span><span>·</span><span>{previewStory.readTime || "—"}</span>
                </div>
                <h1 className="font-['Poppins'] text-3xl font-black leading-tight text-secondary md:text-4xl">{previewStory.title}</h1>
                <div className="my-6 h-1 w-14 bg-accent" />
                <p className="font-['Lora'] text-lg italic leading-relaxed text-foreground/75">{previewStory.excerpt}</p>
                <div className="my-8 flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-['Poppins'] text-base font-black text-secondary-foreground">{(previewStory.author || "A").charAt(0)}</div>
                  <div>
                    <p className="font-['Montserrat'] text-sm font-bold text-secondary">{previewStory.author || "Autor"}</p>
                    <p className="font-['Montserrat'] text-xs text-muted-foreground">Historia compartida con Contando Historias</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {previewStory.body.filter(Boolean).map((p, i) => (
                    <p key={i} className="font-['Montserrat'] text-base leading-8 text-foreground/80">{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<"home" | "email" | "blog" | "story" | "admin">("home");
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [activePlatform, setActivePlatform] = useState<string | null>("Spotify");

  const saveStory = (story: Story) => setStories((prev) => prev.some((s) => s.id === story.id) ? prev.map((s) => s.id === story.id ? story : s) : [...prev, story]);
  const deleteStory = (id: number) => setStories((prev) => prev.filter((s) => s.id !== id));
  const togglePublish = (id: number) => setStories((prev) => prev.map((s) => s.id === id ? { ...s, published: !s.published } : s));
  const toggleFeatured = (id: number) => setStories((prev) => prev.map((s) => s.id === id ? { ...s, featured: !s.featured } : s));

  if (view === "email") return <EmailPreviewPage onBack={() => setView("home")} />;
  if (view === "blog") return <BlogPage stories={stories} onBack={() => setView("home")} onRead={(s) => { setActiveStory(s); setView("story"); }} />;
  if (view === "story" && activeStory) return <StoryPage story={activeStory} onBack={() => setView("blog")} />;
  if (view === "admin") return <AdminPanel stories={stories} onBack={() => setView("home")} onSave={saveStory} onDelete={deleteStory} onTogglePublish={togglePublish} onToggleFeatured={toggleFeatured} />;

  const showSpotifyEmbed = activePlatform === "Spotify";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-[#F9F4EE]/90 px-5 py-4 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <a href="#inicio" className="flex items-center">
            <ImageWithFallback src={logoImg} alt="Contando Historias Logo" className="h-[7rem] w-auto md:h-[11.25rem]" />
          </a>
          <div className="hidden items-center gap-7 font-['Montserrat'] text-sm font-semibold md:flex">
            <a href="#podcast" className="hover:text-accent">Podcast</a>
            <a href="#episodios" className="hover:text-accent">Episodios</a>
            <button onClick={() => setView("blog")} className="hover:text-accent">Historias</button>
            <a href="#buzon" className="hover:text-accent">Buzón</a>
            <a href="#contacto" className="hover:text-accent">Contacto</a>
            <button onClick={() => setView("email")} className="flex items-center gap-1.5 rounded-full bg-accent/10 px-4 py-2 text-accent hover:bg-accent/20">
              <Mail className="size-3.5" /> Email
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView("admin")} className="hidden rounded-full border border-border px-4 py-2.5 font-['Montserrat'] text-sm font-bold text-muted-foreground transition hover:border-secondary hover:text-secondary md:block">Panel</button>
            <a href="#buzon" className="rounded-full border-2 border-secondary px-5 py-3 font-['Montserrat'] text-sm font-bold text-secondary transition hover:bg-secondary hover:text-secondary-foreground">Cuenta tu historia</a>
          </div>
        </nav>
      </header>

      <section id="inicio" className="relative overflow-hidden px-5 py-20 md:py-28">
        <div className="absolute right-[-8rem] top-10 size-80 rounded-full bg-[#9BB4C7]/35 blur-3xl" />
        <div className="absolute bottom-10 left-[-7rem] size-72 rounded-full bg-[#F08329]/20 blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="mb-5 font-['Montserrat'] text-xs font-bold uppercase tracking-[0.32em] text-primary">Podcast de historias reales</p>
            <h1 className="max-w-4xl font-['Poppins'] text-5xl font-black leading-[0.93] text-secondary md:text-7xl lg:text-8xl">
              Personas comunes con decisiones valientes.
            </h1>
            <p className="mt-7 max-w-2xl font-['Montserrat'] text-lg leading-8 text-foreground/75 md:text-xl">
              Un espacio para escuchar relatos que atraviesan miedo, cambio, aprendizaje y esperanza. Porque contar historias es un acto de generosidad, y escucharlas, un acto de amor.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#buzon" className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-7 py-4 font-['Montserrat'] font-bold text-primary-foreground transition hover:brightness-95">Graba tu audio <ArrowRight className="size-5" /></a>
              <a href="#episodios" className="inline-flex items-center justify-center gap-3 rounded-full border border-border bg-card px-7 py-4 font-['Montserrat'] font-bold text-secondary transition hover:border-accent">Escuchar episodios</a>
            </div>
          </motion.div>

          <div className="relative min-h-[420px] rounded-[2.25rem] bg-secondary p-6 text-secondary-foreground shadow-2xl">
            <div className="absolute -right-5 -top-5 rounded-3xl bg-accent px-6 py-5 font-['Poppins'] text-4xl font-black text-accent-foreground">ON<br />AIR</div>
            <div className="flex h-full flex-col justify-between rounded-[1.75rem] border border-white/20 p-6">
              <Radio className="size-12 text-[#F2C94C]" />
              <blockquote className="font-['Lora'] text-3xl italic leading-tight md:text-4xl">“Cada historia importa, incluso y sobre todo, las que parecen pequeñas.”</blockquote>
              <div className="flex items-center gap-3 font-['Montserrat'] text-sm text-secondary-foreground/75"><Volume2 className="size-5" /> Manifiesto de marca · 2025</div>
            </div>
          </div>
        </div>
      </section>

      <section id="podcast" className="bg-secondary px-5 py-20 text-secondary-foreground md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          <div className="md:col-span-1"><p className="font-['Montserrat'] text-xs font-bold uppercase tracking-[0.28em] text-[#F2C94C]">Mi por qué</p></div>
          <div className="md:col-span-2">
            <h2 className="font-['Poppins'] text-4xl font-black leading-tight md:text-6xl">Historias reales que pasan de un punto A a un punto B.</h2>
            <p className="mt-8 font-['Montserrat'] text-lg leading-8 text-secondary-foreground/80">Este podcast existe para iluminar lo que suele quedarse en la sombra, rescatar la belleza de lo cotidiano y abrir caminos desde experiencias vividas por personas comunes.</p>
          </div>
        </div>
      </section>

      <section id="episodios" className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 font-['Montserrat'] text-xs font-bold uppercase tracking-[0.28em] text-accent">Episodios</p>
              <h2 className="font-['Poppins'] text-4xl font-black text-secondary md:text-6xl">Escucha una historia</h2>
            </div>
            <div className="flex flex-wrap gap-2">{platforms.map((item) => {
              const Icon = item.icon;
              const isActive = activePlatform === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActivePlatform(isActive ? null : item.name)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 font-['Montserrat'] text-sm font-bold transition ${isActive ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card text-secondary hover:border-secondary/40 hover:bg-secondary/5"}`}
                  aria-pressed={isActive}
                >
                  <Icon className="size-4" />
                  {item.name}
                </button>
              );
            })}</div>
          </div>
          {showSpotifyEmbed && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-8 overflow-hidden rounded-[1.75rem] border border-border bg-card p-3 shadow-[0_18px_60px_rgba(31,78,95,0.12)]"
            >
              <div className="mb-3 flex flex-col justify-between gap-3 px-3 pt-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-['Montserrat'] text-xs font-bold uppercase tracking-[0.22em] text-primary">Últimos episodios en Spotify</p>
                  <p className="mt-1 font-['Montserrat'] text-sm text-muted-foreground">Reproductor oficial embebido del podcast.</p>
                </div>
                <a href={spotifyShowUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-['Montserrat'] text-sm font-bold text-primary-foreground transition hover:brightness-95">
                  Abrir Spotify <ArrowRight className="size-4" />
                </a>
              </div>
              <iframe
                title="Contando Historias Podcast en Spotify"
                src={spotifyEmbedUrl}
                width="100%"
                height="352"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-[1.25rem]"
              />
            </motion.div>
          )}

          {activePlatform && activePlatform !== "Spotify" && (
            <div className="mb-8 rounded-[1.5rem] border border-border bg-card p-6 font-['Montserrat'] text-foreground/75">
              <p>Por ahora el embed disponible dentro del sitio es Spotify. Puedes abrir {activePlatform} directamente en su plataforma oficial.</p>
              <a
                href={platforms.find((platform) => platform.name === activePlatform)?.url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-3 font-bold text-secondary-foreground transition hover:bg-[#173A46]"
              >
                Abrir {activePlatform} <ArrowRight className="size-4" />
              </a>
            </div>
          )}

          
        </div>
      </section>

      <AudioMailbox />

      <footer id="contacto" className="bg-black px-5 py-16 text-white md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.85fr_1.15fr]">
          <div>
            <ImageWithFallback src={logoImg} alt="Contando Historias Logo" className="h-14 w-auto md:h-16" />
            <p className="mt-8 max-w-sm font-['Montserrat'] leading-7 text-white/65">Síguenos y entérate de nuevos episodios, convocatorias e historias de la comunidad.</p>
            <div className="mt-6 flex gap-4">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <a key={platform.name} href={platform.url} target="_blank" rel="noreferrer" aria-label={platform.name} className="flex size-10 items-center justify-center rounded-full bg-white text-secondary transition hover:bg-secondary hover:text-white">
                    <Icon className="size-5" />
                  </a>
                );
              })}
            </div>
            <a href="mailto:contacto.contandohistorias@gmail.com" className="mt-8 inline-flex items-center gap-2 font-['Montserrat'] font-bold text-[#F5B6CF]"><Mail className="size-5" /> contacto.contandohistorias@gmail.com</a>
          </div>
          <div>
            <h3 className="font-['Poppins'] text-4xl font-black text-[#F5B6CF]">Newsletter</h3>
            <p className="mt-3 font-['Montserrat'] text-white/65">Recibe recomendaciones, episodios y llamados para compartir tu historia.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <input className="rounded-none border-0 bg-white px-5 py-4 font-['Montserrat'] text-black outline-none ring-2 ring-transparent focus:ring-accent" placeholder="Nombre" />
              <input className="rounded-none border-0 bg-white px-5 py-4 font-['Montserrat'] text-black outline-none ring-2 ring-transparent focus:ring-accent" placeholder="Apellido" />
              <input className="rounded-none border-0 bg-white px-5 py-4 font-['Montserrat'] text-black outline-none ring-2 ring-transparent focus:ring-accent sm:col-span-2" placeholder="Email" />
            </div>
            <button className="mt-6 inline-flex items-center gap-3 rounded-full border-2 border-[#F5B6CF] px-7 py-4 font-['Montserrat'] font-bold text-[#F5B6CF] transition hover:bg-[#F5B6CF] hover:text-black">Suscribirme <Upload className="size-5" /></button>
          </div>
        </div>
      </footer>
    </main>
  );
}

