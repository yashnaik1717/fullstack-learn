import { prisma } from '../config/db';
import { AuditAction } from '@prisma/client';

export class AuditService {
  async log(params: {
    actorId: string;
    action: AuditAction;
    targetEntity: string;
    targetId: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
  }) {
    try {
      await prisma.auditTrail.create({
        data: {
          actorId: params.actorId,
          action: params.action,
          targetEntity: params.targetEntity,
          targetId: params.targetId,
          oldValues: params.oldValues || undefined,
          newValues: params.newValues || undefined,
          ipAddress: params.ipAddress,
        },
      });
    } catch (error) {
      console.error('Audit logger failed:', error);
    }
  }
}

export const auditService = new AuditService();
