import {
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Response as ExpResponse, Request as ExpRequest } from 'express';
import axios from 'axios';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('payment')
  async doPayment(@Res() res: ExpResponse) {
    try {
      const json = fs.readFileSync('src/constant/data.json');
      const data = JSON.parse(json as never);
      console.log('🚀 ~ AppController ~ doPayment ~ data:', data);

      const headers = {
        Authorization: 'key live_secret_key_68791341fdd94846a146f0457ff7b455',
        'Content-Type': 'application/json',
      };
      console.log(headers);

      const response = await axios.post(
        'https://a.khalti.com/api/v2/epayment/initiate/',
        data,
        { headers },
      );

      console.log('data', response.data);
      console.log('url', response.data.payment_url);

      res.json({
        message: 'khalti success',
        payment_method: 'khalti',
        data: response.data,
      });
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error' + error);
    }
  }

  @Get('txndetail')
  async getTxnDetails(@Req() req: ExpRequest, @Res() res: ExpResponse, next) {
    const headers = {
      Authorization: 'key live_secret_key_68791341fdd94846a146f0457ff7b455',
      'Content-Type': 'application/json',
    };
    console.log('🚀 ~ AppController ~ getTxnDetails ~ headers:', headers);

    const pidx = req.query;

    console.log('🚀 ~ AppController ~ getTxnDetails ~ pidx:', pidx);

    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      pidx,
      { headers },
    );
    console.log('🚀 ~ AppController ~ getTxnDetails ~ response:', response);

    if (response.data.status !== 'Completed') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    console.log(
      '🚀 ~ AppController ~ getTxnDetails ~ response:',
      response.data,
    );
    return res.json(response.data);
  }
}
