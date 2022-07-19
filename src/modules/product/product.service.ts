import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { errorHandlingException } from '../../helpers/logger.helper';

import { Product } from '../../models/product.model';
import { User } from '../../models/user.model';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';

const logLabel = 'PRODUCT-SERVICE';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>, @InjectModel(User.name) private readonly userModel: Model<User>) {}

  async createProduct(createProductDto: CreateProductDto) {
    let product = await this.productModel.findOne({ title: createProductDto.title });
    if (product) {
      errorHandlingException(logLabel, null, true, HttpStatus.CONFLICT, 'Product already exists');
    }
    product = new this.productModel({
      title: createProductDto.title,
      description: createProductDto.description,
      price: createProductDto.price,
      quantity: createProductDto.quantity,
    });
    try {
      product = await product.save();
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, HttpStatus.CONFLICT, 'Product not created');
    }
    return product;
  }

  async getProductById(id: MongooseSchema.Types.ObjectId) {
    let product: any;
    try {
      product = await this.productModel.findById({ _id: id });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    return product;
  }

  async updateProduct(id: MongooseSchema.Types.ObjectId, updateProductDto: UpdateProductDto) {
    let product: any;
    try {
      product = await this.productModel.findById({ _id: id });
      product.title = updateProductDto.title;
      product.description = updateProductDto.description;
      product.price = updateProductDto.price;
      product.quantity = updateProductDto.quantity;
      product = await product.save();
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    return product;
  }

  async deleteProduct(id: MongooseSchema.Types.ObjectId) {
    let product: any;
    try {
      product = this.productModel.findByIdAndDelete({ _id: id });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    return product;
  }

  async listProducts() {
    let products = [];
    try {
      products = await this.productModel.find();
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return products;
  }
}
