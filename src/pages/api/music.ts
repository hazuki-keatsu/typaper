import type { APIRoute } from "astro";
import Meting from "@meting/core";
import { SITE } from "src/config";

interface APlayerAudio {
  name: string;
  artist: string;
  url: string;
  cover: string;
  lrc: string;
}

export const GET: APIRoute = async () => {
  try {
    // 初始化 Meting，使用网易云音乐
    const meting = new Meting("netease");
    meting.format(true);

    // 获取歌单数据
    const playlistData = await meting.playlist(SITE.songListId);
    const songs = JSON.parse(playlistData);

    // 转换为 APlayer 格式
    const audio: APlayerAudio[] = await Promise.all(
      songs.map(async (song: any) => {
        // 获取歌曲 URL
        let url = "";
        try {
          const urlData = await meting.url(song.url_id || song.id, 320);
          const urlObj = JSON.parse(urlData);
          url = urlObj.url || "";
        } catch {
          url = "";
        }

        // 获取歌词
        let lrc = "";
        try {
          const lyricData = await meting.lyric(song.lyric_id || song.id);
          const lyricObj = JSON.parse(lyricData);
          lrc = lyricObj.lyric || "";
        } catch {
          lrc = "";
        }

        // 获取封面
        let cover = "";
        try {
          const picData = await meting.pic(song.pic_id || song.id, 300);
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

    return new Response(JSON.stringify(validAudio), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
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
