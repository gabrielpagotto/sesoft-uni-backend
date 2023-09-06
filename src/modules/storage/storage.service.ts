import { Injectable } from '@nestjs/common';
import { Storage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StorageService {
    constructor(private db: PrismaService) {}

    uploadFilesAndGetStorageRecords<
        T extends Array<Express.Multer.File> | Express.Multer.File,
        R = T extends Array<Express.Multer.File> ? Storage[] : Storage,
    >(files: T) {
        // @TODO: Implement the upload of the files to Firebase

        if (Array.isArray(files)) {
            return [] as R;
        } else {
            return '' as R;
        }
    }
}