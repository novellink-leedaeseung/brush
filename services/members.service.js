// services/members.service.js
import {toBool, assertCreateMember, isValidPhone} from '../core/validate.js';
import {appendMemberToExcel} from '../src/utils/excelStore.js';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs-extra';

export class MembersService {
    constructor(repo) {
        this.repo = repo;
    }

    list(q) {
        return this.repo.list(q);
    }

    get(id) {
        return this.repo.get(id);
    }

    async create(body) {
        assertCreateMember(body);
        const data = {
            name: String(body.name).trim(),
            phone: String(body.phone).trim(),
            gradeClass: String(body.gradeClass ?? '').trim(),
            gender: String(body.gender ?? '').trim(),
            lunch: toBool(body.lunch),
        };
        setTimeout(() => {
            this.exportToExcel();
        }, 600);
        return this.repo.create(data);
    }

    update(id, body) {
        if (body?.phone !== undefined && !isValidPhone(body.phone))
            throw Object.assign(new Error('휴대폰 번호 형식 오류'), {status: 400});

        const patch = {};
        if (body?.name !== undefined) patch.name = String(body.name).trim();
        if (body?.phone !== undefined) patch.phone = String(body.phone).trim();
        if (body?.gradeClass !== undefined) patch.gradeClass = String(body.gradeClass).trim();
        if (body?.gender !== undefined) patch.gender = String(body.gender).trim();
        if (body?.lunch !== undefined) patch.lunch = toBool(body.lunch);

        return this.repo.update(id, patch);
    }

    delete(id) {
        return this.repo.delete(id);
    }

    async exportToExcel() {
        // 1. Get all dates from the repo
        const allDates = await this.repo.getAllDates();
        if (allDates.length === 0) {
            console.log('No data to export.');
            return {message: 'No data to export.'};
        }

        // 2. Get data for the entire date range
        const dateRangeData = await this.repo.getDataByDateRange(allDates[0], allDates[allDates.length - 1]);

        // 3. Consolidate all members into a single array
        const allMembers = dateRangeData.flatMap(dailyData => dailyData.data);

        if (allMembers.length === 0) {
            console.log('No members to export.');
            return {message: 'No members to export.'};
        }

        // 4. Write to Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('All Members');

        worksheet.columns = [
            {header: 'ID', key: 'id', width: 10},
            {header: 'Timestamp', key: 'createdAt', width: 22},
            {header: 'Name', key: 'name', width: 16},
            {header: 'Phone', key: 'phone', width: 16},
            {header: 'Grade/Class', key: 'gradeClass', width: 12},
            {header: 'Gender', key: 'gender', width: 8},
            {header: 'Lunch', key: 'lunch', width: 8},
            {header: 'Updated At', key: 'updatedAt', width: 22},
        ];

        worksheet.addRows(allMembers);

        // 5. Save the file
        const DATA_DIR = path.join(process.cwd(), 'data');
        await fs.ensureDir(DATA_DIR);
        const exportFilePath = path.join(DATA_DIR, 'members_export_all.xlsx');
        await workbook.xlsx.writeFile(exportFilePath);

        console.log(`Exported ${allMembers.length} members to ${exportFilePath}`);
        return {filePath: exportFilePath, count: allMembers.length};
    }
}
