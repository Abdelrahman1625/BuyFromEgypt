import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Export')
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('recommendations/customer/:customerId')
  @ApiOperation({ summary: 'Export product recommendations for a customer' })
  @ApiParam({ name: 'customerId', description: 'The unique customer identifier' })
  @ApiQuery({ name: 'num_recommendations', required: false, type: Number, description: 'Number of recommendations to export (min: 1, max: 100)', default: 20 })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'], description: 'Export format', default: 'json' })
  @ApiResponse({ status: 200, description: 'Recommendations exported successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async exportCustomerRecommendations(
    @Param('customerId') customerId: string,
    @Query('num_recommendations') numRecommendations: number = 20,
    @Query('format') format: 'json' | 'csv' = 'json',
    @Res() res: Response
  ) {
    const recommendations = await this.exportService.getCustomerRecommendations(customerId, numRecommendations);

    if (format === 'csv') {
      const csvData = this.exportService.convertToCSV(recommendations, 'customer');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="customer_${customerId}_recommendations.csv"`);
      return res.send(csvData);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="customer_${customerId}_recommendations.json"`);
      return res.json({
        status: 'success',
        message: 'Customer recommendations exported successfully',
        data: {
          customer_id: customerId,
          recommendations,
          exported_at: new Date().toISOString(),
          format: 'json',
        },
      });
    }
  }

  @Get('recommendations/business/:businessName')
  @ApiOperation({ summary: 'Export product and business partnership recommendations' })
  @ApiParam({ name: 'businessName', description: 'The name of the business' })
  @ApiQuery({ name: 'num_product_recommendations', required: false, type: Number, description: 'Number of product recommendations (min: 1, max: 100)', default: 20 })
  @ApiQuery({ name: 'num_partner_recommendations', required: false, type: Number, description: 'Number of business partner recommendations (min: 1, max: 50)', default: 10 })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'], description: 'Export format', default: 'json' })
  @ApiResponse({ status: 200, description: 'Business recommendations exported successfully' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async exportBusinessRecommendations(
    @Param('businessName') businessName: string,
    @Query('num_product_recommendations') numProductRecommendations: number = 20,
    @Query('num_partner_recommendations') numPartnerRecommendations: number = 10,
    @Query('format') format: 'json' | 'csv' = 'json',
    @Res() res: Response
  ) {
    const { productRecommendations, partnerRecommendations } = await this.exportService.getBusinessRecommendations(businessName, numProductRecommendations, numPartnerRecommendations);

    if (format === 'csv') {
      const csvData = this.exportService.convertToCSV({ productRecommendations, partnerRecommendations }, 'business');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="business_${businessName}_recommendations.csv"`);
      return res.send(csvData);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="business_${businessName}_recommendations.json"`);
      return res.json({
        status: 'success',
        message: 'Business recommendations exported successfully',
        data: {
          business_name: businessName,
          product_recommendations: productRecommendations,
          partner_recommendations: partnerRecommendations,
          exported_at: new Date().toISOString(),
          format: 'json',
        },
      });
    }
  }
}
