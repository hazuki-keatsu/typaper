import type { APIRoute } from "astro";
import Meting from "@meting/core";
import { SITE } from "src/config";

export const prerender = false;

interface APlayerAudio {
  name: string;
  artist: string;
  url: string;
  cover: string;
  lrc: string;
}

const AUDIO_QUALITIES = [320, 192, 128] as const;

function getNeteaseOuterUrl(songId: string | number) {
  return `https://music.163.com/song/media/outer/url?id=${songId}.mp3`;
}

export const GET: APIRoute = async ({ url: requestUrl }) => {
  try {
    // 初始化 Meting，使用网易云音乐
    const meting = new Meting("netease");
    meting.format(true);

    // 获取歌单数据
    const playlistData = await meting.playlist(SITE.songListId);
    const songs = JSON.parse(playlistData);
    const debug = requestUrl.searchParams.get("debug") === "1";
    const qualityHits: Record<string, number> = {
      "320": 0,
      "192": 0,
      "128": 0,
      outer: 0,
      none: 0,
    };
    const songDiagnostics: Array<{ id: string | number; source: string; hasUrl: boolean }> = [];

    // 转换为 APlayer 格式
    const audio: APlayerAudio[] = await Promise.all(
      songs.map(async (song: any) => {
        // 获取歌曲 URL
        let url = "";
        const songId = song.url_id || song.id;
        let source = "none";
        for (const quality of AUDIO_QUALITIES) {
          try {
            const urlData = await meting.url(songId, quality);
            const urlObj = JSON.parse(urlData);
            if (urlObj.url) {
              url = urlObj.url;
              source = String(quality);
              qualityHits[String(quality)] += 1;
              break;
            }
          } catch (e) {
            console.error(`Fail to get song: id [${songId}], quality [${quality}], e [${String(e)}]`);
            // Continue trying lower bitrate fallback
          }
        }

        if (!url) {
          url = getNeteaseOuterUrl(songId);
          source = "outer";
          qualityHits.outer += 1;
          console.warn(`No direct playable URL returned, use outer fallback: id [${songId}], tried qualities [${AUDIO_QUALITIES.join(", ")}]`);
        }

        if (!url) {
          qualityHits.none += 1;
        }

        if (debug) {
          songDiagnostics.push({ id: songId, source, hasUrl: Boolean(url) });
        }

        // 获取歌词
        let lrc = "";
        try {
          const lyricData = await meting.lyric(song.lyric_id || songId);
          const lyricObj = JSON.parse(lyricData);
          lrc = lyricObj.lyric || "";
        } catch {
          lrc = "";
        }

        // 获取封面
        let cover = "";
        try {
          const picData = await meting.pic(song.pic_id || songId, 300);
          const picObj = JSON.parse(picData);
          cover = picObj.url || "";
        } catch {
          cover = "";
        }

        return {
          name: song.name,
          artist: Array.isArray(song.artist) ? song.artist.join(", ") : song.artist,
          url,
          cover,
          lrc,
        };
      })
    );

    // 过滤掉没有 URL 的歌曲
    const validAudio = audio.filter(song => song.url);

    console.info(
      `[Music API] total=${songs.length}, valid=${validAudio.length}, qualityHits=${JSON.stringify(qualityHits)}`
    );

    const responsePayload = debug
      ? {
          audio: validAudio,
          debug: {
            playlistSize: songs.length,
            validSize: validAudio.length,
            qualityHits,
            songDiagnostics,
          },
        }
      : validAudio;

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Music-Playlist-Size": String(songs.length),
        "X-Music-Valid-Size": String(validAudio.length),
      },
    });
  } catch (error) {
    console.error("[Music API] 获取歌单失败:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch playlist" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
