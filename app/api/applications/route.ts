import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// Helper to generate receipt number
const generateReceiptNo = () => {
  const year = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RTI-${year}-${randomStr}`;
};

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseServerClient(request.headers.get('Authorization'));
    
    const { searchParams } = new URL(request.url);
    const pageStr = searchParams.get('page');
    const limitStr = searchParams.get('limit');
    const searchStr = searchParams.get('search');
    const statusStr = searchParams.get('status');
    
    let query = supabase
      .from('applications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (searchStr) {
      query = query.ilike('applicant', `%${searchStr}%`);
    }

    if (statusStr && statusStr !== 'All') {
      query = query.eq('status', statusStr);
    }

    if (pageStr && limitStr) {
      const page = parseInt(pageStr, 10);
      const limit = parseInt(limitStr, 10);
      
      if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
      }
    }

    const { data, count, error } = await query;

    if (error) throw error;
    
    if (pageStr && limitStr) {
      return NextResponse.json({ data, total: count });
    } else {
      return NextResponse.json(data);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const supabase = createSupabaseServerClient(authHeader);
    
    // Get user id to link the application
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const receipt_no = generateReceiptNo();
    
    const { data, error } = await supabase
      .from('applications')
      .insert([
        {
          applicant: body.applicant,
          email: body.email,
          status: body.status || 'Pending',
          user_id: user.id,
          receipt_no: receipt_no,
          document_url: body.document_url || null,
          remarks: body.remarks || null
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await supabase.from('audit_logs').insert([
      {
        application_id: data.id,
        action: 'CREATED',
        performed_by: user.id
      }
    ]);

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
