import fsExtra from 'fs-extra'

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (e) => {
    try {
        let jsonObj = await fsExtra.readJson('./task_data.json')

        return { taskData: jsonObj }
    }
    finally {
        
    }
};