import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ClustersService } from "./clusters.service";
import {
  CreateClusterDto,
  SearchClusterDto,
  colordto,
  SearchInstructorClusterDto,
} from "./dto/create-cluster.dto";
import { UpdateClusterDto } from "./dto/update-cluster.dto";
import { Response,Request } from "express";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import {
  ClusterEntity,
  DeleteCluster,
  RegisterCluster,
  UpdateCluster,
} from "./entities/cluster.entity";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("clusters")
@ApiTags("clusters")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class ClustersController {
  constructor(private readonly clustersService: ClustersService) { }

  @Post()
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterCluster,
  })
  create(
    @Body() createClusterDto: CreateClusterDto,
    @Res() response: Response
  ) {
    return this.clustersService.create(createClusterDto, response);
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ClusterEntity],
  })
  findAll(@Res() response: Response, @Query() query: SearchClusterDto) {
    return this.clustersService.findAll(response, query);
  }
  @Get("learner-clusters")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ClusterEntity],
  })
  findAllLearnerClusters(
    @Res() response: Response,
    @Query() query: SearchClusterDto,
    @Req() request: Request
  ) {
    return this.clustersService.findAllLearnerClusters(response, query, request);
  }

  @Get("Instructor-clusters")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [ClusterEntity],
  })
  findAllInstructorClusters(
    @Res() response: Response,
    @Query() query: SearchInstructorClusterDto
  ) {
    return this.clustersService.findAllInstructorClusters(response, query);
  }

  @Get("single/:id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: ClusterEntity,
  })
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.clustersService.findOne(+id, response);
  }

  @Patch(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateCluster,
  })
  update(
    @Param("id") id: string,
    @Body() updateClusterDto: UpdateClusterDto,
    @Res() response: Response
  ) {
    return this.clustersService.update(+id, updateClusterDto, response);
  }

  @Delete(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteCluster,
  })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.clustersService.remove(+id, response);
  }
  //===========================color path routes==================================
  @Post("createcolor")
  createcolor(@Body() dto: colordto, @Res() response: Response) {
    return this.clustersService.createcolor(dto, response);
  }

  @Get("allcolor")
  findAllColor(@Res() response: Response, @Query() query: SearchClusterDto) {
    return this.clustersService.findallcolor(response, query);
  }

  @Get("color/:id")
  findsinglecolor(@Param("id") id: string, @Res() response: Response) {
    return this.clustersService.findOnecolor(+id, response);
  }

  @Patch("color/:id")
  updatecolor(
    @Param("id") id: string,
    @Body() updateClusterDto: colordto,
    @Res() response: Response
  ) {
    return this.clustersService.updatecolor(+id, updateClusterDto, response);
  }

  @Delete("color/:id")
  removecolor(@Param("id") id: string, @Res() response: Response) {
    return this.clustersService.removecolor(+id, response);
  }
}
