import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Quick DB check to ensure backend is fully connected
    const { error } = await supabase.from('applications').select('id').limit(1);
    
    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      status: 'UP', 
      database: 'CONNECTED',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ 
      status: 'DOWN', 
      database: 'DISCONNECTED',
      error: err.message,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
