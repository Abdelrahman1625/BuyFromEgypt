import { ApiProperty } from '@nestjs/swagger';

export class UserPreferencesUsedDto {
  @ApiProperty({ 
    type: [String], 
    description: 'Industries used for recommendations',
    example: ['Petroleum & Energy', 'Handicrafts & Furniture', 'Agriculture & Food']
  })
  preferred_industries: string[];

  @ApiProperty({ 
    description: 'Supplier type used for recommendations',
    example: 'Large Corporations',
    required: false,
    nullable: true
  })
  preferred_supplier_type?: string | null;

  @ApiProperty({ 
    description: 'Order quantity preference used',
    example: 'Medium orders',
    required: false,
    nullable: true
  })
  preferred_order_quantity?: string | null;

  @ApiProperty({ 
    description: 'Shipping method preference used',
    example: 'Land Transport',
    required: false,
    nullable: true
  })
  preferred_shipping_method?: string | null;
}

export class RecommendationDataDto {
  @ApiProperty({ 
    type: [Object], 
    description: 'Array of recommended items (products or posts)'
  })
  recommendations: any[];

  @ApiProperty({ 
    description: 'User ID for whom recommendations were generated',
    example: '1000'
  })
  user_id: string;

  @ApiProperty({ 
    description: 'Type of recommendations',
    enum: ['product', 'post'],
    example: 'product'
  })
  recommendation_type: string;

  @ApiProperty({ 
    description: 'Reason for these recommendations',
    example: 'Based on your saved preferences and browsing history'
  })
  recommendation_reason: string;

  @ApiProperty({ 
    type: UserPreferencesUsedDto,
    description: 'User preferences that were used to generate recommendations'
  })
  user_preferences_used: UserPreferencesUsedDto;

  @ApiProperty({ 
    description: 'Timestamp when recommendations were generated',
    example: '2025-01-20T10:30:00.000Z'
  })
  generated_at: string;
}

export class RecommendationResponseDto {
  @ApiProperty({ 
    description: 'Response status',
    example: 'success'
  })
  status: string;

  @ApiProperty({ 
    description: 'Response message',
    example: 'Product recommendations generated successfully'
  })
  message: string;

  @ApiProperty({ 
    type: RecommendationDataDto,
    description: 'Recommendation data'
  })
  data: RecommendationDataDto;
}

export class UserPreferencesDataDto {
  @ApiProperty({ 
    description: 'User ID',
    example: '1000'
  })
  user_id: string;

  @ApiProperty({
    type: Object,
    description: 'User preferences object',
    example: {
      preferred_industries: ['Petroleum & Energy', 'Handicrafts & Furniture'],
      preferred_supplier_type: 'Large Corporations',
      preferred_order_quantity: 'Medium orders',
      preferred_shipping_method: 'Land Transport',
      receive_alerts: true
    }
  })
  preferences: {
    preferred_industries: string[];
    preferred_supplier_type?: string | null;
    preferred_order_quantity?: string | null;
    preferred_shipping_method?: string | null;
    receive_alerts?: boolean;
  };

  @ApiProperty({ 
    description: 'Timestamp when preferences were retrieved',
    example: '2025-01-20T10:30:00.000Z'
  })
  retrieved_at: string;
}

export class UserPreferencesResponseDto {
  @ApiProperty({ 
    description: 'Response status',
    example: 'success'
  })
  status: string;

  @ApiProperty({ 
    description: 'Response message',
    example: 'User preferences retrieved successfully'
  })
  message: string;

  @ApiProperty({ 
    type: UserPreferencesDataDto,
    description: 'User preferences data'
  })
  data: UserPreferencesDataDto;
}
