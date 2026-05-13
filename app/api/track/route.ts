import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const receipt_no = searchParams.get('receipt_no');

    if (!receipt_no) {
      return NextResponse.json({ error: 'Receipt number is required' }, { status: 400 });
    }

    // Use the base supabase client (anon key) to fetch by receipt_no
    // RLS policies must allow public read for applications if we want this to work without auth
    // Or we use a service role key if we want it to be "controlled" public access.
    // In db_upgrade.sql, I should ensure there is a policy for this.
    const { data, error } = await supabase
      .from('applications')
      .select('applicant, email, status, receipt_no, created_at, remarks')
      .eq('receipt_no', receipt_no)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
