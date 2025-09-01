const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Diagnosing Supabase setup...');

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function diagnose() {
  try {
    // Check 1: Database connection
    console.log('\n1️⃣ Testing database connection...');
    const { data: dbTest, error: dbError } = await supabase
      .from('services')
      .select('id')
      .limit(1);
    
    if (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
    } else {
      console.log('✅ Database connection working');
    }

    // Check 2: image_url column
    console.log('\n2️⃣ Checking image_url column...');
    const { data: columnTest, error: columnError } = await supabase
      .from('services')
      .select('id, image_url')
      .limit(1);
    
    if (columnError) {
      console.error('❌ image_url column missing:', columnError.message);
      console.log('🔧 Run this SQL in Supabase Dashboard:');
      console.log('ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;');
    } else {
      console.log('✅ image_url column exists');
    }

    // Check 3: Storage bucket
    console.log('\n3️⃣ Checking storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Cannot access storage:', bucketError.message);
    } else {
      const serviceImagesBucket = buckets.find(b => b.id === 'service-images');
      if (serviceImagesBucket) {
        console.log('✅ service-images bucket exists');
        console.log('📊 Bucket details:', {
          id: serviceImagesBucket.id,
          public: serviceImagesBucket.public,
          file_size_limit: serviceImagesBucket.file_size_limit
        });
      } else {
        console.error('❌ service-images bucket missing');
        console.log('🔧 Creating bucket...');
        
        const { data: newBucket, error: createError } = await supabase.storage.createBucket('service-images', {
          public: true,
          fileSizeLimit: 5242880,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        });
        
        if (createError) {
          console.error('❌ Failed to create bucket:', createError.message);
        } else {
          console.log('✅ Created service-images bucket');
        }
      }
    }

    // Check 4: Storage policies
    console.log('\n4️⃣ Checking storage policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_storage_policies');
    
    if (policyError) {
      console.log('⚠️ Cannot check policies directly, using alternative method...');
      
      // Try to list files in bucket (tests read policy)
      const { data: files, error: listError } = await supabase.storage
        .from('service-images')
        .list('', { limit: 1 });
      
      if (listError) {
        console.error('❌ Storage read policy issue:', listError.message);
      } else {
        console.log('✅ Storage read access working');
      }
    } else {
      console.log('✅ Storage policies accessible');
    }

    // Check 5: Test upload with service key (should work)
    console.log('\n5️⃣ Testing upload with service key...');
    const testContent = Buffer.from('test image content');
    const testPath = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('service-images')
      .upload(testPath, testContent, {
        contentType: 'text/plain'
      });
    
    if (uploadError) {
      console.error('❌ Service key upload failed:', uploadError.message);
      if (uploadError.message.includes('row-level security')) {
        console.log('🔧 Storage policies need to be fixed. Run this SQL:');
        console.log(`
-- Fix storage policies
CREATE POLICY IF NOT EXISTS "service_images_upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'service-images');

CREATE POLICY IF NOT EXISTS "service_images_read" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'service-images');

CREATE POLICY IF NOT EXISTS "service_images_delete" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'service-images');
        `);
      }
    } else {
      console.log('✅ Service key upload working');
      
      // Clean up test file
      await supabase.storage
        .from('service-images')
        .remove([testPath]);
      console.log('🧹 Cleaned up test file');
    }

    // Check 6: Auth status simulation
    console.log('\n6️⃣ Testing with anon key (simulates frontend)...');
    const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
    
    const { data: anonUpload, error: anonError } = await anonClient.storage
      .from('service-images')
      .upload(`anon-test-${Date.now()}.txt`, testContent);
    
    if (anonError) {
      console.error('❌ Anonymous upload failed (expected if not authenticated):', anonError.message);
      console.log('ℹ️ This is normal - users need to be authenticated to upload');
    } else {
      console.log('⚠️ Anonymous upload succeeded (check if this is intended)');
      await anonClient.storage.from('service-images').remove([anonUpload.path]);
    }

    console.log('\n🎯 Summary:');
    console.log('- Database connection: ' + (dbError ? '❌' : '✅'));
    console.log('- image_url column: ' + (columnError ? '❌' : '✅'));
    console.log('- Storage bucket: ' + (buckets?.find(b => b.id === 'service-images') ? '✅' : '❌'));
    console.log('- Upload capability: ' + (uploadError ? '❌' : '✅'));
    
    if (!columnError && !uploadError && buckets?.find(b => b.id === 'service-images')) {
      console.log('\n🎉 Setup looks good! If you\'re still getting 403 errors, the issue might be:');
      console.log('1. User not authenticated in your app');
      console.log('2. Different authentication context');
      console.log('3. Frontend using different credentials');
    }

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

diagnose();