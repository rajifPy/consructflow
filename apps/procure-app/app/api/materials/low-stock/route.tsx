// ============================================
// apps/procure-app/app/api/materials/low-stock/route.ts
// API to get low stock materials with notifications
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@constructflow/shared-db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('project_id');

    let query = supabaseAdmin
      .from('materials')
      .select(`
        *,
        projects(name, project_manager_id),
        suppliers(name, contact_person, phone)
      `);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: allMaterials } = await query;

    // Filter low stock materials (where quantity <= reorder_level)
    const lowStock = allMaterials?.filter(
      (m: any) => m.quantity_on_hand <= m.reorder_level
    ) || [];

    // Group by project
    const byProject = lowStock.reduce((acc: any, material: any) => {
      const projectId = material.project_id;
      if (!acc[projectId]) {
        acc[projectId] = {
          project: material.projects,
          materials: []
        };
      }
      acc[projectId].materials.push(material);
      return acc;
    }, {});

    return NextResponse.json({
      total: lowStock.length,
      byProject,
      materials: lowStock
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}