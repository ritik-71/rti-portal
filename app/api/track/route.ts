import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const receipt_no = searchParams.get('receipt_no');

    if (!receipt_no) {
      return NextResponse.json({ error: 'Receipt number is required' }, { status: 400 });
    }

    // Use the admin client to bypass RLS safely without exposing public SELECT.
    const { data, error } = await supabaseAdmin
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
