import { PartialType } from "@nestjs/mapped-types";
import { CreateOnnetDto } from "./create-onnet.dto";

export class UpdateOnnetDto extends PartialType(CreateOnnetDto) {}
