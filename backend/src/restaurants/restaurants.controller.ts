import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { RestaurantFiltersDto } from './dto/restaurant-filters.dto';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all restaurants with filters' })
  @ApiQuery({ name: 'cuisine', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['rating', 'delivery_time', 'price'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Restaurants retrieved' })
  async findAll(@Query() filters: RestaurantFiltersDto) {
    return this.restaurantsService.findAll(filters);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all cuisine categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved' })
  async getCategories() {
    return this.restaurantsService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by ID' })
  @ApiResponse({ status: 200, description: 'Restaurant retrieved' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Get(':id/menu')
  @ApiOperation({ summary: 'Get restaurant menu' })
  @ApiResponse({ status: 200, description: 'Menu retrieved' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async getMenu(@Param('id') id: string) {
    return this.restaurantsService.getMenu(id);
  }
}
