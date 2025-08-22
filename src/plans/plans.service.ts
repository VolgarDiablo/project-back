// src/plans/plans.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Plan, User } from '@prisma/client';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Plan[]> {
    return this.prisma.plan.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: number): Promise<Plan | null> {
    return this.prisma.plan.findUnique({
      where: { id },
    });
  }

  async findUserActivePlans(user: User): Promise<any[]> {
    const userWithPlans = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        orders: {
          where: {
            type: 'plan',
            status: 'success',
          },
          include: {
            OrderPlans: {
              include: {
                Plan: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return (
      userWithPlans?.orders.map((order) => ({
        ...order.OrderPlans?.Plan,
        orderInfo: {
          orderId: order.id,
          amount: order.amount,
          purchaseDate: order.createdAt,
        },
      })) || []
    );
  }
}
