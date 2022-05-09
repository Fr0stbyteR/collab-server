/* eslint-disable arrow-body-style */
export const uuid = () => {
    return globalThis?.crypto?.randomUUID
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
};
export const msToTime = (duration: number) => {
    const ms = ~~((duration % 1000) / 100);
    const sec = ~~((duration / 1000) % 60);
    const min = ~~((duration / (1000 * 60)) % 60);
    const hrs = ~~((duration / (1000 * 60 * 60)) % 24);
    return `${hrs.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
};
