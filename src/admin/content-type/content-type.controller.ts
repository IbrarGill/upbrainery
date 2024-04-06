import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards } from '@nestjs/common';
import { ContentTypeService } from './content-type.service';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';
import { Response, } from "express";
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/authStrategy/guard';
@Controller('')
@ApiTags("/admin/content-type")

export class ContentTypeController {
  constructor(private readonly contentTypeService: ContentTypeService) { }

  @Post()
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  create(@Body() createContentTypeDto: CreateContentTypeDto, @Res() response: Response) {
    return this.contentTypeService.create(createContentTypeDto, response);
  }

  @Get('all')
  findAll(@Res() response: Response) {
    return this.contentTypeService.findAll(response);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() response: Response) {
    return this.contentTypeService.findOne(+id, response);
  }

  @Patch(':id')
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  update(@Param('id') id: number, @Body() updateContentTypeDto: UpdateContentTypeDto, @Res() response: Response) {
    return this.contentTypeService.update(id, updateContentTypeDto, response);
  }

  @Delete(':id')
  @ApiSecurity("JWT-AUTH")
  @UseGuards(JwtGuard)
  remove(@Param('id') id: number, @Res() response: Response) {
    return this.contentTypeService.remove(id, response);
  }
}
