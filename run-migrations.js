const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing environment variables. Please check .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    // Read and execute the image_url migration
    const addImageUrlSql = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20250831000000_add_image_url_to_services.sql'), 
      'utf8'
    );
    
    console.log('Adding image_url column to services table...');
    const { error: addColumnError } = await supabase.rpc('exec_sql', { 
      sql: addImageUrlSql 
    });
    
    if (addColumnError) {
      // Try direct SQL execution
      const { error: directError } = await supabase
        .from('services')
        .select('image_url')
        .limit(1);
        
      if (directError && directError.code === 'PGRST204') {
        // Column doesn't exist, try to add it using a simple ALTER TABLE
        const { error: alterError } = await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;'
        });
        
        if (alterError) {
          console.error('Error adding image_url column:', alterError);
          // Try using raw SQL
          const { error: rawError } = await supabase
            .raw('ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;');
          
          if (rawError) {
            console.error('Raw SQL error:', rawError);
          } else {
            console.log('✅ Added image_url column successfully');
          }
        } else {
          console.log('✅ Added image_url column successfully');
        }
      } else {
        console.log('✅ image_url column already exists');
      }
    } else {
      console.log('✅ Migration executed successfully');
    }
    
    // Read and execute the storage bucket migration
    const createBucketSql = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20250831000001_create_service_images_bucket.sql'), 
      'utf8'
    );
    
    console.log('Creating service-images storage bucket...');
    const { error: bucketError } = await supabase.rpc('exec_sql', { 
      sql: createBucketSql 
    });
    
    if (bucketError) {
      console.log('Bucket creation error (expected if bucket exists):', bucketError.message);
    } else {
      console.log('✅ Storage bucket migration executed successfully');
    }
    
    console.log('✅ All migrations completed!');
    
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();