import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseInterceptors, UploadedFiles, Query, UseGuards, Req } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { CreateBadgeDto, CreateBadgeTypeDto, Searchbadges, SearchbadgesType } from './dto/create-badge.dto';
import { UpdateBadgeDto, UpdateCreateBadgeTypeDto } from './dto/update-badge.dto';
import { ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response,Request } from "express";
import { InstructorImageValidation } from 'src/AssetValidation/instructorImageValidation';
import { JwtGuard } from 'src/authStrategy/guard';
@Controller('')
@ApiTags('badges')
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) { }
  //=================================================Badges==================================================================
  @Post('create')
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(InstructorImageValidation)
  create(@UploadedFiles() files: Express.Multer.File, @Body() createBadgeDto: CreateBadgeDto, @Res() response: Response) {
    return this.badgesService.create(files, createBadgeDto, response);
  }

  @Get('all')
  findAll(@Query() query: Searchbadges, @Res() response: Response) {
    return this.badgesService.findAll(query, response);
  }

  @Get('badgesdetails/:id')
  findOne(@Param('id') id: number, @Res() response: Response,@Req() request:Request) {
    return this.badgesService.findOne(id, response,request);
  }

  @Patch('badges/:id')
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(InstructorImageValidation)
  update(@UploadedFiles() files: Express.Multer.File, @Param('id') id: number, @Body() updateBadgeDto: UpdateBadgeDto, @Res() response: Response) {
    return this.badgesService.update(files, id, updateBadgeDto, response);
  }

  @Delete('badges/:id')
  remove(@Param('id') id: number, @Res() response: Response) {
    return this.badgesService.remove(id, response);
  }
 //=================================================Badges type==================================================================
  @Post('ceatebagdetype')
  createbagdetype(@Body() dto: CreateBadgeTypeDto, @Res() response: Response) {
    return this.badgesService.createbagdetype(dto, response);
  }
  @Get('getAllbadgeTyes')
  getAllbadgeTyes(@Query() query: SearchbadgesType,@Res() response: Response) {
    return this.badgesService.getAllbadgeTyes(query,response);
  }

  @Patch('badgestype/:id')
  updatebadgestype(@Param('id') id: number, @Body() updateBadgeDto: UpdateCreateBadgeTypeDto, @Res() response: Response) {
    return this.badgesService.updatebadgestype( id, updateBadgeDto, response);
  }

  @Delete('badgestype/:id')
  removebadgestype(@Param('id') id: number, @Res() response: Response) {
    return this.badgesService.removebadgestype(id, response);
  }
}
