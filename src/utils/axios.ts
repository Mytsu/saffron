/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';
import { retry } from './promises';

export const get = async (url: string): Promise<any> => {
    const { data } = await retry(5, 5000, url, axios.get);
    return data;
}