declare module "@meting/core" {
  export default class Meting {
    constructor(source: string);
    format(enabled: boolean): void;
    playlist(id: string): Promise<string>;
    url(id: string | number, br?: number): Promise<string>;
    lyric(id: string | number): Promise<string>;
    pic(id: string | number, size?: number): Promise<string>;
  }
}
