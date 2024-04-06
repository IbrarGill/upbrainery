import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards } from '@nestjs/common';
import { SmartdeskTypeService } from './smartdesk-type.service';
import { CreateSmartdeskTypeDto } from './dto/create-smartdesk-type.dto';
import { UpdateSmartdeskTypeDto } from './dto/update-smartdesk-type.dto';
import { Response } from "express";
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/authStrategy/guard';
@Controller('')
@ApiTags("admin/smartdesk-type")

export class SmartdeskTypeController {
  constructor(private readonly smartdeskTypeService: SmartdeskTypeService) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(@Body() createSmartdeskTypeDto: CreateSmartdeskTypeDto, @Res() response: Response) {
    return this.smartdeskTypeService.create(createSmartdeskTypeDto, response);
  }

  @Get('all')
  findAll(@Res() response: Response) {
    return this.smartdeskTypeService.findAll(response);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @Res() response: Response) {
    return this.smartdeskTypeService.findOne(id, response);
  }

  @Patch(':id')
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(@Param('id') id: number, @Body() updateSmartdeskTypeDto: UpdateSmartdeskTypeDto, @Res() response: Response) {
    return this.smartdeskTypeService.update(id, updateSmartdeskTypeDto, response);
  }

  @Delete(':id')
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param('id') id: number, @Res() response: Response) {
    return this.smartdeskTypeService.remove(id, response);
  }
}
