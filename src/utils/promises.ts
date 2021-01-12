/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const retry = async (
    retries: number,
    time: number,
    data: any,
    callback: (data: any) => Promise<any>
): Promise<any> => {
    try {
        return await callback(data);
    } catch (e) {
        if (retries < 1) throw `\nRetry failed (max tries reached)\n`;
        await delay(time);
        return retry(retries - 1, time, data, callback);
    }
};
