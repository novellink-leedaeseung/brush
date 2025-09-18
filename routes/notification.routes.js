// routes/members.routes.js
import {Router} from 'express';
import {asyncHandler} from '../core/asyncHandler.js';
import path from "path";
import fs from "fs";

export const notificationRoutes = (svc) => {
    const r = Router();

    r.get('/', asyncHandler(async (req, res) => {
        const folder = path.join(process.cwd(), "/public/assets/notification");
        try {
            const files = fs.readdirSync(folder).filter(f => f.endsWith(".png"));
            res.json(files.map(f => `/assets/notification/${f}`));
        } catch (err) {
            console.error("❌ 폴더 읽기 실패:", err);
            res.status(500).json({error: "폴더 읽기 실패"});
        }
    }));


    return r;
};
