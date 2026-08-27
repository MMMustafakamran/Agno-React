/**
 * Voiceover muxing — the only implementation.
 *
 * Muxing happens once, in the process that produced the video. It used to be
 * possible for a shard and the workflow's consolidate job to both mux, which
 * layers a second audio track onto an already-muxed file; keeping it here makes
 * that unrepresentable. The workflow just installs ffmpeg and lets this run.
 *
 * WebM cannot carry AAC — the audio is re-encoded to libopus. Missing ffmpeg
 * is a skip, not a failure: a silent demo still beats no demo.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { AUDIO_DIR, ROOT_DIR, VIDEOS_DIR } from './config.mjs';

/**
 * Which audio track belongs to which video, matched on the video filename —
 * which carries the demo name (e.g. `AGNO-react-13-Frontend-Tools.webm`).
 *
 * This repo records silent demos today, so the table is empty. To add a
 * voiceover: drop the file in `autorecorder/audio/` and add one row here. The
 * mapping is explicit rather than inferred from filenames so a renamed demo
 * fails visibly instead of quietly muxing audio onto the wrong clip.
 */
const AUDIO_TRACKS = [
  {
    audioFile: 'agno-displayonly.m4a',
    videoMatch: 'DisplayOnly',
  },
  {
    audioFile: 'agno-frontendtools.m4a',
    videoMatch: 'FrontendTools',
  },
];

function getFfmpegCmd() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return `"${process.env.FFMPEG_PATH}"`;
  }
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return 'ffmpeg';
  } catch {
    // Check python imageio_ffmpeg binary in backend/.venv if installed
    const venvBinDir = path.join(
      ROOT_DIR,
      'backend',
      '.venv',
      'Lib',
      'site-packages',
      'imageio_ffmpeg',
      'binaries',
    );
    if (fs.existsSync(venvBinDir)) {
      const binaries = fs
        .readdirSync(venvBinDir)
        .filter((f) => f.startsWith('ffmpeg') && f.endsWith('.exe'));
      if (binaries.length > 0) {
        return `"${path.join(venvBinDir, binaries[0])}"`;
      }
    }
    return null;
  }
}

export function muxAudioFiles() {
  if (AUDIO_TRACKS.length === 0) return;

  const audioLookupDirs = [AUDIO_DIR, VIDEOS_DIR].filter((d) => d && fs.existsSync(d));
  if (audioLookupDirs.length === 0) return;

  const tracks = AUDIO_TRACKS.map((t) => {
    for (const dir of audioLookupDirs) {
      const candidate = path.join(dir, t.audioFile);
      if (fs.existsSync(candidate)) {
        return { ...t, resolvedAudioPath: candidate };
      }
    }
    return null;
  }).filter(Boolean);

  if (tracks.length === 0) return;
  if (!fs.existsSync(VIDEOS_DIR)) return;

  const ffmpegCmd = getFfmpegCmd();
  if (!ffmpegCmd) {
    console.log('ℹ️ [Audio Mux] ffmpeg not found in PATH; skipping (videos stay silent).');
    return;
  }

  const files = fs.readdirSync(VIDEOS_DIR);

  for (const track of tracks) {
    const audioPath = track.resolvedAudioPath;
    const video = files.find(
      (f) => f.includes(track.videoMatch) && f.endsWith('.webm') && !f.startsWith('temp_'),
    );

    if (!video) {
      console.log(
        `ℹ️ [Audio Mux] No ${track.videoMatch} video in this run; skipping ${track.audioFile}.`,
      );
      continue;
    }

    const inputPath = path.join(VIDEOS_DIR, video);
    const tempPath = path.join(VIDEOS_DIR, `temp_${video}`);
    console.log(`\n🎵 [Audio Mux] Adding ${track.audioFile} to ${video}...`);

    try {
      execSync(
        `${ffmpegCmd} -y -i "${inputPath}" -i "${audioPath}" -c:v copy -c:a libopus -map 0:v:0 -map 1:a:0 "${tempPath}"`,
        { stdio: 'ignore' },
      );
      fs.copyFileSync(tempPath, inputPath);
      fs.unlinkSync(tempPath);
      console.log(`✅ [Audio Mux] Added audio to ${video}`);
    } catch (err) {
      console.warn(`⚠️ [Audio Mux] Could not mux ${track.audioFile}:`, err.message || err);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }
}
