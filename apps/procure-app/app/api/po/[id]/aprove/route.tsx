// ============================================
// apps/procure-app/app/api/po/[id]/approve/route.ts
// Server-side API Route for PO Approval with Budget Check
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@constructflow/shared-db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await request.json();

    // 1. Get PO details
    const { data: po, error: poError } = await supabaseAdmin
      .from('purchase_orders')
      .select('*, projects(budget)')
      .eq('id', params.id)
      .single();

    if (poError || !po) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // 2. Check if PO is in correct status
    if (po.status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'PO is not pending approval' },
        { status: 400 }
      );
    }

    // 3. Budget check - Get total approved POs for this project
    const { data: approvedPOs } = await supabaseAdmin
      .from('purchase_orders')
      .select('total_amount')
      .eq('project_id', po.project_id)
      .eq('status', 'approved');

    const totalSpent = approvedPOs?.reduce(
      (sum, item) => sum + (item.total_amount || 0), 
      0
    ) || 0;

    const projectBudget = po.projects?.budget || 0;
    const newTotal = totalSpent + po.total_amount;

    if (newTotal > projectBudget) {
      return NextResponse.json(
        { 
          error: 'Budget exceeded',
          details: {
            projectBudget,
            currentSpent: totalSpent,
            poAmount: po.total_amount,
            wouldExceedBy: newTotal - projectBudget
          }
        },
        { status: 400 }
      );
    }

    // 4. Approve PO
    const { error: updateError } = await supabaseAdmin
      .from('purchase_orders')
      .update({
        status: 'approved',
        approved_by: userId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true,
      message: 'Purchase order approved successfully',
      budgetInfo: {
        projectBudget,
        totalSpent: newTotal,
        remaining: projectBudget - newTotal
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}