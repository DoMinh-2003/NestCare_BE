import { PartialType } from '@nestjs/swagger';
import CreatePackageDto from './create.dto';

export class UpdatePackageDto extends PartialType(CreatePackageDto) {}
