import { Controller, Get, Param } from '@nestjs/common';
import { ChipLookupService } from './chip-lookup.service';

@Controller('chip')
export class ChipLookupController {
  constructor(private readonly chipLookupService: ChipLookupService) {}

  @Get(':chip_number')
  lookup(@Param('chip_number') chipNumber: string) {
    return this.chipLookupService.lookup(chipNumber);
  }
}
