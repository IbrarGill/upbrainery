import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, Graph1QueryDto, Graph2QueryDto, SearchOrganazitionInstituteQuery, SearchOrganazitionInstuctorQuery, SearchOrganazitionLearnerQuery } from './dto/create-organization.dto';
import { UpdateOrganizationDto, UpdateOrganizationUserDto } from './dto/update-organization.dto';
import { ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response, response } from "express";
import { InstructorImageValidation } from 'src/AssetValidation/instructorImageValidation';
import { JwtGuard } from 'src/authStrategy/guard';
import { Roles, role } from 'src/authStrategy/roleGuard/role';
@ApiTags('organization')
@Controller()
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
@Roles(role.ORGANIZATION, role.ADMIN, role.INSTRUCTOR)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) { }

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto, @Res() response: Response) {
    return this.organizationService.create(createOrganizationDto, response);
  }

  @Get('allorganization')
  findAllOrganization(@Res() response: Response) {
    return this.organizationService.findAllOrganization(response);
  }

  @Get('allinstructors')
  findAllorganizationinstructors(@Query() query: SearchOrganazitionInstuctorQuery, @Res() response: Response) {
    return this.organizationService.findAllorganizationinstructors(query, response);
  }

  @Get('alllearners')
  findAllorganizationlearners(@Query() query: SearchOrganazitionLearnerQuery, @Res() response: Response) {
    return this.organizationService.findAllorganizationlearners(query, response);
  }

  @Get('allinstitutes')
  findAllorganizationInstitute(@Query() query: SearchOrganazitionInstituteQuery, @Res() response: Response) {
    return this.organizationService.findAllorganizationInstitute(query, response);
  }

  @Get('allorginstitutions/:id')
  allorginstitutions(@Param('id', ParseIntPipe) id: number, @Res() response: Response) {
    return this.organizationService.findAllOrganizationinstitutions(id, response);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Res() response: Response) {
    return this.organizationService.findOne(id, response);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @Res() response: Response
  ) {
    return this.organizationService.update(id, updateOrganizationDto, response);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Res() response: Response) {
    return this.organizationService.remove(id, response);
  }


  @Get('user/:id')
  findOrganizationUser(@Param('id', ParseIntPipe) id: number, @Res() response: Response) {
    return this.organizationService.findOneOrganizationUser(id, response);
  }

  @Patch("user/:id")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(InstructorImageValidation)
  updateOrganizationUser(
    @UploadedFiles() files: Express.Multer.File,
    @Param("id") id: number,
    @Body() dto: UpdateOrganizationUserDto,
    @Res() response: Response
  ) {
    return this.organizationService.updateOrganizationUser(id, files, dto, response);
  }

  @Get('dashboard/organizationstats/:id')
  organizationstats(@Param("id") id: number,@Req() request:Request, @Res() response: Response) {
    return this.organizationService.organizationstats(id,request, response);
  }


  @Get('dashboard/graph1')
  graph1(@Query() query: Graph1QueryDto, @Res() response: Response) {
    return this.organizationService.graph1(query, response);
  }

  @Get('dashboard/graph2')
  graph2(@Query() query: Graph2QueryDto, @Res() response: Response) {
    return this.organizationService.graph2(query, response);
  }

  @Get('dashboard/graph3/:id')
  graph3(@Param("id") id: number, @Res() response: Response) {
    return this.organizationService.graph3(id, response);
  }

  @Get('dashboard/graph4/:id')
  graph4(@Param("id") id: number, @Res() response: Response) {
    return this.organizationService.top5EarnedBagdesByLearners(id, response);
  }

  @Get('dashboard/top3clusters/:id')
  top3clusters(@Param("id") id: number, @Res() response: Response) {
    return this.organizationService.top3clusters(id, response);
  }

  @Get('dashboard/top3pathways/:id')
  top3pathways(@Param("id") id: number, @Res() response: Response) {
    return this.organizationService.top3Pathways(id, response);
  }
}
