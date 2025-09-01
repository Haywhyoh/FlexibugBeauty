const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing environment variables. Please check .env.local file.');
  process.exit(1);
}

console.log('🔧 Setting up service images...');
console.log('📍 Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupServiceImages() {
  try {
    // Step 1: Create the storage bucket
    console.log('1️⃣ Creating service-images storage bucket...');
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
    } else {
      const bucketExists = buckets.some(bucket => bucket.id === 'service-images');
      
      if (!bucketExists) {
        const { data: bucket, error: createError } = await supabase.storage.createBucket('service-images', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        });
        
        if (createError) {
          console.error('❌ Error creating bucket:', createError);
        } else {
          console.log('✅ Created service-images bucket successfully');
        }
      } else {
        console.log('✅ service-images bucket already exists');
      }
    }
    
    // Step 2: Test if image_url column exists by trying to select it
    console.log('2️⃣ Checking if image_url column exists in services table...');
    
    const { data, error } = await supabase
      .from('services')
      .select('id, image_url')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST204') {
        console.log('⚠️ image_url column does not exist. This needs to be added via SQL migration.');
        console.log('📝 You need to run this SQL in your Supabase SQL Editor:');
        console.log('');
        console.log('ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;');
        console.log('COMMENT ON COLUMN public.services.image_url IS \'URL to the service image stored in Supabase storage\';');
        console.log('');
      } else {
        console.error('❌ Error checking services table:', error);
      }
    } else {
      console.log('✅ image_url column exists in services table');
    }
    
    // Step 3: Test file upload
    console.log('3️⃣ Testing file upload to service-images bucket...');
    
    const testContent = 'test file content';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('service-images')
      .upload('test/test.txt', testBlob);
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
    } else {
      console.log('✅ Upload test successful');
      
      // Clean up test file
      await supabase.storage
        .from('service-images')
        .remove(['test/test.txt']);
    }
    
    console.log('');
    console.log('🎉 Setup completed! If you saw any errors above, please address them in the Supabase dashboard.');
    
  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
}

setupServiceImages();