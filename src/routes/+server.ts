import type { RequestHandler } from './$types';

import fsExtra from 'fs-extra'
import { open, type FileHandle } from 'node:fs/promises';

export const POST: RequestHandler = async (event) => {
    let fileHandle: FileHandle | undefined = undefined
    try {
        fileHandle = await open('./task_data.json', 'r+')

        fileHandle.truncate()

        fsExtra.writeJSON('./task_data.json', await event.request.json())
    } finally {
        fileHandle?.close()
    }
    
    return new Response()
}