import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { StatusUpdateSchema } from '@/utils/validators';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const supabase = createSupabaseServerClient(authHeader);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    
    // Validate optional fields for update
    const validatedData = StatusUpdateSchema.parse(body);

    const id = parseInt(resolvedParams.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Server-Side Role Validation to prevent Self-Approval Bug
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isOfficerOrAdmin = profile?.role === 'admin' || profile?.role === 'officer';

    if ((validatedData.status !== undefined || validatedData.remarks !== undefined) && !isOfficerOrAdmin) {
      return NextResponse.json({ error: 'Forbidden: Only officers/admins can modify status or remarks' }, { status: 403 });
    }

    // Build update object based on what is provided
    const updateData: any = { ...body };

    const { data, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert([
      {
        application_id: data.id,
        action: 'UPDATED',
        performed_by: user.id
      }
    ]);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const supabase = createSupabaseServerClient(authHeader);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Log the deletion before actually deleting, because we need the application ID
    await supabase.from('audit_logs').insert([
      {
        application_id: id,
        action: 'DELETED',
        performed_by: user.id
      }
    ]);

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
