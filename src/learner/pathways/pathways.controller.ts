import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Res,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PathwaysService } from "./pathways.service";
import {
  AddPathwayDto,
  AddPathwaysClusterDto,
  AddPathwaysLevelDto,
  CreatePathwayApproval,
  CreatePathwayDto,
  SearchCLusterPathwayDto,
  SearchPathwayApprovals,
  SearchPathwayDto,
  SearchPathwayRequests,
} from "./dto/create-pathway.dto";
import {
  UpdatePathwayDto,
  UpdatePathwaysLevelDto,
} from "./dto/update-pathway.dto";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import {
  DeletePathway,
  PathwayEntity,
  RegisterPathway,
  UpdatePathway,
} from "./entities/pathway.entity";
import { Response } from "express";
import { JwtGuard } from "src/authStrategy/guard";

@Controller("")
@ApiTags("pathways")
@ApiSecurity("JWT-AUTH")
@UseGuards(JwtGuard)
export class PathwaysController {
  constructor(private readonly pathwaysService: PathwaysService) {}

  @Post("create")
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterPathway,
  })
  create(
    @Body() createPathwayDto: CreatePathwayDto,
    @Res() response: Response
  ) {
    return this.pathwaysService.create(createPathwayDto, response);
  }

  @Post("add-pathways")
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterPathway,
  })
  addpathways(@Body() addPathwayDto: AddPathwayDto, @Res() response: Response) {
    return this.pathwaysService.addPathway(addPathwayDto, response);
  }

  @Post("add-levels")
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterPathway,
  })
  addlevel(
    @Body() addPathwaysLevelDto: AddPathwaysLevelDto,
    @Res() response: Response
  ) {
    return this.pathwaysService.addLevel(addPathwaysLevelDto, response);
  }

  @Post("add-pathways-cluster")
  @ApiResponse({
    status: HttpStatus.OK,
    type: RegisterPathway,
  })
  addPathwayCluster(
    @Body() addPathwaysClusterDto: AddPathwaysClusterDto,
    @Res() response: Response
  ) {
    return this.pathwaysService.addPathwayCluster(
      addPathwaysClusterDto,
      response
    );
  }

  @Get("all")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [PathwayEntity],
  })
  findAll(@Res() response: Response, @Query() query: SearchPathwayDto) {
    return this.pathwaysService.findAll(response, query);
  }

  @Get("cluster_pathways")
  @ApiResponse({
    status: HttpStatus.OK,
    type: [PathwayEntity],
  })
  findAllCLusterPatways(
    @Res() response: Response,
    @Query() query: SearchCLusterPathwayDto
  ) {
    return this.pathwaysService.findAllCLusterPathways(response, query);
  }

  @Get(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: PathwayEntity,
  })
  findOne(@Param("id") id: string, @Res() response: Response) {
    return this.pathwaysService.findOne(+id, response);
  }

  @Patch("pathways/:id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdatePathway,
  })
  updatePathways(
    @Param("id") id: string,
    @Body() updatePathwayDto: UpdatePathwayDto,
    @Res() response: Response
  ) {
    return this.pathwaysService.updatePathways(+id, updatePathwayDto, response);
  }

  @Patch("levels/:id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdatePathway,
  })
  updateLevels(
    @Param("id") id: string,
    @Body() updatePathwaysLevelDto: UpdatePathwaysLevelDto,
    @Res() response: Response
  ) {
    return this.pathwaysService.updateLevels(
      +id,
      updatePathwaysLevelDto,
      response
    );
  }

  @Delete(":id")
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeletePathway,
  })
  remove(@Param("id") id: string, @Res() response: Response) {
    return this.pathwaysService.remove(+id, response);
  }
}
