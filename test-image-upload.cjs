const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🖼️ Testing image upload...');

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testImageUpload() {
  try {
    // Create a minimal valid JPEG header (just for testing)
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xD9
    ]);
    
    const testPath = `test/test-${Date.now()}.jpg`;
    
    console.log('📤 Uploading test JPEG...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('service-images')
      .upload(testPath, jpegHeader, {
        contentType: 'image/jpeg'
      });
    
    if (uploadError) {
      console.error('❌ Image upload failed:', uploadError);
      
      if (uploadError.message.includes('row-level security')) {
        console.log('\n🔧 Storage policies are blocking uploads. Run this SQL:');
        console.log(`
-- Allow uploads with service role
CREATE POLICY IF NOT EXISTS "service_images_service_upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'service-images');

-- Allow uploads for authenticated users  
CREATE POLICY IF NOT EXISTS "service_images_auth_upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'service-images' AND 
  auth.role() = 'authenticated'
);
        `);
      }
    } else {
      console.log('✅ Image upload successful!');
      console.log('📊 Upload data:', uploadData);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('service-images')
        .getPublicUrl(testPath);
      
      console.log('🌐 Public URL:', publicUrl);
      
      // Clean up
      console.log('🧹 Cleaning up test file...');
      await supabase.storage
        .from('service-images')
        .remove([testPath]);
      
      console.log('✅ Test cleanup complete');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testImageUpload();