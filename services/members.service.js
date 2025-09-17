// services/members.service.js
import { toBool, assertCreateMember, isValidPhone } from '../core/validate.js';

export class MembersService {
  constructor(repo) { this.repo = repo; }

  list(q) { return this.repo.list(q); }
  get(id) { return this.repo.get(id); }

  create(body) {
    assertCreateMember(body);
    const data = {
      name: String(body.name).trim(),
      phone: String(body.phone).trim(),
      gradeClass: String(body.gradeClass ?? '').trim(),
      gender: String(body.gender ?? '').trim(),
      lunch: toBool(body.lunch),
    };
    return this.repo.create(data);
  }

  update(id, body) {
    if (body?.phone !== undefined && !isValidPhone(body.phone))
      throw Object.assign(new Error('휴대폰 번호 형식 오류'), { status: 400 });

    const patch = {};
    if (body?.name !== undefined) patch.name = String(body.name).trim();
    if (body?.phone !== undefined) patch.phone = String(body.phone).trim();
    if (body?.gradeClass !== undefined) patch.gradeClass = String(body.gradeClass).trim();
    if (body?.gender !== undefined) patch.gender = String(body.gender).trim();
    if (body?.lunch !== undefined) patch.lunch = toBool(body.lunch);

    return this.repo.update(id, patch);
  }

  delete(id) { return this.repo.delete(id); }
}
