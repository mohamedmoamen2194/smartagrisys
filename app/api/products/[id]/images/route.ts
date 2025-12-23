import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { headers } from 'next/headers';
import { put } from '@vercel/blob';

async function getUserFromRequest() {
  try {
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization) {
      return null;
    }

    const user = JSON.parse(authorization);
    if (!user || user.role !== 'FARMER' || !user.id) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmer = await prisma.farmer.findUnique({
      where: { userId: user.id },
    });

    if (!farmer) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const { id } = params;

    // Check if the product exists and belongs to this farmer
    const product = await prisma.product.findUnique({
      where: {
        id,
        farmerId: farmer.id,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const savedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        continue; // Skip non-image files
      }

      // Generate unique filename and upload to Vercel Blob
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop() || 'bin';
      const filename = `${product.id}-${timestamp}-${randomString}.${extension}`;

      // Upload file to Vercel Blob storage (publicly accessible)
      const blob = await put(`products/${filename}`, file, {
        access: 'public',
      });

      // Save image record to database using the Blob URL
      const imageUrl = blob.url;
      const isPrimary = i === 0; // First image is primary

      const savedImage = await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl,
          altText: `${product.name} image ${i + 1}`,
          isPrimary,
        },
      });

      savedImages.push(savedImage);
    }

    return NextResponse.json({
      success: true,
      images: savedImages,
      message: `${savedImages.length} image(s) uploaded successfully`
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
  }
} 