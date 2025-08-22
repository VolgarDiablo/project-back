import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { Plan } from '@prisma/client';

@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Get()
  async getAllPlans(): Promise<Plan[]> {
    return this.plansService.findAll();
  }

  @Get('my-plans')
  async getMyActivePlans(@Req() req: any): Promise<any> {
    if (!req.user) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.plansService.findUserActivePlans(req.user);
  }

  @Get(':id')
  async getPlanById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Plan | null> {
    return this.plansService.findById(id);
  }
}
