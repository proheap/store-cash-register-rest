import { Controller, Post, Get, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection, Schema as MongooseSchema } from 'mongoose';
import { appConstants } from '../../configs/app.config';
import { errorHandlingException } from '../../helpers/logger.helper';

import { CartService } from './cart.service';
import { GetCurrentUserId } from '../../common/decorators/getCurrentUserId.decorator';

const logLabel = 'CART-CONTROLLER';

@Controller(`${appConstants.appRoutePrefix}/cart`)
export class CartController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private cartService: CartService) {}

  @Post('product/:id')
  async addProductToCart(
    @GetCurrentUserId() userId: MongooseSchema.Types.ObjectId,
    @Param('id') productId: MongooseSchema.Types.ObjectId,
    @Body('quantity') quantity: number,
    @Res() res: Response,
  ) {
    try {
      const cart: any = await this.cartService.addProductToCart(userId, productId, quantity);
      return res.status(HttpStatus.CREATED).send({ data: cart });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @Put('item/:id')
  async updateProductInCart(
    @GetCurrentUserId() userId: MongooseSchema.Types.ObjectId,
    @Param('id') productId: MongooseSchema.Types.ObjectId,
    @Body('quantity') quantity: number,
    @Res() res: Response,
  ) {
    try {
      const cart: any = await this.cartService.updateProductFromCart(userId, productId, quantity);
      return res.status(HttpStatus.OK).send({ data: cart });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @Delete('item/:id')
  async removeProductsFromCart(
    @GetCurrentUserId() userId: MongooseSchema.Types.ObjectId,
    @Param('id') productId: MongooseSchema.Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      await this.cartService.removeProductFromCart(userId, productId);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @Get()
  async listProductsInCart(@GetCurrentUserId() userId: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      const cart: any = await this.cartService.listProductsInCart(userId);
      return res.status(HttpStatus.OK).send({ data: cart });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @Post('payment')
  async payProductsInCart(@GetCurrentUserId() userId: MongooseSchema.Types.ObjectId, @Body('money') money: number, @Res() res: Response) {
    try {
      const order: any = await this.cartService.payProductsInCart(userId, money);
      return res.status(HttpStatus.OK).send({ data: order });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }
}