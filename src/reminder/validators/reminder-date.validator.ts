import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'startBeforeEndDate', async: false })
export class StartBeforeEndDate implements ValidatorConstraintInterface {
  validate(startDate: string, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const endDate = (args.object as any)[relatedPropertyName];
    return new Date(startDate) <= new Date(endDate);
  }

  defaultMessage(args: ValidationArguments) {
    return `Ngày bắt đầu (${args.value}) không được lớn hơn ngày kết thúc.`;
  }
}

@ValidatorConstraint({ name: 'startDateInFuture', async: false })
export class StartDateInFuture implements ValidatorConstraintInterface {
  validate(startDate: string) {
    return new Date(startDate) >= new Date();
  }

  defaultMessage() {
    return 'Ngày bắt đầu phải là ngày trong tương lai.';
  }
}
