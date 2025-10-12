import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BulkUpdateRequest {
  updates: Array<{
    id: string;
    updates: {
      name?: string;
      base_price?: number;
      stock_quantity?: number;
      brand?: string;
      model?: string;
    };
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: BulkUpdateRequest = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Не предоставлены данные для обновления' },
        { status: 400 }
      );
    }

    console.log(`🔄 Начинаем массовое обновление ${updates.length} товаров`);

    const results = [];
    const errors = [];

    // Обрабатываем обновления по одному для лучшего контроля ошибок
    for (const update of updates) {
      try {
        const { id, updates: productUpdates } = update;

        // Проверяем существование товара
        const existingProduct = await prisma.product.findUnique({
          where: { id },
          select: { id: true, sku: true, name: true }
        });

        if (!existingProduct) {
          errors.push(`Товар с ID ${id} не найден`);
          continue;
        }

        // Обновляем товар
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: productUpdates,
          select: {
            id: true,
            sku: true,
            name: true,
            base_price: true,
            stock_quantity: true,
            brand: true,
            model: true
          }
        });

        results.push({
          id: updatedProduct.id,
          sku: updatedProduct.sku,
          name: updatedProduct.name,
          updated: true
        });

        console.log(`✅ Обновлен товар: ${updatedProduct.sku} - ${updatedProduct.name}`);

      } catch (error) {
        console.error(`❌ Ошибка обновления товара ${update.id}:`, error);
        errors.push(`Товар ${update.id}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    }

    console.log(`🎉 Массовое обновление завершено: ${results.length} успешно, ${errors.length} ошибок`);

    return NextResponse.json({
      success: true,
      updated: results.length,
      errors: errors.length,
      results,
      errorDetails: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Ошибка массового обновления товаров:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint для получения информации о товарах для массового редактирования
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'Не указан ID категории' },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: { catalog_category_id: categoryId },
      select: {
        id: true,
        sku: true,
        name: true,
        base_price: true,
        stock_quantity: true,
        brand: true,
        model: true
      },
      take: limit,
      skip: offset,
      orderBy: { sku: 'asc' }
    });

    const total = await prisma.product.count({
      where: { catalog_category_id: categoryId }
    });

    return NextResponse.json({
      success: true,
      products,
      total,
      limit,
      offset
    });

  } catch (error) {
    console.error('❌ Ошибка получения товаров для массового редактирования:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка получения товаров',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
