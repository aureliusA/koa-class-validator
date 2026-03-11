import { validate, ValidationError, ValidatorOptions } from 'class-validator';
import { Context, Next } from 'koa';

export class KoaValidator<T extends object> {
  readonly instance: T;
  readonly validatorOptions: ValidatorOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
  };
  constructor(instance: T) {
    this.instance = instance;
  }

  public async validateAndNext(ctx: Context, next: Next): Promise<unknown> {
    const result = await validate(this.instance, this.validatorOptions);

    if (result.length) {
      const message = this.extractErrorMessages(result);

      ctx.throw(422, message.join('. '));
    }

    ctx.transformedResults = this.instance;

    return next();
  }

  public async validateAndGetTransform(ctx: Context): Promise<T | undefined> {
    const result = await validate(this.instance, this.validatorOptions);

    if (result.length) {
      const message = this.extractErrorMessages(result);

      ctx.throw(422, message.join('. '));
    }

    return this.instance;
  }

  public async validate(ctx: Context, next: Next): Promise<unknown> {
    const result = await validate(this.instance, this.validatorOptions);

    if (result.length) {
      const message = this.extractErrorMessages(result);

      ctx.throw(422, message.join('. '));
    }

    return next();
  }

  private extractErrorMessages(errors: ValidationError[]): string[] {
    let messages: string[] = [];

    errors.forEach((error) => {
      if (error.constraints) {
        messages = messages.concat(Object.values(error.constraints));
      }

      if (error.children && error.children.length > 0) {
        messages = messages.concat(this.extractErrorMessages(error.children));
      }
    });

    return messages;
  }
}
